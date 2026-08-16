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
import { getTemplate as coreGetTemplate, getFormatSpec, parseFrontmatter, SpecResolutionError } from '@cognnitive/innfo-core'
import type { SpecDocument, SpecCache } from '@cognnitive/innfo-core'
import { resolveParentChainNode } from './resolver-node.js'

/**
 * Derive a chain-start name from a spec/template URL.
 * `.../iNNfo_V_0-1-0_NN.md` → `iNNfo_V_0-1-0`.
 */
export function deriveNameFromUrl(url: string): string {
  return basename(url)
    .replace(/\.(md|markdown)$/i, '')
    .replace(/_NN$/i, '')
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
