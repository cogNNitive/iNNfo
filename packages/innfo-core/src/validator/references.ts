import type { ParsedModel } from '../types'

export interface ReferenceDiagnostic {
  path: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Collect all element names present in a parsed model for reference resolution.
 */
function collectElementNames(model: ParsedModel): Set<string> {
  const names = new Set<string>()
  for (const [, elements] of model.elements.entries()) {
    for (const el of elements) {
      names.add(el.name)
    }
  }
  return names
}

/**
 * Validate that all references in matrix cells point to existing element names.
 * Returns diagnostics for dangling references (R-IE-04).
 */
export function validateReferences(model: ParsedModel): ReferenceDiagnostic[] {
  const diagnostics: ReferenceDiagnostic[] = []
  const elementNames = collectElementNames(model)

  for (const matrix of model.matrices) {
    for (const cell of matrix.cells) {
      if (cell.row && !elementNames.has(cell.row)) {
        diagnostics.push({
          path: `matrices.${matrix.name}.row`,
          message: `Dangling reference: matrix "${matrix.name}" row "${cell.row}" does not match any element name`,
          severity: 'error',
        })
      }
      if (cell.col && !elementNames.has(cell.col)) {
        diagnostics.push({
          path: `matrices.${matrix.name}.col`,
          message: `Dangling reference: matrix "${matrix.name}" column "${cell.col}" does not match any element name`,
          severity: 'error',
        })
      }
    }
  }

  return diagnostics
}
