import { ParsedModel, SpecDocument, ValidationResult, ValidationError } from '../types'
import { parseModel } from '../parser'
import { extractTemplateSchema } from '../schema'
import { validateReferences, validateElementFieldReferences } from './references'
import { validateTaxonomyHierarchy } from './hierarchy'

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
  } else if (fm.level !== 3 && fm.level !== 2) {
    errors.push({
      path: 'frontmatter.level',
      message: `Expected level 2 or 3 for model/template validation, got ${fm.level}`,
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
  if (fm.level === 3) {
    if (!fm.model_version) {
      errors.push({
        path: 'frontmatter.model_version',
        message: 'Missing model_version',
        severity: 'error',
      })
    }
    if (
      fm.matrices !== undefined ||
      fm.concepts !== undefined ||
      fm.markers !== undefined ||
      fm.relationship_types !== undefined
    ) {
      errors.push({
        path: 'frontmatter',
        message:
          'Level 3 models MUST NOT declare schema components (matrices, concepts, markers, relationship_types) in their frontmatter. Move them to the template.',
        severity: 'error',
      })
    }
  }

  // D4: Slug/name collisions are validation ERRORs per N1 specification (Identity & Naming)
  if (model.slugCollisions && model.slugCollisions.length > 0) {
    for (const col of model.slugCollisions) {
      errors.push({
        path: `elements.${col.concept}`,
        message: `Slug collision: "${col.slug}" is shared by elements: ${col.elements.join(', ')}. Element names must be unique across the whole model`,
        severity: 'error',
      })
    }
  }

  // R-MM-02: Reject reserved concept names in template
  const RESERVED_CONCEPT_NAMES = new Set(['Concepts', 'Elements', 'Markers'])
  for (const concept of fm.concepts ?? []) {
    if (RESERVED_CONCEPT_NAMES.has(concept.name)) {
      errors.push({
        path: `frontmatter.concepts.${concept.name}`,
        message: `Reserved concept name "${concept.name}" — Concepts, Elements, and Markers are reserved pseudo-concepts and MUST NOT be declared`,
        severity: 'error',
      })
    }
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
    errors.push({
      path: 'parent',
      message: '[PARENT_RESOLUTION_FAILED] Parent specification template could not be resolved or loaded',
      severity: 'error',
    })
    return { valid: false, errors, warnings }
  }

  const templateFm = template.frontmatter
  // Level-2 templates declare their schema as body elements that instantiate
  // `Concept Definition` / `Field Definition` / `Matrix Definition` /
  // `Marker Definition`. There is no frontmatter fallback.
  const bodySchema = extractTemplateSchema(parseModel(template.rawContent))
  const templateConcepts = bodySchema.concepts
  const templateMarkers = bodySchema.markers
  const templateMatrices = bodySchema.matrices

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
        message: `Concept '${conceptName}' lacks optional guidance section '### ${conceptName}' in parent template`,
        severity: 'warning',
      })
    } else {
      const missing = requiredH3s.filter((req) => !section.subheadings.includes(req))
      if (missing.length > 0) {
        warnings.push({
          path: `parent.concepts.${conceptName}`,
          message: `Concept '${conceptName}' has incomplete documentation in parent template (missing: ${missing.join(', ')})`,
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
    if (conceptType === 'text' && elements.length > 0) {
      warnings.push({
        path: `elements.${conceptName}`,
        message: `Text-type concept "${conceptName}" should use plain Markdown content, not element headings (## NN ${conceptName}:). Found ${elements.length} element(s).`,
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
      continue
    }

    // Cell values must belong to the matrix's declared `values` set
    // (R-MM-08). The empty cell `-` and the boolean marker `X` are always
    // accepted. When no `values` are declared, any text is allowed.
    const declaredValues = Array.isArray(decl.values)
      ? (decl.values as string[]).map((v) => v.toLowerCase())
      : undefined
    if (declaredValues && declaredValues.length > 0) {
      for (const cell of matrix.cells) {
        const raw = cell.value
        if (raw === '-' || raw === '' || raw === 'X' || raw === 'x') continue
        if (!declaredValues.includes(raw.toLowerCase())) {
          warnings.push({
            path: `matrices.${matrix.name}.cells["${cell.row}"]["${cell.col}"]`,
            message: `Matrix "${matrix.name}" cell value "${raw}" is not in the declared value set: ${(decl.values as string[]).join(', ')}`,
            severity: 'warning',
          })
        }
      }
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

  // R-IE-04: reference-typed element fields must resolve to element names
  // model-wide, respecting each field's `target_concepts` when declared.
  for (const diag of validateElementFieldReferences(model, templateConcepts)) {
    ;(diag.severity === 'error' ? errors : warnings).push(diag)
  }

  // R-IE-04: matrix cell row/col labels must resolve to element names.
  // Reported as WARNINGS here (not errors): real V_0-1-0 fixtures use matrix
  // labels that are numbered/abbreviated variants of element names (e.g.
  // `## NN Journey: 1. Paranormal Incident` with row `Paranormal Incident`,
  // or row `Open PR` vs element `Open Pull Request`), so failing hard would
  // reject legitimate published templates. Field-level references above are
  // the hard errors; matrix label drift stays visible but non-blocking.
  for (const diag of validateReferences(model)) {
    warnings.push(diag)
  }

  // Cross-check the # NN index taxonomy against reference-typed element
  // fields (e.g. parent_component). WARNING only — see hierarchy.ts.
  for (const diag of validateTaxonomyHierarchy(model, templateConcepts)) {
    warnings.push(diag)
  }

  return { valid: errors.length === 0, errors, warnings }
}
