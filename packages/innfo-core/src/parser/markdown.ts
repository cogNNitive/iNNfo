export const YAML_BLOCK_RE = /^---\r?\n([\s\S]*?)\r?\n---/
export const WIKILINK_RE = /\[\[([^\]]+)\]\]/g
export const INDEX_NN_RE = /_NN\s+index:\s*(.*)$/

/** Normalize raw source before pattern matching. Called once at every public
 *  parse entry point so downstream regexes and `split('\n')` calls see a
 *  canonical form: LF line endings (a trailing `\r` breaks `$`-anchored
 *  bullet/section patterns on CRLF-saved files) and visible `_NN` markers
 *  (the spec's hidden `<!-- _NN --> ` form is unwrapped to `_NN `). */
export function normalizeSource(text: string): string {
  return (
    text
      // CRLF/CR → LF so `$`-anchored patterns work on Windows-saved files.
      .replace(/\r\n?/g, '\n')
      // Unwrap the spec's *hidden* marker form (§8: `# <!-- _NN --> Name`,
      // `* <!-- _NN Concept: --> Name`) into the visible form so the single
      // set of `_NN` marker regexes matches both. Only comments whose content
      // starts with `_NN` are touched; ordinary HTML comments are left intact.
      .replace(/<!--\s*(_NN\b[^>]*?)\s*-->/g, '$1')
  )
}

export function parseMarkdownTable(md: string): Record<string, string>[] {
  const lines = normalizeSource(md)
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
  if (lines.length < 2) return []
  const header = parseTableRow(lines[0])
  if (lines.length < 3) return []
  return lines.slice(2).map((line) => {
    const cells = parseTableRow(line)
    const row: Record<string, string> = {}
    header.forEach((h, i) => {
      row[h] = cells[i] ?? ''
    })
    return row
  })
}

export function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .filter((_, i, a) => i > 0 && i < a.length - 1)
    .map((c) => c.trim())
}
