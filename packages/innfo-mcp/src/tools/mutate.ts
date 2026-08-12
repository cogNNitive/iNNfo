/**
 * validate_model and apply_change tools.
 *
 * validate_model runs the innfo-core validator against the resolved template.
 * apply_change performs intent-level operations on a model and re-validates.
 * On validation failure, the file is NOT written (reject-without-writing).
 */

import { readFile, writeFile, rm, stat, rename } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { parseModel, serializeModel, validateModel as coreValidate, applyMutation as coreApplyMutation, SpecResolutionError } from '@cognnitive/innfo-core'
import type { SpecDocument, ValidationError, ParsedModel } from '@cognnitive/innfo-core'

import { getTemplateFromUrl, findModelFile, deriveNameFromUrl, getSpec, normalizeId } from './spec.js'
import { isLocalPath, toLocalFilePath } from './resolver-node.js'

/* ── Types ───────────────────────────────────────────────────── */

export interface ApplyChangeResult {
  success: boolean
  model?: ParsedModel
  newPath?: string
  errors?: Array<{ path: string; message: string }>
  warnings?: Array<{ path: string; message: string }>
}

/* ── Core logic ──────────────────────────────────────────────── */

/**
 * Resolve a model's template from its `parent_spec.url` (source of truth).
 * Returns null when the model declares no resolvable parent.
 */
async function resolveTemplateForModel(
  rootDir: string,
  model: ParsedModel,
): Promise<SpecDocument | null> {
  const parent = model.frontmatter.parent_spec
  if (parent?.url && parent?.name) {
    return getTemplateFromUrl(rootDir, parent.url, parent.name)
  }
  return null
}

/**
 * Load a model: read + parse.
 */
async function loadModel(filePath: string): Promise<ParsedModel> {
  const content = await readFile(filePath, 'utf-8')
  return parseModel(content)
}

/**
 * Save a model: serialize + write.
 */
async function saveModel(filePath: string, model: ParsedModel): Promise<void> {
  const content = serializeModel(model)
  await writeFile(filePath, content, 'utf-8')
}

/* ── validate_model ──────────────────────────────────────────── */

/**
 * Validate a model against its template.
 * Provide either `id` (reads from disk) or `content` (inline raw text).
 */
export async function validateModel(
  rootDir: string,
  id?: string,
  content?: string,
  templateUrl?: string,
): Promise<{
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}> {
  let model: ParsedModel

  if (content) {
    model = parseModel(content)
  } else if (id) {
    const filePath = await findModelFile(rootDir, id)
    if (!filePath) {
      return {
        valid: false,
        errors: [{ path: '', message: `Model not found: ${id}`, severity: 'error' }],
        warnings: [],
      }
    }
    model = await loadModel(filePath)
  } else {
    return {
      valid: false,
      errors: [{ path: '', message: 'Provide either id or content', severity: 'error' }],
      warnings: [],
    }
  }

  // D1: Auto-detect Level 2 templates and delegate to validateTemplate
  if (model.frontmatter.level === 2) {
    return validateTemplate(rootDir, id, content, templateUrl)
  }

  // Resolve the template only from the model's parent_spec.url, or from an
  // explicit templateUrl supplied by the caller. Never from a constant.
  let template: SpecDocument | null = null
  let resolutionDetail: string | null = null
  try {
    template = await resolveTemplateForModel(rootDir, model)
    if (!template && templateUrl) {
      template = await getTemplateFromUrl(rootDir, templateUrl, deriveNameFromUrl(templateUrl))
    }
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'SpecResolutionError' || err instanceof SpecResolutionError)
    ) {
      resolutionDetail = err.message
    }
  }

  const result = coreValidate(model, template, null)
  const warnings: ValidationError[] = [...result.warnings]
  if (!template) {
    const parentUrl = (model.frontmatter as any)?.parent_spec?.url
    if (parentUrl) {
      // The model declares a parent that could not be resolved — this is a
      // hard error, not a structural-only warning. coreValidate already emits
      // [PARENT_RESOLUTION_FAILED]; surface the offending URL explicitly,
      // the directories searched, and the per-link resolution attempts.
      const searchedSuffix = ` (searched: ${rootDir}/specs, ${rootDir}/.specs, ${rootDir}/.spec-cache, direct relative path, network)`
      const detailSuffix = resolutionDetail ? ` Detail: ${resolutionDetail}` : ''
      result.errors.push({
        path: 'parent_spec',
        message: `[PARENT_RESOLUTION_FAILED] Parent template could not be resolved from parent_spec.url "${parentUrl}"${searchedSuffix}${detailSuffix}`,
        severity: 'error',
      })
    } else {
      warnings.push({
        path: 'parent_spec',
        message: 'No template resolved; structural validation only',
        severity: 'warning',
      })
    }
  }

  // D8: Decorate errors and warnings with originating file path
  const modelPath = id ? (await findModelFile(rootDir, id)) ?? id : 'inline'
  const templatePath = template?.name ? `${template.name}_NN.md` : 'parent_spec'

  const errors = result.errors.map((e) => ({
    ...e,
    filePath: e.path.startsWith('parent') ? templatePath : modelPath,
  }))

  const warningsWithFile = warnings.map((w) => ({
    ...w,
    filePath: w.path.startsWith('parent') ? templatePath : modelPath,
  }))

  return { valid: result.valid, errors, warnings: warningsWithFile }
}

