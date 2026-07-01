import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { ParsedModel, FileDriverOptions } from './types';
import { parseModel, serializeModel } from './parser';

export async function readFileModel(filePath: string, _options?: FileDriverOptions): Promise<ParsedModel> {
  const content = await readFile(filePath, 'utf-8');
  return parseModel(content);
}

export async function writeFileModel(filePath: string, model: ParsedModel, _options?: FileDriverOptions): Promise<void> {
  const content = serializeModel(model);
  await writeFile(filePath, content, 'utf-8');
}

export function readFileModelSync(filePath: string, _options?: FileDriverOptions): ParsedModel {
  const content = readFileSync(filePath, 'utf-8');
  return parseModel(content);
}

export function writeFileModelSync(filePath: string, model: ParsedModel, _options?: FileDriverOptions): void {
  const content = serializeModel(model);
  writeFileSync(filePath, content, 'utf-8');
}
