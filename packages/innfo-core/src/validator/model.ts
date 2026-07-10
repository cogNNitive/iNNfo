import { ParsedModel, SpecDocument, ValidationResult, ValidationError } from '../types'

/**
 * Validates model contents against template specification (level 2).
 */
export function validateModel(
  model: ParsedModel,
  template: SpecDocument | null,
  _formatSpec: SpecDocument | null,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const fm = model.frontmatter

  if (!fm.level) {
    errors.push({ path: 'frontmatter.level', message: 'Missing level', severity: 'error' })
  }
  if (fm.level !== 3) {
    errors.push({
      path: 'frontmatter.level',
      message: `Expected level 3 for model, got ${fm.level}`,
      severity: 'error',
    })
  }
  if (!fm.parent_spec) {
    errors.push({
      path: 'frontmatter.parent_spec',
      message: 'Missing parent_spec',
      severity: 'error',
    })
  }
  if (!fm.model_version) {
    errors.push({
      path: 'frontmatter.model_version',
      message: 'Missing model_version',
      severity: 'error',
    })
  }

  // FR-007: Reject FOLDER mode
  if (fm.mode === 'FOLDER') {
    errors.push({
      path: 'frontmatter.mode',
      message:
        'FOLDER mode is removed in V_0-1-3. Use index.md-based workspace with single-file models.',
      severity: 'error',
    })
  }

  if (!template) {
    warnings.push({
      path: 'parent',
      message: 'Template not resolved — skipping template validation',
      severity: 'warning',
    })
    return { valid: errors.length === 0, errors, warnings }
  }

  const templateFm = template.frontmatter
  const templateConcepts = templateFm.concepts ?? []
  const templateMarkers = templateFm.markers ?? []
  const templateMatrices = templateFm.matrices ?? []

  // Check concept documentation in template rawContent (R-MVW-01 & R-MVW-02)
  const rawContent = template.rawContent || ''
  const lines = rawContent.split(/\r?\n/)
  interface H2Section {
    title: string
    subheadings: string[]
  }
  const h2Sections: H2Section[] = []
  let currentH2: H2Section | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      const title = trimmed.substring(3).trim()
      currentH2 = { title, subheadings: [] }
      h2Sections.push(currentH2)
    } else if (trimmed.startsWith('### ') && currentH2) {
      const subtitle = trimmed.substring(4).trim()
      currentH2.subheadings.push(subtitle)
    }
  }

  const requiredH3s = ['Summary', 'Description', 'Methodologies', 'Prompts']
  for (const concept of templateConcepts) {
    const conceptName = concept.name
    const section = h2Sections.find((s) => s.title === conceptName)
    if (!section) {
      warnings.push({
        path: `parent.concepts.${conceptName}`,
        message: `Concept '${conceptName}' is undocumented in parent template`,
        severity: 'warning',
      })
    } else {
      const missing = requiredH3s.filter((req) => !section.subheadings.includes(req))
      if (missing.length > 0) {
        warnings.push({
          path: `parent.concepts.${conceptName}`,
          message: `Concept '${conceptName}' has incomplete documentation in parent template`,
          severity: 'warning',
        })
      }
    }
  }

  for (const [conceptName, elements] of model.elements) {
    const conceptDef = templateConcepts.find(
      (c) => c.name.toLowerCase() === conceptName.toLowerCase(),
    )
    if (!conceptDef) {
      errors.push({
        path: `elements.${conceptName}`,
        message: `Concept "${conceptName}" is not defined in template`,
        severity: 'error',
      })
      continue
    }

    const conceptType = conceptDef.type
    if (conceptType === 'text' && elements.length > 1) {
      warnings.push({
        path: `elements.${conceptName}`,
        message: `Text-type concept "${conceptName}" should have at most 1 element, got ${elements.length}`,
        severity: 'warning',
      })
    }

    for (const el of elements) {
      if (conceptDef.fields && conceptDef.fields.length > 0) {
        for (const fieldDef of conceptDef.fields) {
          if (fieldDef.type === 'select' && fieldDef.options && el.fields[fieldDef.name]) {
            const val = String(el.fields[fieldDef.name])
            if (!fieldDef.options.includes(val)) {
              errors.push({
                path: `elements.${conceptName}.${el.name}.fields.${fieldDef.name}`,
                message: `Invalid value "${val}" for field "${fieldDef.name}". Allowed: ${fieldDef.options.join(', ')}`,
                severity: 'error',
              })
            }
          }
        }
      }
    }
  }

  for (const matrix of model.matrices) {
    const decl = templateMatrices.find((m) => m.name.toLowerCase() === matrix.name.toLowerCase())
    if (!decl) {
      warnings.push({
        path: `matrices.${matrix.name}`,
        message: `Matrix "${matrix.name}" is not declared in template`,
        severity: 'warning',
      })
    }
  }

  for (const [itemName, markers] of Object.entries(model.nodeMarkers)) {
    for (const markerName of Object.keys(markers)) {
      if (!templateMarkers.find((m) => m.name === markerName)) {
        warnings.push({
          path: `nodeMarkers.${itemName}.${markerName}`,
          message: `Marker "${markerName}" is not defined in template`,
          severity: 'warning',
        })
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
