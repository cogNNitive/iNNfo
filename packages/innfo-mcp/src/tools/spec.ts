/**
 * get_spec and get_template tools.
 *
 * The MCP is publisher-agnostic: it never stores spec/template URLs or
 * template names as constants. A spec/template is resolved ONLY from:
 *   1. an explicit `url` supplied by the caller, or
 *   2. the `parent_spec.url` declared by a loaded model (`model_id`).
 *
 * Resolution runs through `resolveParentChain` (innfo-core), which walks
 * the self-describing parent chain up to level 0, caching locally.
 */

import { join, basename } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import {
  getTemplate as coreGetTemplate,
  getFormatSpec,
  parseFrontmatter,
  SpecResolutionError,
  resolveTemplatePath,
  getTemplateSearchPaths,
  UnresolvedTemplateError,
} from '@cognnitive/innfo-core'
import { mkdir, copyFile, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import type { SpecDocument, SpecCache } from '@cognnitive/innfo-core'
import { resolveParentChainNode } from './resolver-node.js'

/**
 * Derive a chain-start name from a spec/template URL.
 * `.../iNNfo_V_0-1-0_NN.md` → `iNNfo_V_0-1-0`.
 */
export function deriveNameFromUrl(url: string): string {
  return basename(url)
    .replace(/\.(md|markdown)$/i, '')
    .replace(/_(NN|FORMAT|F)$/i, '')
}

import { normalizeId } from './list-read.js'

export { normalizeId }

/**
 * Locate a model file on disk by id.
 *
 * Searches the root directory and the conventional `models/` subdirectory
 * (iNNfo workspace layout). For each directory it tries, in order:
 *   `<cleanId>_NN.md`, `<cleanId>.md`, `<cleanId>`, `<id>`, `<id>.md`.
 *
 * The `<id>.md` candidate is what makes ids that already end in `_NN`
 * (e.g. `LC_programas_Tutorias_V_0-1-0_NN`) resolve to the exact file
 * `LC_programas_Tutorias_V_0-1-0_NN.md` instead of failing with
 * "Model not found".
 */
export async function findModelFile(rootDir: string, id: string): Promise<string | null> {
  const cleanId = normalizeId(id)
  const searchDirs = [rootDir, join(rootDir, 'models')]
  for (const dir of searchDirs) {
    const candidates = [
      join(dir, `${cleanId}_NN.md`),
      join(dir, `${cleanId}.md`),
      join(dir, cleanId),
      join(dir, id),
      join(dir, `${id}.md`),
    ]
    for (const fp of candidates) {
      try {
        await stat(fp)
        return fp
      } catch {
        continue
      }
    }
  }

  if (cleanId.toLowerCase().startsWith('workspace') || id.toLowerCase().startsWith('workspace')) {
    const { readdir } = await import('node:fs/promises')
    for (const dir of searchDirs) {
      try {
        const files = await readdir(dir)
        const wsFile = files.find(
          (f) => f.toLowerCase().startsWith('workspace') && f.toLowerCase().endsWith('.md'),
        )
        if (wsFile) {
          return join(dir, wsFile)
        }
      } catch {
        continue
      }
    }
  }

  return null
}

/**
 * Read a model's `parent_spec` reference ({ url, name }) from disk.
 * Returns null when the model is missing or declares no resolvable parent.
 */
export async function readParentSpecUrl(
  rootDir: string,
  modelId: string,
): Promise<{ url: string; name: string } | null> {
  const filePath = await findModelFile(rootDir, modelId)
  if (!filePath) return null
  const content = await readFile(filePath, 'utf-8').catch(() => null)
  if (!content) return null
  const fm = parseFrontmatter(content)
  const url = fm?.parent_spec?.url
  const name = fm?.parent_spec?.name
  return url && name ? { url, name } : null
}

/**
 * Get the iNNfo specification (level-1) for a spec/template URL or a model.
 *
 * @param opts.url     Explicit spec/template URL to resolve from.
 * @param opts.modelId Model id whose `parent_spec.url` seeds resolution.
 *
 * Returns `{ spec: null, specCache: null }` when neither input is provided.
 */
export async function getSpec(
  rootDir: string,
  opts: { url?: string; modelId?: string },
): Promise<{ spec: SpecDocument | null; specCache: SpecCache | null }> {
  let url = opts.url
  let name: string | undefined

  if (!url && opts.modelId) {
    const parent = await readParentSpecUrl(rootDir, opts.modelId)
    if (parent) {
      url = parent.url
      name = parent.name
    }
  }

  if (!url) return { spec: null, specCache: null }
  if (!name) name = deriveNameFromUrl(url)

  try {
    const cache = await resolveParentChainNode(rootDir, url, name)
    // get_spec always returns the level-1 iNNfo spec from the resolved chain,
    // falling back to the requested document when no level-1 is present.
    const spec = getFormatSpec(cache) ?? cache.specs.get(name) ?? null
    return { spec, specCache: cache }
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'SpecResolutionError' || err instanceof SpecResolutionError)
    ) {
      throw err
    }
    return { spec: null, specCache: null }
  }
}

/**
 * Resolve a template document directly from a URL — the model's own
 * `parent_spec.url` is the source of truth. No hardcoded names or base URLs.
 */
export async function getTemplateFromUrl(
  rootDir: string,
  url: string,
  name: string,
): Promise<SpecDocument | null> {
  try {
    const cache = await resolveParentChainNode(rootDir, url, name)
    // Prefer a level-2/3 template from the walked chain; fall back to
    // whatever was resolved for the requested name itself (e.g. a level-1
    // spec requested directly) — it's already in `cache.specs`, no need to
    // re-read anything from disk.
    return coreGetTemplate(cache) ?? cache.specs.get(name) ?? null
  } catch (err) {
    // Surface the actionable resolution detail (searched locations) to the
    // caller so validate_model output can include it; other failures keep the
    // null fallback behavior.
    if (
      err instanceof Error &&
      (err.name === 'SpecResolutionError' || err instanceof SpecResolutionError)
    ) {
      throw err
    }
    return null
  }
}

