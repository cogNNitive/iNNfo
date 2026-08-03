export interface ParsedSourceRef {
  filePath: string
  fileName: string
  startLine?: number
  endLine?: number
  isValid: boolean
}

/**
 * Parser for iNNfo source-reference pointers.
 * Canonical format is a workspace-relative path under `sources/markdown/`,
 * optionally followed by a line anchor: `sources/markdown/<path>.md#L<start>`
 * or `sources/markdown/<path>.md#L<start>-L<end>`.
 * Example: `sources/markdown/The_Goonies.md#L13`
 *
 * The `sources/markdown/` prefix is the disambiguation signal that a string
 * is a genuine source reference (rather than arbitrary plain-string field
 * content) — no synthetic `src-NNN` id is used anymore.
 *
 * No legacy fallbacks or tolerant heuristics permitted.
 */
export function parseSourceRef(input: string): ParsedSourceRef {
  if (!input || typeof input !== 'string') {
    return { filePath: '', fileName: '', isValid: false }
  }

  const clean = input.trim()

  // Canonical pattern: sources/markdown/path/file.ext#L13 or sources/markdown/path/file.ext#L13-L20
  const canonicalRegex = /^(sources\/markdown\/[^#]+?)(?:#L(\d+)(?:-L(\d+))?)?$/i
  const match = clean.match(canonicalRegex)
  if (!match) {
    return { filePath: '', fileName: '', isValid: false }
  }

  const filePath = match[1].trim()
  const fileName = filePath.split(/[/\\]/).pop() || filePath
  const startLine = match[2] ? parseInt(match[2], 10) : undefined
  const endLine = match[3] ? parseInt(match[3], 10) : startLine

  return {
    filePath,
    fileName,
    startLine,
    endLine,
    isValid: true,
  }
}
