/**
 * useMatrixDefinitions
 *
 * Shared home for the `__matrix_defs` field pattern, duplicated (with two
 * genuinely different strategies) across LeftSidebar.vue and MatricesGrid.vue
 * before this extraction:
 *
 * - `extractMatrixDefs` (fallback strategy — LeftSidebar.vue): `__matrix_defs`
 *   verbatim when non-empty, else the raw `matrices` frontmatter field
 *   normalized via `normalizeMatrixDecl`.
 * - `mergeMatrixDefs` (merge strategy — MatricesGrid.vue): both sources,
 *   always normalized, deduped by name (`__matrix_defs` entries win).
 *
 * These are NOT unified into one algorithm — see design.md "`__matrix_defs`
 * helper is parameterized, not unified into one algorithm".
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { normalizeMatrixDecl } from '@cognnitive/innfo-core'
import type { MatrixWidgetType } from '@cognnitive/innfo-core'
import type { ModelNode } from '../model/types'
import { useModelStore } from '../stores/modelStore'

export const MATRIX_DEFS_KEY = '__matrix_defs'

export interface MatrixDef {
  name: string
  source: string
  target: string
  widgetType: MatrixWidgetType
  params: string
  values?: string[]
  description?: string
  min_color?: string
  max_color?: string
  label?: string
}

/** Raw `__matrix_defs` field value; [] when absent. */
export function readMatrixDefsField(root: ModelNode | null | undefined): any[] {
  const defs = (root as any)?.fields?.[MATRIX_DEFS_KEY]?.value
  return Array.isArray(defs) ? defs : []
}

/** Raw `matrices` frontmatter field value; [] when absent. */
export function readRawMatricesField(root: ModelNode | null | undefined): any[] {
  const raw = (root as any)?.fields?.matrices?.value
  return Array.isArray(raw) ? raw : []
}

/** LeftSidebar/BlockSheet/WorkspaceView/BlockMatrixSummary strategy: defs, else normalized matrices. */
export function extractMatrixDefs(root: ModelNode | null | undefined): any[] {
  const defs = readMatrixDefsField(root)
  if (defs.length > 0) return defs
  const raw = readRawMatricesField(root)
  if (raw.length > 0) return raw.map((m: any) => normalizeMatrixDecl(m))
  return []
}

/** MatricesGrid strategy: both sources normalized, deduped by name, defs first. */
export function mergeMatrixDefs(root: ModelNode | null | undefined): MatrixDef[] {
  const result: MatrixDef[] = []
  const seen = new Set<string>()

  for (const m of readMatrixDefsField(root)) {
    if (!seen.has(m.name)) {
      seen.add(m.name)
      result.push(normalizeMatrixDecl(m) as MatrixDef)
    }
  }
  for (const m of readRawMatricesField(root)) {
    if (!seen.has(m.name)) {
      seen.add(m.name)
      result.push(normalizeMatrixDecl(m) as MatrixDef)
    }
  }
  return result
}

export function useMatrixDefinitions(
  rootIds: Ref<string[]>,
  opts?: { strategy?: 'fallback' | 'merge' },
): { matrixDefs: ComputedRef<MatrixDef[]>; getMatrixValueCount: (matrixName: string) => number } {
  const modelStore = useModelStore()
  const strategy = opts?.strategy ?? 'fallback'

  const matrixDefs = computed<MatrixDef[]>(() => {
    const result: MatrixDef[] = []
    const seen = new Set<string>()

    for (const id of rootIds.value) {
      const root = modelStore.getNode(id)
      if (!root) continue
      const defs = strategy === 'merge' ? mergeMatrixDefs(root) : extractMatrixDefs(root)
      for (const d of defs) {
        if (!seen.has(d.name)) {
          seen.add(d.name)
          result.push(d)
        }
      }
    }
    return result
  })

  function getMatrixValueCount(matrixName: string): number {
    let count = 0
    const prefix = `${matrixName}||`
    for (const node of Object.values(modelStore.nodes)) {
      if (!node.fields) continue
      for (const [key, fv] of Object.entries(node.fields)) {
        if (key.startsWith(prefix)) {
          const val = (fv as any)?.value
          if (val !== undefined && val !== null && val !== '' && val !== '-' && val !== false) {
            count++
          }
        }
      }
    }
    return count
  }

  return { matrixDefs, getMatrixValueCount }
}
