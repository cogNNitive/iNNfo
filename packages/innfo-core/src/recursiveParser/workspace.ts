import type { DirectoryHandleLike, FileHandleLike } from '../fs-types'
import type { ModelDriver } from '../types'
import { IdentityRegistry } from '../identity'
import type { ParseContext, RecursiveParseResult } from './types'
import { stripMdSuffix } from './paths'
import { parseAndRegisterModel } from './model'

const INNFO_FILE_SUFFIX = '.md'
const INDEX_MD = 'index.md'

/** Directories whose contents are never parsed as models. */
export const IGNORED_DIRECTORIES = new Set(['backups', 'archive', 'specs'])

/**
 * Returns true when the error indicates a file/directory was not found.
 * Handles:
 * - Browser File API (DOMException with name 'NotFoundError')
 * - Fake FS (Error with message matching /file not found/i)
 * - Node.js fs (Error with code 'ENOENT')
 */
export function isNotFound(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'NotFoundError') return true
  if (err instanceof Error && /file not found/i.test(err.message)) return true
  if (err instanceof Error && (err as { code?: string }).code === 'ENOENT') return true
  return false
}

/**
 * Returns true when the given path is inside an ignored directory
 * (backups/, archive/, specs/).
 */
export function isIgnoredPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/')
  const firstSegment = normalized.split('/')[0]
  return IGNORED_DIRECTORIES.has(firstSegment)
}

/**
 * Splits a workspace-relative reference into clean path segments,
 * tolerating `./` prefixes, backslashes and redundant slashes.
 */
function pathSegments(refPath: string): string[] {
  return refPath
    .replace(/\\/g, '/')
    .split('/')
    .filter((p) => p && p !== '.')
}

/** Returns the last path segment of a workspace-relative reference (the filename). */
function basenameOf(refPath: string): string {
  const segments = pathSegments(refPath)
  return segments[segments.length - 1] ?? refPath
}

/**
 * Resolves a (possibly nested) relative reference to a file handle by walking
 * directory segments with getDirectoryHandle before the final getFileHandle.
 *
 * The File System Access API rejects any name that contains a path separator
 * (e.g. "sources/markdown/model.md" or "./models/a_NN.md") with
 * "Name is not allowed", so references like `[[./models/a_NN.md]]` or
 * `[a](./sources/markdown/a.md)` must be resolved segment by segment.
 *
 * References that escape the workspace root (`..`) are treated as not found
 * (unsupported) instead of surfacing a "Name is not allowed" error.
 */
async function resolveFileHandle(
  root: DirectoryHandleLike,
  refPath: string,
): Promise<FileHandleLike> {
  const segments = pathSegments(refPath)
  let current: DirectoryHandleLike = root
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i] === '..') {
      throw Object.assign(new Error('File not found'), { code: 'ENOENT' })
    }
    current = await current.getDirectoryHandle(segments[i])
  }
  const last = segments[segments.length - 1]
  if (last === '..') {
    throw Object.assign(new Error('File not found'), { code: 'ENOENT' })
  }
  return current.getFileHandle(last)
}

/**
 * Parses a workspace by reading `index.md` as the single entry point.
 *
 * Step 1: Read index.md from root handle (or driver)
 * Step 2: Extract wikilink targets from index.md body (any `.md` file)
 * Step 3: For each wikilink target → resolve file, parseModel, normalize elements
 * Step 4: Report identity collisions
 *
 * Only files with a valid iNNfo YAML frontmatter (`spec_version` field) are
 * registered as models — plain Markdown files are silently skipped.
 *
 * **Fallback**: When `index.md` is missing and no `driver` is provided, the
 * root directory is scanned for standalone `.md` files (excluding `index.md`)
 * and each valid iNNfo model is loaded as an independent root node. The
 * missing-index.md issue is still reported as the first warning in `issues[]`.
 *
 * **Naming convention**: The `_NN.md` suffix is RECOMMENDED (§8.1) but no
 * longer required — any `.md` filename works. The validator reports a warning
 * for files that don't follow the convention.
 *
 * When `driver` is provided, model reads go through `driver.readModel()` instead of
 * raw DirectoryHandleLike interactions.
 */