/* ── apply_change ────────────────────────────────────────────── */

/** Matches the `_V_<major>-<minor>-<patch>_` segment in iNNfo filenames. */
const VERSION_FILENAME_RE = /_V_\d+-\d+-\d+_/

interface VersionParts {
  major: number
  minor: number
  patch: number
}

/** Parse `V_0-4-0`, `V_0.4.0`, `0-4-0`, ... into numeric parts. */
function parseVersion(v: string): VersionParts | null {
  const m = v.trim().match(/^V?_?(\d+)[-.](\d+)[-.](\d+)$/i)
  if (!m) return null
  return { major: parseInt(m[1], 10), minor: parseInt(m[2], 10), patch: parseInt(m[3], 10) }
}

function formatVersion(p: VersionParts): string {
  return `V_${p.major}-${p.minor}-${p.patch}`
}

/**
 * Compute the new model version from bump_version args.
 * Either an explicit `version` ("V_0-5-0") or a `bump` of
 * "major" | "minor" | "patch" (default patch) applied to the current
 * `model_version` frontmatter. Returns null when the args are invalid.
 */
function computeNewVersion(
  current: string | undefined,
  args: Record<string, unknown>,
): { version: string } | null {
  if (typeof args.version === 'string' && args.version.trim() !== '') {
    const parsed = parseVersion(args.version)
    if (!parsed) return null
    return { version: formatVersion(parsed) }
  }

  const bump = typeof args.bump === 'string' && args.bump.trim() !== '' ? args.bump.trim() : 'patch'
  if (!['major', 'minor', 'patch'].includes(bump)) return null
  if (!current) return null
  const parts = parseVersion(current)
  if (!parts) return null
  if (bump === 'major') parts.major += 1
  else if (bump === 'minor') parts.minor += 1
  else parts.patch += 1
  return { version: formatVersion(parts) }
}

/**
 * Apply the `bump_version` operation: set `frontmatter.model_version`, rename
 * the file to the canonical `_V_<version>_` filename, validate BEFORE writing,
 * and reject-without-writing on any failure.
 */
