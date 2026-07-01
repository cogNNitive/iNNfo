import {
  SpecFrontmatter, ParsedModel, ElementNode, MatrixData, MatrixCell,
  TaxonomyEdge, ConceptType
} from './types';

const YAML_BLOCK_RE = /^---\n([\s\S]*?)\n---/;
const SECTION_RE = /^#\s+(.*)$/gm;
const CONCEPT_BLOCK_MARKER = '<!-- block: concepts -->';
const MATRIX_BLOCK_MARKER = '<!-- block: matrices -->';
const ELEMENT_BLOCK_RE = /<!--\s*block:\s+([\w\s-]+?)\s*-->\s*(.*)$/gm;
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;
const YAML_FENCE_RE = /```yaml\n([\s\S]*?)```/;

export function parseYaml(yamlStr: string): any {
  const lines = yamlStr.split(/\r?\n/);
  const root: any = {};
  const stack: Array<{ indent: number; key: string | null; data: any; type: 'object' | 'array' }> = [
    { indent: -1, key: null, data: root, type: 'object' }
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.search(/\S/);
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1];

    if (trimmed.startsWith('-')) {
      const rest = trimmed.substring(1).trim();
      if (parent.type !== 'array') {
        if (parent.key && stack.length >= 2) {
          const gp = stack[stack.length - 2];
          gp.data[parent.key] = [];
          parent.data = gp.data[parent.key];
          parent.type = 'array';
        }
      }
      if (rest === '') {
        const obj: any = {};
        parent.data.push(obj);
        stack.push({ indent, key: null, data: obj, type: 'object' });
      } else {
        const ci = rest.indexOf(':');
        if (ci !== -1) {
          const k = rest.substring(0, ci).trim();
          const v = parseYamlValue(rest.substring(ci + 1).trim());
          const obj = { [k]: v };
          parent.data.push(obj);
          stack.push({ indent, key: k, data: obj, type: 'object' });
        } else {
          parent.data.push(parseYamlValue(rest));
        }
      }
    } else {
      const ci = trimmed.indexOf(':');
      if (ci === -1) continue;
      const key = trimmed.substring(0, ci).trim();
      const valStr = trimmed.substring(ci + 1).trim();
      if (valStr === '') {
        parent.data[key] = {};
        stack.push({ indent, key, data: parent.data[key], type: 'object' });
      } else {
        parent.data[key] = parseYamlValue(valStr);
      }
    }
  }
  return root;
}