export async function recursiveParse(
  root: DirectoryHandleLike,
  driver?: ModelDriver,
): Promise<RecursiveParseResult> {
  const ctx: ParseContext = { nodes: {}, identity: new IdentityRegistry(), issues: [] }

  // Step 1: Read index.md
  let indexContent: string
  try {
    if (driver) {
      const parsed = await driver.readModel('index.md')
      indexContent = parsed.rawContent
    } else {
      const indexHandle = await root.getFileHandle('index.md')
      const indexFile = await indexHandle.getFile()
      indexContent = await indexFile.text()
    }
  } catch (err) {
    if (isNotFound(err)) {
      // Fallback: when index.md is missing, scan root for standalone .md files
      if (!driver) {
        const modelRefsFromScan: Array<{ name: string; path: string }> = []
        for await (const [name, entry] of root.entries()) {
          // Accept any .md file except index.md itself
          if (
            entry.kind === 'file' &&
            name.endsWith(INNFO_FILE_SUFFIX) &&
            name.toLowerCase() !== INDEX_MD &&
            !isIgnoredPath(name)
          ) {
            modelRefsFromScan.push({ name: stripMdSuffix(name), path: name })
          }
        }

        const elementNameToModel = new Map<string, string>()
        for (const ref of modelRefsFromScan) {
          let content: string
          try {
            const fileHandle = await resolveFileHandle(root, ref.path)
            const file = await fileHandle.getFile()
            content = await file.text()
          } catch (scanErr) {
            if (isNotFound(scanErr)) {
              ctx.issues.push({
                path: ref.path,
                message: `Referenced model "${ref.path}" not found — skipping`,
              })
              continue
            }
            ctx.issues.push({
              path: ref.path,
              message: scanErr instanceof Error ? scanErr.message : String(scanErr),
            })
            continue
          }

          await parseAndRegisterModel(content, ref.path, ref.name, ctx, elementNameToModel)
        }
      }

      // Add the missing index.md issue as the first warning (downgraded when fallback found models)
      const rootCount = Object.values(ctx.nodes).filter((n) => n.parentId === null).length
      ctx.issues.unshift({
        path: '<root>',
        message:
          rootCount > 0
            ? `No index.md found — loaded ${rootCount} standalone model(s) from root directory`
            : 'Missing index.md — workspace root must contain an index.md file',
      })

      const rootIds = Object.values(ctx.nodes)
        .filter((n) => n.parentId === null)
        .map((n) => n.id)

      return { nodes: ctx.nodes, rootIds, issues: ctx.issues }
    }
    return {
      nodes: {},
      rootIds: [],
      issues: [{ path: '<root>', message: err instanceof Error ? err.message : String(err) }],
    }
  }

  // Step 2: Extract model file references from index.md body (strip frontmatter).
  // Supports two formats:
  //   1. Wikilinks: [[Model_V_1-0-0_template_NN.md]]
  //   2. Markdown links: [Model](Model_V_1-0-0_template_NN.md) — per iNNfo spec
  const body = indexContent.replace(/^---[\s\S]*?---\n?/, '').trim()
  const modelRefs: Array<{ name: string; path: string }> = []

  // Wikilinks: [[target]]
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null
  while ((match = wikilinkRegex.exec(body)) !== null) {
    const target = match[1].trim()
    if (
      target.endsWith(INNFO_FILE_SUFFIX) &&
      target.toLowerCase() !== INDEX_MD &&
      !isIgnoredPath(target)
    ) {
      const ref = { name: stripMdSuffix(basenameOf(target)), path: target }
      if (!modelRefs.some((r) => r.path === ref.path)) modelRefs.push(ref)
    }
  }

  // Markdown links: [text](url) — per iNNfo spec
  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
  while ((match = mdLinkRegex.exec(body)) !== null) {
    const target = match[2].trim()
    if (
      target.endsWith(INNFO_FILE_SUFFIX) &&
      target.toLowerCase() !== INDEX_MD &&
      !isIgnoredPath(target)
    ) {
      const ref = { name: stripMdSuffix(basenameOf(target)), path: target }
      if (!modelRefs.some((r) => r.path === ref.path)) modelRefs.push(ref)
    }
  }

  // Step 3: Parse each model
  // Track element name -> model mapping for cross-model collision detection (FR-005)
  const elementNameToModel = new Map<string, string>()

  for (const ref of modelRefs) {
    let content: string

    try {
      if (driver) {
        const parsed = await driver.readModel(ref.path)
        content = parsed.rawContent
      } else {
        const fileHandle = await resolveFileHandle(root, ref.path)
        const file = await fileHandle.getFile()
        content = await file.text()
      }
    } catch (err) {
      if (isNotFound(err)) {
        ctx.issues.push({
          path: ref.path,
          message: `Wikilink target "${ref.path}" not found — skipping`,
        })
        continue
      }
      ctx.issues.push({
        path: ref.path,
        message: err instanceof Error ? err.message : String(err),
      })
      continue
    }

    // Parse and register the model (shared helper — also used by index.md fallback)
    await parseAndRegisterModel(content, ref.path, ref.name, ctx, elementNameToModel)
  }

  const rootIds = Object.values(ctx.nodes)
    .filter((n) => n.parentId === null)
    .map((n) => n.id)

  return { nodes: ctx.nodes, rootIds, issues: ctx.issues }
}