async function bumpVersion(
  rootDir: string,
  filePath: string,
  model: ParsedModel,
  args: Record<string, unknown>,
): Promise<ApplyChangeResult> {
  const next = computeNewVersion(model.frontmatter.model_version, args)
  if (!next) {
    return {
      success: false,
      errors: [
        {
          path: 'frontmatter.model_version',
          message:
            'Invalid version args for bump_version: provide { version: "V_x-y-z" } or { bump: "major" | "minor" | "patch" } against a valid model_version frontmatter',
        },
      ],
    }
  }

  model.frontmatter.model_version = next.version

  const dir = dirname(filePath)
  const base = basename(filePath)
  const versionSegment = next.version.replace(/^V_/i, '')
  const newBase = base.replace(VERSION_FILENAME_RE, `_V_${versionSegment}_`)
  const newPath = join(dir, newBase)

  // If parent_version is provided, rename/bump the parent spec (template) as well!
  let oldParentPath: string | null = null
  let newParentPath: string | null = null
  let parentContent: string | null = null
  let newParentName: string | null = null

  if (model.frontmatter.parent_spec && typeof args.parent_version === 'string') {
    const parentVer = args.parent_version.trim()
    const parentVerSegment = parentVer.replace(/^V_/i, '').replace(/\./g, '-')
    const parentVerString = `V_${parentVerSegment}`

    const currentParentUrl = model.frontmatter.parent_spec.url
    if (currentParentUrl && isLocalPath(currentParentUrl)) {
      const localParentPath = toLocalFilePath(currentParentUrl, rootDir)
      try {
        await stat(localParentPath)
        oldParentPath = localParentPath

        // Compute new parent file name and path
        const parentDir = dirname(localParentPath)
        const parentBase = basename(localParentPath)
        const newParentBase = parentBase.replace(VERSION_FILENAME_RE, `_V_${parentVerSegment}_`)
        newParentPath = join(parentDir, newParentBase)

        // Compute new parent spec name
        const currentParentName = model.frontmatter.parent_spec.name
        newParentName = currentParentName.replace(
          /_V_\d+-\d+-\d+$/,
          `_V_${parentVerSegment}`,
        )

        // Read and update the template file's frontmatter
        const rawParentContent = await readFile(localParentPath, 'utf-8')
        const parentModel = parseModel(rawParentContent)
        if (parentModel.frontmatter.level === 2) {
          parentModel.frontmatter.spec_version = parentVerString
        }
        parentContent = serializeModel(parentModel)
      } catch (err) {
        // Parent spec not found locally, skip template renaming but still update references
      }
    }

    // Update parent_spec in model frontmatter
    if (model.frontmatter.parent_spec.name && newParentName) {
      model.frontmatter.parent_spec.name = newParentName
    }
    if (model.frontmatter.parent_spec.url) {
      model.frontmatter.parent_spec.url = model.frontmatter.parent_spec.url.replace(
        VERSION_FILENAME_RE,
        `_V_${parentVerSegment}_`,
      )
    }
  }

  // Validate BEFORE writing/deleting anything.
  let template: SpecDocument | null
  try {
    template = await resolveTemplateForModel(rootDir, model)
  } catch (err) {
    return {
      success: false,
      errors: [{ path: 'parent_spec', message: err instanceof Error ? err.message : String(err) }],
    }
  }
  const validationResult = coreValidate(model, template, null)
  if (!validationResult.valid) {
    return {
      success: false,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    }
  }

  // Write the new versioned files (or rewrite in place), then remove the old.
  try {
    // 1. If parent template was bumped:
    if (oldParentPath && newParentPath && parentContent && newParentName) {
      if (newParentPath === oldParentPath) {
        await writeFile(oldParentPath, parentContent, 'utf-8')
      } else {
        await writeFile(newParentPath, parentContent, 'utf-8')
        await rm(oldParentPath, { force: true })
      }

      // Sync to .spec-cache
      const cacheDir = join(rootDir, '.spec-cache')
      await mkdir(cacheDir, { recursive: true })
      const cachePath = join(cacheDir, `${newParentName}_NN.md`)
      await writeFile(cachePath, parentContent, 'utf-8')
    }

    // 2. Write model file
    if (newPath === filePath) {
      await saveModel(filePath, model)
    } else {
      await saveModel(newPath, model)
      await rm(filePath, { force: true })
    }

    // 3. Update references in workspace index.md
    const indexPath = join(rootDir, 'index.md')
    try {
      let indexContent = await readFile(indexPath, 'utf-8')
      const oldRelPath = basename(filePath)
      const newRelPath = basename(newPath)

      const oldModelRel = join('models', oldRelPath).replace(/\\/g, '/')
      const newModelRel = join('models', newRelPath).replace(/\\/g, '/')

      let replaced = false
      if (indexContent.includes(oldRelPath)) {
        indexContent = indexContent.replaceAll(oldRelPath, newRelPath)
        replaced = true
      }
      if (indexContent.includes(oldModelRel)) {
        indexContent = indexContent.replaceAll(oldModelRel, newModelRel)
        replaced = true
      }

      if (replaced) {
        await writeFile(indexPath, indexContent, 'utf-8')
      }
    } catch {
      // index.md might not exist or be readable, ignore
    }
  } catch (err) {
    return { success: false, errors: [{ path: '', message: `Failed to write model: ${err}` }] }
  }

  return {
    success: true,
    model,
    newPath,
    warnings: validationResult.warnings,
  }
}

