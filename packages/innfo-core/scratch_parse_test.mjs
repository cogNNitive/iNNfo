import fs from 'fs'

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g
const INDEX_NN_RE = /_NN\s+index:\s*(.*)$/

function normalizeSource(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/<!--\s*(_NN\b[^>]*?)\s*-->/g, '$1')
}

function parseIndexBlock(content) {
  const edges = []
  const lines = normalizeSource(content).split('\n')
  const stack = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('*') && !trimmed.startsWith('-')) continue
    const depth = line.search(/\S/) / 2

    let name = null
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

const filePath = 'C:\\Users\\lucas\\.gemini\\antigravity\\brain\\0b63bbd1-1389-49df-afb3-4f1cc2a2bbed\\.system_generated\\steps\\160\\content.md'
const content = fs.readFileSync(filePath, 'utf-8')

// Extraemos la sección del índice
const lines = content.split('\n')
const indexLines = []
let inIndex = false
for (const line of lines) {
  if (line.trim().startsWith('# _NN index')) {
    inIndex = true
    continue
  }
  if (inIndex) {
    if (line.trim().startsWith('#') && !line.trim().startsWith('# _NN index')) {
      break
    }
    indexLines.push(line)
  }
}
const indexContent = indexLines.join('\n')
console.log('Index Content length:', indexContent.length)

const edges = parseIndexBlock(indexContent)
console.log('Parsed taxonomy edges:', edges.length)
console.log('Sample edges:', JSON.stringify(edges.slice(0, 10), null, 2))
