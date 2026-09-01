import type { DirectoryHandleLike, FileHandleLike } from '../fs-types'
import type { ModelDriver } from '../types'
import { IdentityRegistry } from '../identity'
import type { ParseContext, RecursiveParseResult } from './types'
import { stripMdSuffix } from './paths'
import { parseAndRegisterModel } from './model'
import { parseModel } from '../parser'

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
 * (e.g. "sources/nn/model.md" or "./models/a_NN.md") with
 * "Name is not allowed", so references like `[[./models/a_NN.md]]` or
 * `[a](./sources/nn/a.md)` must be resolved segment by segment.
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

async function findPrimaryWorkspaceFile(
  root: DirectoryHandleLike,
  driver?: ModelDriver,
): Promise<{ path: string; name: string; content: string } | null> {
  if (driver) {
    try {
      const children = await driver.listChildren('')
      const workspaceEntry = children.find(
        (c) => c.name.toLowerCase().startsWith('workspace') && c.name.endsWith(INNFO_FILE_SUFFIX),
      )
      if (workspaceEntry) {
        const parsed = await driver.readModel(workspaceEntry.uri || workspaceEntry.name)
        return {
          path: workspaceEntry.uri || workspaceEntry.name,
          name: stripMdSuffix(basenameOf(workspaceEntry.name)),
          content: parsed.rawContent,
        }
      }
    } catch {
      for (const name of ['workspace_01.md', 'workspace_NN.md', 'workspace.md']) {
        try {
          const parsed = await driver.readModel(name)
          return { path: name, name: stripMdSuffix(name), content: parsed.rawContent }
        } catch {
          // continue
        }
      }
    }
    return null
  }

  for await (const [name, entry] of root.entries()) {
    if (
      entry.kind === 'file' &&
      name.toLowerCase().startsWith('workspace') &&
      name.endsWith(INNFO_FILE_SUFFIX) &&
      !isIgnoredPath(name)
    ) {
      try {
        const fileHandle = await root.getFileHandle(name)
        const file = await fileHandle.getFile()
        const content = await file.text()
        return { path: name, name: stripMdSuffix(name), content }
      } catch {
        // continue
      }
    }
  }
  return null
}

function extractSubmodelRefs(
  entrypointContent: string,
  entrypointPath: string,
): Array<{ name: string; path: string }> {
  const modelRefs: Array<{ name: string; path: string }> = []

  const addRef = (target: string) => {
    const cleanTarget = target.trim()
    if (
      cleanTarget.endsWith(INNFO_FILE_SUFFIX) &&
      cleanTarget.toLowerCase() !== INDEX_MD &&
      cleanTarget.toLowerCase() !== entrypointPath.toLowerCase() &&
      !isIgnoredPath(cleanTarget)
    ) {
      const ref = { name: stripMdSuffix(basenameOf(cleanTarget)), path: cleanTarget }
      if (!modelRefs.some((r) => r.path === ref.path)) {
        modelRefs.push(ref)
      }
    }
  }

  // 1. Extract path:: fields from ModelRef or any concept elements
  try {
    const parsed = parseModel(entrypointContent)
    for (const [, elementNodes] of parsed.elements.entries()) {
      for (const el of elementNodes) {
        if (el.fields['path'] && typeof el.fields['path'] === 'string') {
          addRef(el.fields['path'])
        }
      }
    }
  } catch {
    // ignore parse error, fallback to regex extraction
  }

  // 2. Extract Wikilinks: [[target.md]]
  const body = entrypointContent.replace(/^---[\s\S]*?---\n?/, '').trim()
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null
  while ((match = wikilinkRegex.exec(body)) !== null) {
    addRef(match[1])
  }

  // 3. Extract Markdown links: [text](target.md)
  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
  while ((match = mdLinkRegex.exec(body)) !== null) {
    addRef(match[2])
  }

  return modelRefs
}

/**
 * Parses a workspace by reading `workspace_NN.md` (or matching `workspace_*_NN.md`)
 * as the primary entry point, falling back to legacy `index.md`, or a root directory scan.
 */
export async function recursiveParse(
  root: DirectoryHandleLike,
  driver?: ModelDriver,
): Promise<RecursiveParseResult> {
  const ctx: ParseContext = { nodes: {}, identity: new IdentityRegistry(), issues: [] }
  const elementNameToModel = new Map<string, string>()

  // Step 1: Search primary entrypoint workspace_NN.md
  const primary = await findPrimaryWorkspaceFile(root, driver)

  let entrypointContent: string | null = null
  let entrypointPath: string = ''

  if (primary) {
    entrypointContent = primary.content
    entrypointPath = primary.path
    await parseAndRegisterModel(primary.content, primary.path, primary.name, ctx, elementNameToModel)
  } else {
    // Step 2: Fallback to legacy index.md
    try {
      if (driver) {
        const parsed = await driver.readModel(INDEX_MD)
        entrypointContent = parsed.rawContent
      } else {
        const indexHandle = await root.getFileHandle(INDEX_MD)
        const indexFile = await indexHandle.getFile()
        entrypointContent = await indexFile.text()
      }
      entrypointPath = INDEX_MD
    } catch (err) {
      if (!isNotFound(err)) {
        return {
          nodes: {},
          rootIds: [],
          issues: [{ path: '<root>', message: err instanceof Error ? err.message : String(err) }],
        }
      }
    }
  }

  // Fallback 3: Neither workspace_NN.md nor index.md exists -> scan root for standalone .md files
  if (!entrypointContent) {
    if (!driver) {
      const modelRefsFromScan: Array<{ name: string; path: string }> = []
      for await (const [name, entry] of root.entries()) {
        if (
          entry.kind === 'file' &&
          name.endsWith(INNFO_FILE_SUFFIX) &&
          name.toLowerCase() !== INDEX_MD &&
          !isIgnoredPath(name)
        ) {
          modelRefsFromScan.push({ name: stripMdSuffix(name), path: name })
        }
      }

      for (const ref of modelRefsFromScan) {
        try {
          const fileHandle = await resolveFileHandle(root, ref.path)
          const file = await fileHandle.getFile()
          const content = await file.text()
          await parseAndRegisterModel(content, ref.path, ref.name, ctx, elementNameToModel)
        } catch (scanErr) {
          ctx.issues.push({
            path: ref.path,
            message: scanErr instanceof Error ? scanErr.message : String(scanErr),
          })
        }
      }
    }

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

  // Step 3: Extract submodel references from entrypoint (ModelRef path:: fields, wikilinks, md links)
  const modelRefs = extractSubmodelRefs(entrypointContent, entrypointPath)

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
          message: `Referenced model "${ref.path}" not found — skipping`,
        })
        continue
      }
      ctx.issues.push({
        path: ref.path,
        message: err instanceof Error ? err.message : String(err),
      })
      continue
    }

    await parseAndRegisterModel(content, ref.path, ref.name, ctx, elementNameToModel)
  }

  const rootIds = Object.values(ctx.nodes)
    .filter((n) => n.parentId === null)
    .map((n) => n.id)

  return { nodes: ctx.nodes, rootIds, issues: ctx.issues }
}
