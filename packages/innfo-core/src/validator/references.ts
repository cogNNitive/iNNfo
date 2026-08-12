import type { Concept, ParsedModel } from '../types'

export interface ReferenceDiagnostic {
  path: string
  message: string
  severity: 'error' | 'warning'
}

/** Collect all element names model-wide (lowercased for case-insensitive matching). */
function collectElementNames(model: ParsedModel): Set<string> {
  const names = new Set<string>()
  for (const [, elements] of model.elements.entries()) {
    for (const el of elements) {
      names.add(el.name.toLowerCase())
    }
  }
  return names
}

/** Map from lowercased element name → set of concept names containing it. */
function conceptsByElementName(model: ParsedModel): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const [conceptName, elements] of model.elements.entries()) {
    for (const el of elements) {
      const key = el.name.toLowerCase()
      const set = map.get(key) ?? new Set<string>()
      set.add(conceptName)
      map.set(key, set)
    }
  }
  return map
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
      if (cell.row && !elementNames.has(cell.row.toLowerCase())) {
        diagnostics.push({
          path: `matrices.${matrix.name}.row`,
          message: `Dangling reference: matrix "${matrix.name}" row "${cell.row}" does not match any element name`,
          severity: 'error',
        })
      }
      if (cell.col && !elementNames.has(cell.col.toLowerCase())) {
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

/**
 * Validate that element fields declared as `reference` in the template point
 * to existing element names (model-wide, case-insensitive). When the field
 * declares `target_concepts`, the resolved element's owning concept(s) must
 * be among them (R-IE-04).
 */
export function validateElementFieldReferences(
  model: ParsedModel,
  templateConcepts: Concept[],
): ReferenceDiagnostic[] {
  const diagnostics: ReferenceDiagnostic[] = []
  const elementNames = collectElementNames(model)
  const conceptsByElement = conceptsByElementName(model)
  const IMPLICIT_REF_FIELDS = new Set(['location', 'room', 'component', 'parent_component'])

  for (const [conceptName, elements] of model.elements.entries()) {
    const conceptDef = templateConcepts.find(
      (c) => c.name.toLowerCase() === conceptName.toLowerCase(),
    )
    const fieldDefs = conceptDef?.fields ?? []

    for (const el of elements) {
      for (const fieldName of Object.keys(el.fields)) {
        const fieldDef = fieldDefs.find(
          (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
        )

        const isRef =
          (fieldDef && fieldDef.type === 'reference') ||
          IMPLICIT_REF_FIELDS.has(fieldName.toLowerCase())
        if (!isRef) continue

        const raw = el.fields[fieldName]
        if (raw === undefined || raw === null || raw === '') continue

        const refs = Array.isArray(raw) ? raw.map(String) : [String(raw)]
        for (const ref of refs) {
          const rawValue = ref.trim()
          if (!rawValue) continue

          // Clean reference syntax: [[Name]] -> Name. Skip qualified cross-model references.
          let value = rawValue
          if (value.startsWith('[[') && value.endsWith(']]')) {
            value = value.slice(2, -2).trim()
          }

          let isCrossModel = false
          if (value.startsWith('[') && value.includes(']')) {
            isCrossModel = true
          } else if (value.includes('::')) {
            isCrossModel = true
          }

          if (isCrossModel) {
            // Bypass validation for cross-model references as they reside outside the current model
            continue
          }

          if (!elementNames.has(value.toLowerCase())) {
            diagnostics.push({
              path: `elements.${conceptName}.${el.name}.fields.${fieldDef?.name ?? fieldName}`,
              message: `Dangling reference: field "${fieldDef?.name ?? fieldName}" value "${rawValue}" does not match any element name`,
              severity: 'error',
            })
            continue
          }

          if (fieldDef?.target_concepts && fieldDef.target_concepts.length > 0) {
            const owningConcepts = conceptsByElement.get(value.toLowerCase()) ?? new Set<string>()
            const allowed = fieldDef.target_concepts.map((c) => c.toLowerCase())
            const allowedMatch = [...owningConcepts].some((c) => allowed.includes(c.toLowerCase()))
            if (!allowedMatch) {
              diagnostics.push({
                path: `elements.${conceptName}.${el.name}.fields.${fieldDef.name}`,
                message: `Reference "${rawValue}" in field "${fieldDef.name}" resolves to element "${value}" but that element belongs to concept(s) "${[...owningConcepts].join(', ')}" which is not in target_concepts of the field`,
                severity: 'error',
              })
            }
          }
        }
      }
    }
  }

  return diagnostics
}
