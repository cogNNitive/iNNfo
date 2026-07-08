import {
  TaxonomyEdge,
  ElementsMap,
  MatrixData,
  TreeNode,
  SpecFrontmatter,
  Relationship,
  AnalysisEntry,
} from '../types'
import { normalizeSource, WIKILINK_RE, parseMarkdownTable } from './markdown'

/** Build a hierarchical tree from taxonomy + elements + hierarchy matrices.
 *  Hierarchy matrices are matrices named like `{src}-{tgt} hierarchy matrix`.
 *  Elements with concept types that appear in the taxonomy chain are placed at the correct depth. */
export function buildHierarchyTree(
  taxonomy: TaxonomyEdge[],
  elements: ElementsMap,
  matrices: MatrixData[],
): TreeNode[] {
  const roots: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()

  // Build flat node list from elements
  for (const [, elementNodes] of elements.entries()) {
    for (const en of elementNodes) {
      const id = en.name.toLowerCase().replace(/\s+/g, '-')
      nodeMap.set(id, {
        id,
        name: en.name,
        type: en.type,
        description: en.description,
        fields: en.fields,
        markers: en.markers,
        children: [],
      })
    }
  }

  // Apply taxonomy edges
  for (const edge of taxonomy) {
    const parentId = edge.parent.toLowerCase().replace(/\s+/g, '-')
    const childId = edge.child.toLowerCase().replace(/\s+/g, '-')
    const parent = nodeMap.get(parentId)
    const child = nodeMap.get(childId)
    if (parent && child) {
      parent.children.push(child)
    }
  }

  // Apply hierarchy matrices: rows marked with 'X' become parent→child
  for (const matrix of matrices) {
    const mn = matrix.name.toLowerCase()
    if (mn.includes('hierarchy matrix') || mn.includes('jerarqu')) {
      for (const cell of matrix.cells) {
        if (cell.value.toLowerCase() === 'x') {
          const parentId = cell.col.toLowerCase().replace(/\s+/g, '-')
          const childId = cell.row.toLowerCase().replace(/\s+/g, '-')
          const parent = nodeMap.get(parentId)
          const child = nodeMap.get(childId)
          if (parent && child && !parent.children.includes(child)) {
            parent.children.push(child)
          }
        }
      }
    }
  }

  // Collect roots (nodes that are not children of any other node)
  const allChildren = new Set<string>()
  for (const [, node] of nodeMap) {
    for (const child of node.children) {
      allChildren.add(child.id)
    }
  }
  for (const [id, node] of nodeMap) {
    if (!allChildren.has(id)) {
      roots.push(node)
    }
  }

  // Return taxonomy-edge roots if the tree is empty
  if (roots.length === 0 && taxonomy.length > 0) {
    const rootNames = taxonomy
      .filter((e) => !taxonomy.some((p) => p.child === e.parent))
      .map((e) => e.parent)
    for (const name of rootNames) {
      const id = name.toLowerCase().replace(/\s+/g, '-')
      if (nodeMap.has(id)) roots.push(nodeMap.get(id)!)
    }
  }

  return roots
}

/** Extract relationships from graph_edges frontmatter and wikilinks in element descriptions. */
export function extractRelationships(
  frontmatter: SpecFrontmatter,
  elements: ElementsMap,
): Relationship[] {
  const rels: Relationship[] = []

  // From frontmatter graph_edges
  const graphEdges = frontmatter.graph_edges as
    Array<{ target: string; label: string; weight?: number }> | undefined
  if (graphEdges) {
    for (const edge of graphEdges) {
      rels.push({
        sourceId: frontmatter.title ?? '',
        targetId: edge.target,
        label: edge.label,
        value: edge.weight,
      })
    }
  }

  // From wikilinks in element descriptions and names
  for (const [, elementNodes] of elements.entries()) {
    for (const el of elementNodes) {
      const sourceId = el.name
      const textToScan = el.name + ' ' + el.description
      const matches = textToScan.match(WIKILINK_RE)
      if (matches) {
        for (const m of matches) {
          const target = m.slice(2, -2)
          if (target !== el.name) {
            rels.push({ sourceId, targetId: target, label: 'references' })
          }
        }
      }
      // Also scan fields for wikilinks
      for (const [, v] of Object.entries(el.fields)) {
        if (typeof v === 'string' && v.includes('[[')) {
          const fm = v.match(WIKILINK_RE)
          if (fm) {
            for (const m of fm) {
              const target = m.slice(2, -2)
              rels.push({ sourceId, targetId: target, label: 'references' })
            }
          }
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return rels.filter((r) => {
    const key = `${r.sourceId}||${r.targetId}||${r.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Parse an Analysis Evaluations section from raw body content.
 *  Detects sections titled "Analysis" or "Evaluation" and extracts structured entries. */
export function extractAnalysis(rawContent: string): AnalysisEntry[] {
  const content = normalizeSource(rawContent)
  const entries: AnalysisEntry[] = []
  // Look for analysis/evaluation sections
  const sectionRe = /^#\s+(.*an?lisis|.*evaluation|.*analysis)(.*)$/im
  const match = content.match(sectionRe)
  if (!match) return entries

  const afterHeader = content.slice(match.index! + match[0].length)
  const sectionBody = afterHeader.split(/(?=^#\s)/m)[0] || afterHeader

  // Parse table or bullet-list entries
  const tableRows = parseMarkdownTable(sectionBody)
  if (tableRows.length > 0) {
    for (const row of tableRows) {
      const keys = Object.keys(row)
      if (keys.length >= 4) {
        entries.push({
          timestamp: row[keys[0]] || '',
          evaluator: row[keys[1]] || '',
          evaluatorType: (row[keys[2]] || '').toLowerCase().includes('ai') ? 'ai' : 'human',
          score: Number(row[keys[3]]) || 0,
          comment: row[keys[4]] || '',
        })
      }
    }
  } else {
    // Try bullet list format: `- **Evaluator**: score — comment`
    const bulletRe = /^\s*[*-]\s+\*\*(.+?)\*\*:\s*(\d+(?:\.\d+)?)\s*[—–-]+\s*(.+)$/gm
    let bm: RegExpExecArray | null
    while ((bm = bulletRe.exec(sectionBody)) !== null) {
      entries.push({
        timestamp: '',
        evaluator: bm[1].trim(),
        evaluatorType: 'human',
        score: Number(bm[2]),
        comment: bm[3].trim(),
      })
    }
  }

  return entries
}