/**
 * Apply an intent-level change to a model.
 * Semantics: parse → mutate → serialize → validate.
 * On failure: reject-without-writing (file unchanged, errors returned).
 */
export async function applyChange(
  rootDir: string,
  id: string,
  op: string,
  args: Record<string, unknown>,
): Promise<ApplyChangeResult> {
  const filePath = await findModelFile(rootDir, id)
  if (!filePath) {
    return { success: false, errors: [{ path: '', message: `Model not found: ${id}` }] }
  }

  let model: ParsedModel
  try {
    model = await loadModel(filePath)
  } catch (err) {
    return { success: false, errors: [{ path: '', message: `Failed to load model: ${err}` }] }
  }

  if (op === 'bump_version') {
    return bumpVersion(rootDir, filePath, model, args)
  }

  if (op === 'generate_index') {
    let template: SpecDocument | null = null
    try {
      template = await resolveTemplateForModel(rootDir, model)
    } catch {}
    if (template) {
      const parsedTemplate = parseModel(template.rawContent)
      args.taxonomy = parsedTemplate.taxonomy
    }
  }

  // Apply the mutation via the core enforcement engine (R-IE-01)
  const mutationResult = coreApplyMutation(model, op, args as unknown as Record<string, unknown>)
  if (!mutationResult.success) {
    return mutationResult
  }

  // Validate after mutation — template resolved only from parent_spec.url.
  let template: SpecDocument | null
  try {
    template = await resolveTemplateForModel(rootDir, model)
  } catch (err) {
    return {
      success: false,
      errors: [{ path: 'parent_spec', message: err instanceof Error ? err.message : String(err) }],
    }
  }
  const validationResult = coreValidate(model, template, null)

  if (!validationResult.valid) {
    // Reject without writing
    return {
      success: false,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    }
  }

  // Write updated model
  try {
    await saveModel(filePath, model)
    if (op === 'rename_element' && typeof args.elementName === 'string' && typeof args.newName === 'string') {
      try {
        const modelDir = dirname(filePath)
        const oldSlug = args.elementName.toLowerCase().replace(/[^a-z0-9-]/g, '_')
        const newSlug = args.newName.toLowerCase().replace(/[^a-z0-9-]/g, '_')
        const oldAssetDir = join(modelDir, 'assets', oldSlug)
        const newAssetDir = join(modelDir, 'assets', newSlug)
        const st = await stat(oldAssetDir).catch(() => null)
        if (st && st.isDirectory()) {
          await rename(oldAssetDir, newAssetDir)
        }
      } catch {
        // Asset directory rename is best effort
      }
    }
  } catch (err) {
    return { success: false, errors: [{ path: '', message: `Failed to write model: ${err}` }] }
  }

  return {
    success: true,
    model,
    warnings: validationResult.warnings,
  }
}

/* ── validate_model_url ─────────────────────────────────────── */

/**
 * Validate a model fetched from a URL without writing to disk.
 * Accepts a model URL and optional template_url. Fetches the model content,
 * then delegates to validateModel (content mode).
 */
export async function validateModelUrl(
  rootDir: string,
  modelUrl: string,
  templateUrl?: string,
): Promise<{
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}> {
  let content: string
  try {
    const response = await fetch(modelUrl)
    if (!response.ok) {
      return {
        valid: false,
        errors: [{ path: '', message: `Failed to fetch model URL: ${response.status} ${response.statusText}`, severity: 'error' }],
        warnings: [],
      }
    }
    content = await response.text()
  } catch (err) {
    return {
      valid: false,
      errors: [{ path: '', message: `Model URL unreachable: ${err}`, severity: 'error' }],
      warnings: [],
    }
  }

  return validateModel(rootDir, undefined, content, templateUrl)
}

/* ── validate_template ──────────────────────────────────────── */

/**
 * Validate a Level 2 template against its Level 1 parent spec.
 * Auto-detects frontmatter `level === 2` and resolves parent spec from parent_spec.url or explicit url.
 * Emits [PARENT_RESOLUTION_FAILED] diagnostic error if the parent spec cannot be resolved.
 *
 * @param rootDir Workspace root directory
 * @param id Template model id on disk
 * @param content Raw template content string
 * @param url Explicit parent spec URL override
 */
