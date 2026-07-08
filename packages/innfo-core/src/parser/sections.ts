import { ElementNode, MatrixCell } from '../types'
import { parseYaml } from './yaml'
import { parseMarkdownTable } from './markdown'

const NN_ELEMENT_RE = /^\s*[*-]\s+_NN\s+([\w\s-]+?):\s+(.*)$/

export function sectionName(rawTitle: string): string | null {
  // _NN syntax: `_NN ConceptName` or `_NN matrices: Name`
  const fm = rawTitle.match(/^_NN\s+(?:(matrices):\s*(.*)|(.*))/)
  if (fm) {
    if (fm[1]) return fm[1] // 'matrices'
    if (fm[3] != null) return 'concepts' // implicit 'concepts' for bare ConceptName
  }
  return null
}

export function sectionTitle(rawTitle: string): string {
  // _NN syntax: `_NN ConceptName` or `_NN matrices: Name`
  const fm = rawTitle.match(/^_NN\s+(?:(matrices):\s*(.*)|(.*))/)
  if (fm) {
    if (fm[2]) return fm[2].trim() // matrix name
    if (fm[3] != null) return fm[3].trim() // concept name
  }
  return rawTitle
}

export function parseElementMarker(line: string): string | null {
  const match = line.match(NN_ELEMENT_RE)
  if (match) return match[2].trim()
  return null
}

export function parseConceptSection(conceptName: string, content: string): ElementNode[] {
  const nodes: ElementNode[] = []
  const lines = content.split('\n')
  let current: ElementNode | null = null
  let descriptionLines: string[] = []
  let yamlBuffer: string[] = []
  let inYaml = false

  for (const line of lines) {
    const elemName = parseElementMarker(line)
    if (elemName !== null) {
      if (current) {
        current.description = descriptionLines.join('\n').trim()
        nodes.push(current)
      }
      current = { type: conceptName, name: elemName, description: '', fields: {}, markers: {} }
      descriptionLines = []
      inYaml = false
      continue
    }

    if (line.trim().startsWith('```yaml')) {
      inYaml = true
      yamlBuffer = []
      continue
    }
    if (inYaml) {
      if (line.trim() === '```') {
        inYaml = false
        if (current) {
          current.fields = parseYaml(yamlBuffer.join('\n')) as Record<string, unknown>
          // Extract slug from fields if present (FR-002)
          if (typeof current.fields['slug'] === 'string') {
            current.slug = current.fields['slug'] as string
            delete current.fields['slug']
          }
        }
        continue
      }
      yamlBuffer.push(line)
      continue
    }

    if (!line.trim().startsWith('*') && !line.trim().startsWith('-')) {
      descriptionLines.push(line)
    }
  }

  if (current) {
    current.description = descriptionLines.join('\n').trim()
    nodes.push(current)
  }

  return nodes
}

export function parseMatrixSection(content: string, _matrixName: string): MatrixCell[] {
  const rows = parseMarkdownTable(content)
  if (rows.length === 0) return []
  const colNames = Object.keys(rows[0] || {})
  const cells: MatrixCell[] = []
  for (const row of rows) {
    const rowName = colNames.length > 0 ? row[colNames[0]] || '' : ''
    for (let i = 1; i < colNames.length; i++) {
      if (row[colNames[i]]) {
        cells.push({ row: rowName, col: colNames[i], value: row[colNames[i]] })
      }
    }
  }
  return cells
}

export function getSectionType(rawTitle: string): 'index' | 'concept' | 'matrix' | 'other' {
  const sn = sectionName(rawTitle)
  if (!sn) return 'other'
  const s = sn.toLowerCase()
  if (s === 'concepts') {
    const name = sectionTitle(rawTitle).toLowerCase()
    if (name === 'index') return 'index'
    return 'concept'
  }
  if (s === 'matrices') return 'matrix'
  return 'other'
}
