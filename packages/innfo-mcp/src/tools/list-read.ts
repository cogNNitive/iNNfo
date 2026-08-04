/**
 * list_models and read_model tools.
 *
 * list_models scans the root directory for iNNfo model files (`*_NN.md`)
 * and returns their id, path, mode, and version.
 *
 * read_model parses a model by id and returns its parsed structure.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { listModels as coreListModels, parseModel } from '@cognnitive/innfo-core'
import type { ModelInfo, ParsedModel } from '@cognnitive/innfo-core'

/**
 * Normalize a model ID by stripping trailing file extensions (.md, .markdown) and redundant _NN suffixes.
 * E.g., `defiNNe_V_1-0_NN.md` or `model_NN_NN` resolves to `defiNNe_V_1-0` or `model`.
 *
 * @param id Raw model ID input string
 * @returns Normalized canonical base model ID
 */
export function normalizeId(id: string): string {
  if (!id) return ''
  let normalized = id.trim()
  normalized = normalized.replace(/\.(md|markdown)$/i, '')
  while (/_NN$/i.test(normalized)) {
    normalized = normalized.replace(/_NN$/i, '')
  }
  return normalized
}

/**
 * Scan a directory for iNNfo models.
 */
export async function listModels(rootDir: string): Promise<ModelInfo[]> {
  return coreListModels(rootDir)
}

/**
 * Read and parse an iNNfo model by its id.
 * The id is the filename stem (e.g. `Ghostbusters_V_0-1-2_business`
 * resolves to `Ghostbusters_V_0-1-2_business_NN.md`).
 *
 * Returns null if the file doesn't exist or can't be parsed.
 */
export async function readModel(rootDir: string, id: string): Promise<ParsedModel | null> {
  const cleanId = normalizeId(id)
  const candidates = [
    join(rootDir, `${cleanId}_NN.md`),
    join(rootDir, `${cleanId}.md`),
    join(rootDir, cleanId),
    join(rootDir, id),
  ]

  for (const filePath of candidates) {
    try {
      const { stat } = await import('node:fs/promises')
      await stat(filePath)
      const content = await readFile(filePath, 'utf-8')
      const model = parseModel(content)
      return model
    } catch {
      continue
    }
  }

  return null
}

