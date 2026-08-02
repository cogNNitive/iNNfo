import { parseFrontmatter } from '@cognnitive/innfo-core'
import { normalizeMatrixDecl } from '@cognnitive/innfo-core'
import { extractTemplateSchemaFromContent } from '@cognnitive/innfo-core'
import type { LocalMetamodel } from '@cognnitive/innfo-core'
import type { ModelNode } from '../model/types'
import type { DirectoryHandleLike, FileHandleLike } from '../model/fs-types'
import { MATRIX_DEFS_KEY } from '../composables/useMatrixDefinitions'

/**
 * Frontmatter shape this resolver reads. Kept local (and partial) so callers
 * don't have to widen to `any` just to reach `parent_spec`.
 */
interface SpecFrontmatter {
  parent_spec?: { name?: string; url?: string }
  concepts?: Array<Record<string, unknown>>
  markers?: Array<Record<string, unknown>>
  matrices?: Array<Record<string, unknown>>
}

interface LocalSpecResult {
  content: string
  filename: string
}

/** Recursively search a directory handle for a spec file matching `reqName`. */
async function findLocalSpecInHandle(
  dirHandle: DirectoryHandleLike,
  reqName: string,
): Promise<LocalSpecResult | null> {
  const targetName = reqName.toLowerCase()
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file') {
      const lowerFile = name.toLowerCase()
      if (
        lowerFile === `${targetName}_nn.md` ||
        lowerFile === `${targetName}.md` ||
        lowerFile === targetName ||
        (lowerFile.startsWith(targetName) && lowerFile.endsWith('.md'))
      ) {
        const file = await (handle as FileHandleLike).getFile()
        return { content: await file.text(), filename: name }
      }
    } else if (handle.kind === 'directory') {
      const found = await findLocalSpecInHandle(handle as DirectoryHandleLike, reqName)
      if (found !== null) return found
    }
  }
  return null
}

/**
 * Dev-only fallback: resolves a template from the repo's `specs/latest`
 * directory (served by vite at `/specs/latest`). `parentName` is a canonical
 * name like `procedures_V_0-3-0`; the latest folder uses unversioned stable
 * names, so we derive the folder/slug (`procedures`) and load its `_NN.md`.
 */
async function tryDevLocalTemplate(parentName: string): Promise<string | null> {
  if (!import.meta.env.DEV) return null
  const slug = parentName.replace(/_V_\d+-\d+-\d+$/, '')
  if (!slug || slug === parentName) return null
  const localUrl = `/specs/latest/level2/${slug}/${slug}_NN.md`
  try {
    const resp = await fetch(localUrl)
    if (!resp.ok) return null
    return await resp.text()
  } catch {
    return null
  }
}

/**
 * Resolves parent_spec URLs for level-3 models and injects template concepts as
 * synthetic root nodes so concept colors can be located without relying on
 * co-location. Mutates `nodes`/`rootIds` in place.
 *
 * Resolution order per model: (1) local `.specs/` directory, (2) network fetch
 * of `parent_spec.url` (persisted back to `.specs/` when a handle is available).
 * Best-effort: network failures or missing templates degrade gracefully.
 */
export async function resolveParentSpecs(
  nodes: Record<string, ModelNode>,
  rootIds: string[],
  handle?: DirectoryHandleLike,
): Promise<void> {
  for (const rootId of rootIds) {
    const root = nodes[rootId]
    if (!root?.rawContent) continue

    const fm = parseFrontmatter(root.rawContent) as SpecFrontmatter
    const parentUrl = fm?.parent_spec?.url
    const parentName = fm?.parent_spec?.name
    if (!parentUrl || !parentName) continue

    // Skip if already loaded as a peer root with concepts.
    // Name comparison: strip trailing _NN from node name since parent_spec.name
    // (e.g. "business_V_0-1-1") doesn't include it but the filename-derived node
    // name does (e.g. "business_V_0-1-1_NN").
    const normalizedParent = parentName.replace(/_NN$/, '')
    const existingPeer = rootIds.find((rid) => {
      if (rid === rootId) return false
      const candidate = nodes[rid]
      if (!candidate?.localMetamodel?.concepts?.length) return false
      const candidateName = candidate.name?.replace(/_NN$/, '')
      return candidateName === normalizedParent
    })
    if (existingPeer) continue

    let text = ''
    let specFilename = ''
    if (handle) {
      try {
        const specsDir = await handle.getDirectoryHandle('.specs')
        const localResult = await findLocalSpecInHandle(specsDir, parentName)
        if (localResult) {
          text = localResult.content
          specFilename = `.specs/${localResult.filename}`
        }
      } catch {
        // specs directory not found or error accessing it
      }
    }

    if (!text) {
      const devLocal = await tryDevLocalTemplate(parentName)
      if (devLocal) {
        text = devLocal
        specFilename = `spec:${parentName}`
      }
    }

    if (!text) {
      try {
        const resp = await fetch(parentUrl)
        if (!resp.ok) continue
        text = await resp.text()
        // Persist to .specs/ when handle is available
        if (handle) {
          specFilename = `.specs/${parentName.replace(/\.md$/i, '')}${parentName.endsWith('_NN') ? '' : '_NN'}.md`
          try {
            const specsDir = await handle.getDirectoryHandle('.specs', { create: true })
            const fileHandle = await specsDir.getFileHandle(specFilename.replace('.specs/', ''), {
              create: true,
            })
            if (fileHandle.createWritable) {
              const w = await fileHandle.createWritable()
              await w.write(text)
              await w.close()
            }
          } catch (e) {
            console.warn(`[template] Could not persist spec to .specs/:`, e)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.warn(`[template] Failed to resolve parent spec "${parentUrl}": ${message}`)
        continue
      }
    }

    try {
      // Templates declare their schema as body elements that instantiate the
      // root primitives (Concept/Field/Marker/Matrix Definition) — there is no
      // frontmatter `concepts` block anymore.
      const schema = extractTemplateSchemaFromContent(text)
      if (!schema.concepts.length && !schema.matrices.length) continue

      // Propagate template matrix declarations to the model root node
      if (schema.matrices.length > 0 && !root.fields[MATRIX_DEFS_KEY]) {
        root.fields[MATRIX_DEFS_KEY] = {
          value: schema.matrices.map((m) => normalizeMatrixDecl(m as unknown as Record<string, unknown>)),
          provenance: {
            author: { kind: 'system', id: 'parser' },
            timestamp: new Date().toISOString(),
          },
        }
      }

      if (!schema.concepts.length) continue

      const templateId = `spec:${parentName}`
      if (nodes[templateId]) continue

      const concepts = schema.concepts.map((c) => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        weight: c.weight,
        fields: c.fields,
      }))

      const markers = schema.markers.map((m) => ({
        name: m.name,
        icon: m.icon,
        color: m.color,
        symbol: m.symbol,
      }))

      nodes[templateId] = {
        id: templateId,
        name: parentName,
        parentId: null,
        childIds: [],
        type: 'category',
        kind: 'root' as const,
        localMetamodel: { concepts, markers } as LocalMetamodel,
        fields: {},
        markers: {},
        relationships: [],
        rawSections: {},
        source: { path: specFilename || `spec:${parentName}` },
        sourceMode: 'structural' as const,
        rawContent: text,
      }
      rootIds.push(templateId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[template] Failed to parse parent spec "${parentName}": ${message}`)
    }
  }
}
