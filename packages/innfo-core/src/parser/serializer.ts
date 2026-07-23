import { ParsedModel } from '../types'
import { stringify as yamlStringify } from 'yaml'
import { printTaxonomyNode } from './taxonomy'

export function serializeModel(model: ParsedModel): string {
  const lines: string[] = []
  const fm = model.frontmatter
  lines.push('---')
  lines.push(`spec_version: "${fm.spec_version || 'V_0-2-0'}"`)
  if (fm.spec_url) lines.push(`spec_url: "${fm.spec_url}"`)
  if (fm.level !== undefined) lines.push(`level: ${fm.level}`)
  if (fm.parent_spec) {
    lines.push('parent_spec:')
    lines.push(`  name: "${fm.parent_spec.name}"`)
    lines.push(`  url: "${fm.parent_spec.url}"`)
  }
  if (fm.model_version) lines.push(`model_version: "${fm.model_version}"`)
  if (fm.title) lines.push(`title: "${fm.title}"`)
  if (fm.mode) lines.push(`mode: "${fm.mode}"`)
  if ((fm as any).template !== undefined) {
    const val = (fm as any).template
    lines.push(yamlStringify({ template: val }).trim())
  }
  if ((fm as any).parent !== undefined) {
    const val = (fm as any).parent
    lines.push(yamlStringify({ parent: val }).trim())
  }
  if ((fm as any).last_saved !== undefined) {
    lines.push(`last_saved: "${(fm as any).last_saved}"`)
  }
  if ((fm as any).last_updated !== undefined) {
    lines.push(`last_updated: "${(fm as any).last_updated}"`)
  }

  // Matrix declarations
  const matrices = fm.matrices as
    Array<{ name: string; source: string; target: string; params: string }> | undefined
  if (matrices && matrices.length > 0) {
    lines.push('matrices:')
    for (const m of matrices) {
      lines.push(`  - name: "${m.name}"`)
      lines.push(`    source: "${m.source}"`)
      lines.push(`    target: "${m.target}"`)
      if (m.params) lines.push(`    params: "${m.params}"`)
    }
  }

  // Concept declarations (level-2 templates)
  if (fm.concepts && fm.concepts.length > 0) {
    lines.push('concepts:')
    for (const c of fm.concepts) {
      lines.push(`  - name: "${c.name}"`)
      if (c.icon) lines.push(`    icon: "${c.icon}"`)
      if (c.type) lines.push(`    type: "${c.type}"`)
      if (c.color) lines.push(`    color: "${c.color}"`)
      if (c.weight !== undefined) lines.push(`    weight: ${c.weight}`)
    }
  }

  // Marker declarations (level-2 templates)
  if (fm.markers && fm.markers.length > 0) {
    lines.push('markers:')
    for (const m of fm.markers) {
      lines.push(`  - name: "${m.name}"`)
      if (m.symbol) lines.push(`    symbol: "${m.symbol}"`)
      if (m.icon) lines.push(`    icon: "${m.icon}"`)
      if (m.color) lines.push(`    color: "${m.color}"`)
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('> [!NOTE]')
  lines.push(
    '> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/info-doc).',
  )
  lines.push('')

  if (model.taxonomy.length > 0) {
    lines.push('# _NN index')
    const allParents = new Set(model.taxonomy.map((e) => e.parent))
    const allChildren = new Set(model.taxonomy.map((e) => e.child))
    const rootNames = [...allParents].filter((p) => !allChildren.has(p))
    for (const rootName of rootNames) {
      printTaxonomyNode(rootName, model.taxonomy, lines, 0)
    }
    lines.push('')
  }

  for (const [conceptName, elementNodes] of model.elements.entries()) {
    lines.push(`# _NN ${conceptName}`)
    for (const node of elementNodes) {
      const prefix = '*' // all concept types use bullet syntax — numbered lists are not supported
      lines.push(`${prefix} _NN ${conceptName}: ${node.name}`)
      if (Object.keys(node.fields).length > 0) {
        lines.push('  ```yaml')
        for (const [k, v] of Object.entries(node.fields)) {
          lines.push(`  ${k}: ${JSON.stringify(v)}`)
        }
        lines.push('  ```')
      }
      if (node.description) {
        for (const descLine of node.description.split('\n')) {
          lines.push(`  ${descLine}`)
        }
      }
    }
    lines.push('')
  }

  for (const matrix of model.matrices) {
    if (matrix.cells.length === 0) continue
    lines.push(`# _NN matrices: ${matrix.name}`)
    const colSet = new Set(matrix.cells.map((c) => c.col))
    const rowSet = new Set(matrix.cells.map((c) => c.row))
    const cols = Array.from(colSet)
    const rows = Array.from(rowSet)
    const cellMap = new Map(matrix.cells.map((c) => [`${c.row}||${c.col}`, c.value]))

    const headerLine = `| ${matrix.source} \\ ${matrix.target} | ${cols.join(' | ')} |`
    const sepLine = `| :--- | ${cols.map(() => ':---:').join(' | ')} |`
    lines.push(headerLine)
    lines.push(sepLine)
    for (const row of rows) {
      const vals = cols.map((c) => cellMap.get(`${row}||${c}`) || '-')
      lines.push(`| ${row} | ${vals.join(' | ')} |`)
    }
    lines.push('')
  }

  // Node markers (item-markers matrix)
  const nodeMarkerEntries = Object.entries(model.nodeMarkers)
  if (nodeMarkerEntries.length > 0) {
    lines.push('# _NN matrices: item-markers matrix')
    // Collect all unique marker keys
    const markerKeys = new Set<string>()
    for (const [, markers] of nodeMarkerEntries) {
      for (const key of Object.keys(markers)) {
        markerKeys.add(key)
      }
    }
    const keys = Array.from(markerKeys)
    const headerLine = `| Item \\ Marker | ${keys.join(' | ')} |`
    const sepLine = `| :--- | ${keys.map(() => ':---:').join(' | ')} |`
    lines.push(headerLine)
    lines.push(sepLine)
    for (const [itemName, markers] of nodeMarkerEntries) {
      const vals = keys.map((k) => (markers[k] !== undefined ? String(markers[k]) : '-'))
      lines.push(`| ${itemName} | ${vals.join(' | ')} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