/**
 * Like `getTemplateFromUrl`, but also returns the full resolved `SpecCache`
 * (parent chain + every `includes` target) and an `IncludeResolver` bound to
 * it — so a caller can pass template composition through to innfo-core's
 * `validateModel` / `resolveTemplateSchema` without re-reading anything.
 */
export async function resolveTemplateWithCache(
  rootDir: string,
  url: string,
  name: string,
): Promise<{
  template: SpecDocument | null
  cache: SpecCache | null
  resolveInclude: (ref: { name: string; url: string }) => string | null
}> {
  let cache: SpecCache | null = null
  try {
    cache = await resolveParentChainNode(rootDir, url, name)
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'SpecResolutionError' || err instanceof SpecResolutionError)
    ) {
      throw err
    }
    cache = null
  }
  const template = cache ? (coreGetTemplate(cache) ?? cache.specs.get(name) ?? null) : null
  const resolveInclude = (ref: { name: string; url: string }): string | null => {
    if (!cache) return null
    const direct = cache.specs.get(ref.name)
    if (direct) return direct.rawContent
    for (const doc of cache.specs.values()) {
      if (doc.name.toLowerCase() === ref.name.toLowerCase()) return doc.rawContent
    }
    return null
  }
  return { template, cache, resolveInclude }
}

/**
 * Resolve a template from a loaded model, deriving the URL from its
 * `parent_spec.url`. Returns null when the model declares no parent.
 */
export async function getTemplateFromModel(
  rootDir: string,
  modelId: string,
): Promise<SpecDocument | null> {
  const parent = await readParentSpecUrl(rootDir, modelId)
  if (!parent) return null
  return getTemplateFromUrl(rootDir, parent.url, parent.name)
}

export interface DiscoveredTemplate {
  name: string
  version: string
  source: 'workspace' | 'global' | string
  filePath: string
  skillName?: string
}

export async function listTemplates(
  rootDir: string,
  opts?: { globalDir?: string; skillsDir?: string },
): Promise<DiscoveredTemplate[]> {
  const globalDir = opts?.globalDir ?? join(homedir(), '.agents', 'templates')
  const skillsDir = opts?.skillsDir ?? join(homedir(), '.agents', 'skills')

  const discovered: DiscoveredTemplate[] = []
  const seenNames = new Set<string>()

  const scanDir = async (
    dir: string,
    source: 'workspace' | 'global' | 'skill',
    skillName?: string,
  ) => {
    try {
      const files = await readdir(dir, { withFileTypes: true })
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.md')) {
          const filePath = join(dir, file.name)
          const stem = file.name.replace(/\.md$/i, '')
          if (seenNames.has(stem)) continue
          seenNames.add(stem)

          let version = 'V_0-1-0'
          try {
            const content = await readFile(filePath, 'utf-8')
            const fm = parseFrontmatter(content)
            if (fm?.version) version = String(fm.version)
            else if (fm?.spec_version) version = String(fm.spec_version)
          } catch {
            // Unreadable or malformed template — fall back to the default version.
          }

          discovered.push({
            name: stem,
            version,
            source: source === 'skill' ? `skill:${skillName}` : source,
            filePath,
            ...(skillName ? { skillName } : {}),
          })
        }
      }
    } catch {
      // Directory absent for this tier — contributes no templates.
    }
  }

  await scanDir(join(rootDir, 'templates'), 'workspace')
  await scanDir(join(rootDir, 'specs'), 'workspace')
  await scanDir(globalDir, 'global')

  try {
    const skillEntries = await readdir(skillsDir, { withFileTypes: true })
    for (const entry of skillEntries) {
      if (entry.isDirectory()) {
        await scanDir(join(skillsDir, entry.name, 'templates'), 'skill', entry.name)
        await scanDir(join(skillsDir, entry.name), 'skill', entry.name)
      }
    }
  } catch {
    // No skills directory installed — skip the skill tier.
  }

  return discovered
}

export interface HydrateTemplateResult {
  success: boolean
  templateName: string
  targetPath: string
  source: string
  message?: string
}

export async function hydrateTemplate(
  rootDir: string,
  templateName: string,
  opts?: { targetDir?: string; globalDir?: string; skillsDir?: string },
): Promise<HydrateTemplateResult> {
  const globalTemplatesDir = opts?.globalDir ?? join(homedir(), '.agents', 'templates')
  const skillsDir = opts?.skillsDir ?? join(homedir(), '.agents', 'skills')

  const location = await resolveTemplatePath(templateName, {
    workspaceDir: rootDir,
    globalTemplatesDir,
    skillsDir,
  })

  if (!location) {
    const checkedPaths = await getTemplateSearchPaths(templateName, {
      workspaceDir: rootDir,
      globalTemplatesDir,
      skillsDir,
    })
    throw new UnresolvedTemplateError(templateName, checkedPaths)
  }

  const targetDir = opts?.targetDir ?? join(rootDir, 'templates')
  await mkdir(targetDir, { recursive: true })

  const fileName = templateName.endsWith('.md') ? templateName : `${templateName}.md`
  const targetPath = join(targetDir, fileName)

  await copyFile(location.filePath, targetPath)

  return {
    success: true,
    templateName,
    targetPath,
    source: location.source,
    message: `Hydrated template ${templateName} from ${location.source} to ${targetPath}`,
  }
}
