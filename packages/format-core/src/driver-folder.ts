import { readFile } from 'node:fs/promises';
import { join, relative, dirname, basename } from 'node:path';
import { ParsedModel, FolderElement, FolderDriverOptions, SpecFrontmatter, GraphEdge } from './types';
import { parseFrontmatter, parseModel } from './parser';

export interface FolderModel {
  rootFrontmatter: SpecFrontmatter;
  rootModel: ParsedModel;
  elements: FolderElement[];
}

export async function discoverFolder(rootPath: string, _options?: FolderDriverOptions): Promise<FolderModel> {
  const fs = await import('node:fs/promises');
  const formatMdPath = join(rootPath, '_FORMAT.md');
  const rootContent = await fs.readFile(formatMdPath, 'utf-8');
  const rootFrontmatter = parseFrontmatter(rootContent);
  const rootModel = parseModel(rootContent);

  const elements = await walkDirectory(rootPath, rootPath, 1);
  return { rootFrontmatter: rootFrontmatter ?? {} as SpecFrontmatter, rootModel, elements };
}

async function walkDirectory(rootPath: string, currentPath: string, _depth: number): Promise<FolderElement[]> {
  const fs = await import('node:fs/promises');
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const result: FolderElement[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = join(currentPath, entry.name);
    const formatMdPath = join(dirPath, '_FORMAT.md');

    try {
      await fs.access(formatMdPath);
    } catch {
      continue;
    }

    const content = await fs.readFile(formatMdPath, 'utf-8');
    const fm = parseFrontmatter(content) ?? {};

    const relPath = relative(rootPath, dirPath).replace(/\\/g, '/');
    const assets: string[] = [];
    const children: FolderElement[] = [];

    const subEntries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const sub of subEntries) {
      const subPath = join(dirPath, sub.name);
      if (sub.isDirectory()) {
        const subChildren = await walkDirectory(rootPath, subPath, _depth + 1);
        children.push(...subChildren);
      } else if (sub.name !== '_FORMAT.md') {
        assets.push(join(relPath, sub.name).replace(/\\/g, '/'));
      }
    }

    result.push({
      path: relPath,
      type: (fm as any).type || '',
      fields: (fm as any).fields || {},
      markers: (fm as any).markers || {},
      graphEdges: (fm as any).graph_edges || [],
      assets,
      children,
    });
  }

  return result;
}

export function buildElementMap(elements: FolderElement[]): Map<string, FolderElement> {
  const map = new Map<string, FolderElement>();
  function walk(items: FolderElement[]) {
    for (const item of items) {
      map.set(item.path, item);
      walk(item.children);
    }
  }
  walk(elements);
  return map;
}
