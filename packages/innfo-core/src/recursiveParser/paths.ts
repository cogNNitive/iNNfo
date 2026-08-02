/**
 * Strips the final `.md` suffix from a filename to derive the model name.
 * Handles both `_NN.md` and bare `.md` filenames.
 */
export function stripMdSuffix(filename: string): string {
  return filename.replace(/_NN\.md$/i, '').replace(/\.md$/i, '')
}

/**
 * Resolves a relative graph edge target path to an absolute qualified node id.
 * Supports ../ for sibling directories, ../../ for ancestor jumps.
 */
export function resolveGraphEdgeTarget(target: string, sourcePath: string): string {
  const sourceDir = sourcePath.replace(/\/[^/]+\.md$/i, '')
  const sourceParts = sourceDir.split('/').filter(Boolean)
  const targetParts = target.split('/').filter(Boolean)

  const resultParts = [...sourceParts]
  for (const part of targetParts) {
    if (part === '..') {
      resultParts.pop()
    } else if (part !== '.') {
      resultParts.push(part)
    }
  }

  return resultParts.join('/')
}

/**
 * Inverse of resolveGraphEdgeTarget — converts an absolute qualified node id
 * back to a relative path from sourcePath.
 */
export function resolveQualifiedIdToPath(qualifiedId: string, sourcePath: string): string {
  const sourceParts = sourcePath
    .replace(/\/[^/]+\.md$/i, '')
    .split('/')
    .filter(Boolean)
  const targetParts = qualifiedId.split('/').filter(Boolean)

  let i = 0
  while (i < sourceParts.length && i < targetParts.length && sourceParts[i] === targetParts[i]) {
    i++
  }

  const result: string[] = []
  for (let j = i; j < sourceParts.length; j++) {
    result.push('..')
  }
  result.push(...targetParts.slice(i))

  return result.join('/')
}