function parseYamlValue(v: string): any {
  v = v.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map(s => parseYamlValue(s.trim()));
  }
  if (v.includes('#') && !v.startsWith('"') && !v.startsWith("'")) v = v.split('#')[0].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v.toLowerCase() === 'null') return null;
  if (v.toLowerCase() === 'true') return true;
  if (v.toLowerCase() === 'false') return false;
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  if (/^\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

export function parseFrontmatter(content: string): SpecFrontmatter | null {
  const match = content.match(YAML_BLOCK_RE);
  if (!match) return null;
  return parseYaml(match[1]) as SpecFrontmatter;
}

export function parseMarkdownTable(md: string): Record<string, string>[] {
  const lines = md.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const header = parseTableRow(lines[0]);
  if (lines.length < 3) return [];
  return lines.slice(2).map(line => {
    const cells = parseTableRow(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
}

function parseTableRow(line: string): string[] {
  return line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
}

export function parseIndexBlock(content: string): TaxonomyEdge[] {
  const edges: TaxonomyEdge[] = [];
  const lines = content.split('\n');
  const stack: Array<{ name: string; depth: number }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('*') && !trimmed.startsWith('-')) continue;
    const depth = line.search(/\S/) / 2;
    const match = trimmed.match(WIKILINK_RE);
    if (!match) continue;
    const name = match[0].slice(2, -2);

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) stack.pop();

    if (stack.length > 0 && depth > (stack[stack.length - 1].depth ?? -1)) {
      edges.push({ parent: stack[stack.length - 1].name, child: name });
    }
    stack.push({ name, depth });
  }
  return edges;
}

function parseFencedYaml(text: string): Record<string, unknown> {
  const match = text.match(YAML_FENCE_RE);
  if (!match) return {};
  return parseYaml(match[1]) as Record<string, unknown>;
}

function parseConceptSection(conceptName: string, content: string): ElementNode[] {
  const nodes: ElementNode[] = [];
  const lines = content.split('\n');
  let current: ElementNode | null = null;
  let descriptionLines: string[] = [];
  let yamlBuffer: string[] = [];
  let inYaml = false;

  for (const line of lines) {
    const blockMatch = line.match(ELEMENT_BLOCK_RE);
    if (blockMatch) {
      if (current) {
        current.description = descriptionLines.join('\n').trim();
        nodes.push(current);
      }
      const name = line.replace(/.*<!--\s*block:\s*\S+\s*-->\s*/, '').trim();
      current = { type: conceptName, name, description: '', fields: {}, markers: {} };
      descriptionLines = [];
      inYaml = false;
      continue;
    }

    if (line.trim().startsWith('```yaml')) {
      inYaml = true;
      yamlBuffer = [];
      continue;
    }
    if (inYaml) {
      if (line.trim() === '```') {
        inYaml = false;
        if (current) {
          current.fields = parseYaml(yamlBuffer.join('\n')) as Record<string, unknown>;
        }
        continue;
      }
      yamlBuffer.push(line);
      continue;
    }

    if (!line.trim().startsWith('*') && !line.trim().startsWith('-')) {
      descriptionLines.push(line);
    }
  }

  if (current) {
    current.description = descriptionLines.join('\n').trim();
    nodes.push(current);
  }

  return nodes;
}

function parseMatrixSection(content: string, matrixName: string): MatrixCell[] {
  const rows = parseMarkdownTable(content);
  if (rows.length === 0) return [];
  const colNames = Object.keys(rows[0] || {});
  const cells: MatrixCell[] = [];
  for (const row of rows) {
    const rowName = colNames.length > 0 ? (row[colNames[0]] || '') : '';
    for (let i = 1; i < colNames.length; i++) {
      if (row[colNames[i]]) {
        cells.push({ row: rowName, col: colNames[i], value: row[colNames[i]] });
      }
    }
  }
  return cells;
}

function cleanTitle(title: string): string {
  return title.replace(CONCEPT_BLOCK_MARKER, '').replace(MATRIX_BLOCK_MARKER, '').trim();
}

export function getSectionType(title: string): 'index' | 'concept' | 'matrix' | 'other' {
  const t = title.trim();
  if (t.includes(CONCEPT_BLOCK_MARKER)) {
    const name = t.replace(CONCEPT_BLOCK_MARKER, '').trim();
    if (name.toLowerCase() === 'index') return 'index';
    return 'concept';
  }
  if (t.includes(MATRIX_BLOCK_MARKER)) return 'matrix';
  return 'other';
}

export function parseModel(content: string): ParsedModel {
  const frontmatter = parseFrontmatter(content);
  const elements = new Map<string, ElementNode[]>();
  const matrices: MatrixData[] = [];
  const nodeMarkers: Record<string, Record<string, number | string>> = {};
  let taxonomy: TaxonomyEdge[] = [];

  const body = content.replace(YAML_BLOCK_RE, '').trim();
  const sections = body.split(/(?=^#\s)/m);

  for (const section of sections) {
    const headerMatch = section.match(/^#\s+(.*)$/m);
    if (!headerMatch) continue;
    const rawTitle = headerMatch[1].trim();
    const type = getSectionType(rawTitle);
    const name = cleanTitle(rawTitle);
    const bodyContent = section.replace(/^#\s+.*$/m, '').trim();

    if (type === 'index') {
      taxonomy = parseIndexBlock(bodyContent);
    } else if (type === 'concept') {
      const conceptElements = parseConceptSection(name, bodyContent);
      if (conceptElements.length > 0) {
        elements.set(name, conceptElements);
      }
    } else if (type === 'matrix') {
      if (name.toLowerCase() === 'item-markers matrix') {
        const rows = parseMarkdownTable(bodyContent);
        for (const row of rows) {
          const keys = Object.keys(row);
          if (keys.length > 0) {
            const itemName = row[keys[0]];
            if (itemName) {
              nodeMarkers[itemName] = {};
              for (let i = 1; i < keys.length; i++) {
                if (row[keys[i]] && row[keys[i]] !== '-') {
                  nodeMarkers[itemName][keys[i]] = isNaN(Number(row[keys[i]])) ? row[keys[i]] : Number(row[keys[i]]);
                }
              }
            }
          }
        }
      } else {
        const matrixDecl = frontmatter?.matrices?.find(m => m.name.toLowerCase() === name.toLowerCase());
        const cells = parseMatrixSection(bodyContent, name);
        matrices.push({
          name,
          source: matrixDecl?.source ?? '',
          target: matrixDecl?.target ?? '',
          cells
        });
      }
    }
  }

  return { frontmatter: frontmatter ?? {} as SpecFrontmatter, taxonomy, elements, matrices, nodeMarkers, rawContent: content };
}

export function serializeModel(model: ParsedModel): string {
  const lines: string[] = [];
  const fm = model.frontmatter;
  lines.push('---');
  lines.push(`specification_version: "${fm.specification_version || 'V_0-2-0'}"`);
  if (fm.specification_url) lines.push(`specification_url: "${fm.specification_url}"`);
  if (fm.level !== undefined) lines.push(`level: ${fm.level}`);
  if (fm.parent) {
    lines.push('parent:');
    lines.push(`  name: "${fm.parent.name}"`);
    lines.push(`  url: "${fm.parent.url}"`);
  }
  if (fm.model_version) lines.push(`model_version: "${fm.model_version}"`);
  if (fm.title) lines.push(`title: "${fm.title}"`);
  if (fm.mode) lines.push(`mode: "${fm.mode}"`);
  lines.push('---');
  lines.push('');
  lines.push('> [!NOTE]');
  lines.push('> This is a **FORMAT document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter.');
  lines.push('');

  if (model.taxonomy.length > 0) {
    lines.push('# <!-- block: concepts --> index');
    const roots = model.taxonomy.filter(e => !model.taxonomy.some(p => p.child === e.parent));
    for (const root of roots) {
      printTaxonomy(root, model.taxonomy, lines, 0);
    }
    lines.push('');
  }

  for (const [conceptName, elementNodes] of model.elements) {
    lines.push(`# <!-- block: concepts --> ${conceptName}`);
    for (const node of elementNodes) {
      const prefix = node.type === 'steps' || node.type === 'sequence' ? '1.' : '*';
      lines.push(`${prefix} <!-- block: ${conceptName} --> ${node.name}`);
      if (Object.keys(node.fields).length > 0) {
        lines.push('  ```yaml');
        for (const [k, v] of Object.entries(node.fields)) {
          lines.push(`  ${k}: ${JSON.stringify(v)}`);
        }
        lines.push('  ```');
      }
      if (node.description) {
        for (const descLine of node.description.split('\n')) {
          lines.push(`  ${descLine}`);
        }
      }
    }
    lines.push('');
  }

  for (const matrix of model.matrices) {
    if (matrix.cells.length === 0) continue;
    lines.push(`# <!-- block: matrices --> ${matrix.name}`);
    const colSet = new Set(matrix.cells.map(c => c.col));
    const rowSet = new Set(matrix.cells.map(c => c.row));
    const cols = Array.from(colSet);
    const rows = Array.from(rowSet);
    const cellMap = new Map(matrix.cells.map(c => [`${c.row}||${c.col}`, c.value]));

    const headerLine = `| ${matrix.source} \\ ${matrix.target} | ${cols.join(' | ')} |`;
    const sepLine = `| :--- | ${cols.map(() => ':---:').join(' | ')} |`;
    lines.push(headerLine);
    lines.push(sepLine);
    for (const row of rows) {
      const vals = cols.map(c => cellMap.get(`${row}||${c}`) || '-');
      lines.push(`| ${row} | ${vals.join(' | ')} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function printTaxonomy(edge: TaxonomyEdge, allEdges: TaxonomyEdge[], lines: string[], depth: number): void {
  const indent = '  '.repeat(depth);
  lines.push(`${indent}* [[${edge.child}]]`);
  const children = allEdges.filter(e => e.parent === edge.child);
  for (const child of children) {
    printTaxonomy(child, allEdges, lines, depth + 1);
  }
}
