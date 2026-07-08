import { TaxonomyEdge } from '../types'
import { normalizeSource, WIKILINK_RE, INDEX_NN_RE } from './markdown'

export function parseIndexBlock(content: string): TaxonomyEdge[] {
  const edges: TaxonomyEdge[] = []
  const lines = normalizeSource(content).split('\n')
  const stack: Array<{ name: string; depth: number }> = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('*') && !trimmed.startsWith('-')) continue
    const depth = line.search(/\S/) / 2

    // Support both [[wikilinks]] and _NN index: Name syntax
    let name: string | null = null
    const wikiMatch = trimmed.match(WIKILINK_RE)
    if (wikiMatch) {
      name = wikiMatch[0].slice(2, -2)
    } else {
      const fMatch = trimmed.match(INDEX_NN_RE)
      if (fMatch) {
        name = fMatch[1].trim()
      }
    }
    if (!name) continue

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) stack.pop()

    if (stack.length > 0 && depth > (stack[stack.length - 1].depth ?? -1)) {
      edges.push({ parent: stack[stack.length - 1].name, child: name })
    }
    stack.push({ name, depth })
  }
  return edges
}

export function printTaxonomyNode(
  name: string,
  allEdges: TaxonomyEdge[],
  lines: string[],
  depth: number,
): void {
  const indent = '  '.repeat(depth)
  lines.push(`${indent}* [[${name}]]`)
  const children = allEdges.filter((e) => e.parent === name)
  for (const child of children) {
    printTaxonomyNode(child.child, allEdges, lines, depth + 1)
  }
}
