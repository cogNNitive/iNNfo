export interface ParsedSourceRef {
  sourceId: string
  filePath: string
  fileName: string
  startLine?: number
  endLine?: number
  isValid: boolean
}

/**
 * Utility to parse source references in the format:
 * - src-003 (sources/markdown/The_Goonies.md#L13)
 * - src-001 (raw/interview.pdf#L12-L45)
 * - sources/markdown/document.md#L4
 */
export function parseSourceRef(input: string): ParsedSourceRef {
  if (!input || typeof input !== 'string') {
    return { sourceId: '', filePath: '', fileName: '', isValid: false }
  }

  const clean = input.trim()

  // Match pattern: src-003 (sources/markdown/The_Goonies.md#L13) or src-001 (raw/doc.pdf#L10-L20)
  const regex = /(src-\d+)\s*\(([^#)]+)(?:#L?(\d+)(?:-L?(\d+))?)?\)/i
  const match = clean.match(regex)
  if (match) {
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

  // Fallback pattern if format is sources/markdown/path.md#L13 without explicit src- prefix
  if (clean.includes('sources/markdown/') || clean.includes('raw/')) {
    const fileMatch = clean.match(/((?:sources\/markdown\/|raw\/)[^\s#)]+)(?:#L?(\d+)(?:-L?(\d+))?)?/i)
    if (fileMatch) {
      const filePath = fileMatch[1].trim()
      const fileName = filePath.split(/[/\\]/).pop() || filePath
      const startLine = fileMatch[2] ? parseInt(fileMatch[2], 10) : undefined
      const endLine = fileMatch[3] ? parseInt(fileMatch[3], 10) : startLine

      return {
        sourceId: 'src-ref',
        filePath,
        fileName,
        startLine,
        endLine,
        isValid: true,
      }
    }
  }

  return { sourceId: '', filePath: '', fileName: '', isValid: false }
}