export async function validateTemplate(
  rootDir: string,
  id?: string,
  content?: string,
  url?: string,
): Promise<{
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}> {
  let templateContent: string
  if (content) {
    templateContent = content
  } else if (id) {
    const filePath = await findModelFile(rootDir, id)
    if (!filePath) {
      return {
        valid: false,
        errors: [{ path: '', message: `Template file not found: ${id}`, severity: 'error' }],
        warnings: [],
      }
    }
    templateContent = await readFile(filePath, 'utf-8').catch(() => '')
    if (!templateContent) {
      return {
        valid: false,
        errors: [{ path: '', message: `Failed to read template file: ${id}`, severity: 'error' }],
        warnings: [],
      }
    }
  } else {
    return {
      valid: false,
      errors: [{ path: '', message: 'Provide either id or content', severity: 'error' }],
      warnings: [],
    }
  }

  const parsed = parseModel(templateContent)
  const fm = parsed.frontmatter

  const parentUrl = url ?? fm?.parent_spec?.url
  if (!parentUrl) {
    return {
      valid: false,
      errors: [
        {
          path: 'parent_spec',
          message: '[PARENT_RESOLUTION_FAILED] Parent spec URL missing for level-2 template',
          severity: 'error',
        },
      ],
      warnings: [],
    }
  }

  let parentSpec = null
  let resolutionDetail: string | null = null
  try {
    const result = await getSpec(rootDir, { url: parentUrl })
    parentSpec = result.spec
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'SpecResolutionError' || err instanceof SpecResolutionError)
    ) {
      resolutionDetail = err.message
    }
  }
  if (!parentSpec) {
    const detailSuffix = resolutionDetail ? ` Detail: ${resolutionDetail}` : ''
    return {
      valid: false,
      errors: [
        {
          path: 'parent_spec',
          message: `[PARENT_RESOLUTION_FAILED] Parent spec '${parentUrl}' could not be resolved${detailSuffix}`,
          severity: 'error',
        },
      ],
      warnings: [],
    }
  }

  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  if (fm?.level !== undefined && fm.level !== 2) {
    errors.push({
      path: 'frontmatter.level',
      message: `Expected level 2 for template, got ${fm.level}`,
      severity: 'error',
    })
  }

  if (!fm?.title) {
    errors.push({
      path: 'frontmatter.title',
      message: 'Missing title in template frontmatter',
      severity: 'error',
    })
  }

  const templatePath = id ? (await findModelFile(rootDir, id)) ?? id : 'inline'
  const decoratedErrors = errors.map((e) => ({ ...e, filePath: templatePath }))
  const decoratedWarnings = warnings.map((w) => ({ ...w, filePath: templatePath }))

  return {
    valid: errors.length === 0,
    errors: decoratedErrors,
    warnings: decoratedWarnings,
  }
}

/* ── All mutation operations delegated to innfo-core engine ─── */

export async function initModel(
  rootDir: string,
  id: string,
  args: {
    template_url: string
    template_name: string
    title?: string
    model_version?: string
  }
): Promise<{ success: boolean; filePath: string; content: string }> {
  const cleanId = normalizeId(id)
  let filePath = await findModelFile(rootDir, id)
  
  if (!filePath) {
    const modelsDir = join(rootDir, 'models')
    let useModelsDir = false
    try {
      const st = await stat(modelsDir)
      if (st.isDirectory()) {
        useModelsDir = true
      }
    } catch {}
    filePath = useModelsDir ? join(modelsDir, `${cleanId}_NN.md`) : join(rootDir, `${cleanId}_NN.md`)
  }

  let body = ''
  try {
    const currentContent = await readFile(filePath, 'utf-8')
    body = currentContent.replace(/^---[\s\S]*?---\n?/, '').trim()
  } catch {}

  const notice = `> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).`

  if (!body.includes('> [!NOTE]')) {
    body = body ? notice + '\n\n' + body : notice
  }

  const modelVersion = args.model_version || 'V_0-1-0'
  const title = args.title || cleanId

  const frontmatter = `---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md"
level: 3
parent_spec:
  name: "${args.template_name}"
  url: "${args.template_url}"
model_version: "${modelVersion}"
title: "${title}"
---`

  const newContent = frontmatter + '\n\n' + body + '\n'
  await writeFile(filePath, newContent, 'utf-8')

  return {
    success: true,
    filePath,
    content: newContent
  }
}
