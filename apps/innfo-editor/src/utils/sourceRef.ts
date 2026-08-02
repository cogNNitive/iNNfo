export interface ParsedSourceRef {
  sourceId: string
  filePath: string
  fileName: string
  startLine?: number
  endLine?: number
  isValid: boolean
}

/**
 * Strict parser for iNNfo V_0-3-0 provenance pointers.
 * Enforces exactly ONE canonical format: `src-NNN (path#lines)`
 * Example: `src-003 (sources/markdown/The_Goonies.md#L13)`
 *
 * No legacy fallbacks or tolerant heuristics permitted.
 */
export function parseSourceRef(input: string): ParsedSourceRef {
  if (!input || typeof input !== 'string') {
    return { sourceId: '', filePath: '', fileName: '', isValid: false }
  }

  const clean = input.trim()

  // Canonical V_0-3-0 pattern: src-NNN (path/file.ext#L13) or src-NNN (path/file.ext#L13-L20)
  const canonicalRegex = /^(src-\d+)\s*\(([^#)]+)(?:#L?(\d+)(?:-L?(\d+))?)?\)$/i
  const match = clean.match(canonicalRegex)
  if (!match) {
    return { sourceId: '', filePath: '', fileName: '', isValid: false }
  }

  const sourceId = match[1]
  const filePath = match[2].trim()
  const fileName = filePath.split(/[/\\]/).pop() || filePath
  const startLine = match[3] ? parseInt(match[3], 10) : undefined
  const endLine = match[4] ? parseInt(match[4], 10) : startLine

  return {
    sourceId,
    filePath,
    fileName,
    startLine,
    endLine,
    isValid: true,
  }
}
