import type { Concept, ConceptField, Marker, MatrixDecl, ParsedModel, TaxonomyEdge, ValidationError } from './types'
import { parseModel } from './parser'

/**
 * Root primitives of the Metaplantilla Nivel 1 (V_0-1-0). A level-2 template
 * instantiates these four primitives as ordinary elements in its body, using
 * the unified syntax:
 *
 *   # NN Concept Definition
 *   ## NN Concept Definition: <Concept Name>
 *   type:: text
 *   weight:: 90
 *
 *   # NN Field Definition
 *   ## NN Field Definition: <Field Name>
 *   concept:: <Concept Name>
 *   type:: string
 *
 *   # NN Marker Definition
 *   ## NN Marker Definition: <Marker Name>
 *   symbol:: *
 *
 *   # NN Matrix Definition
 *   ## NN Matrix Definition: <Matrix Name>
 *   source:: A
 *   target:: B
 *   values:: [Max, High, Low]
 *
 * This module extracts a template's effective schema (concepts, markers,
 * matrices) from those elements. The legacy frontmatter blocks
 * (`concepts:` / `markers:` / `matrices:`) are still honoured when present.
 */

export const CONCEPT_DEFINITION = 'Concept Definition'
export const FIELD_DEFINITION = 'Field Definition'
export const MARKER_DEFINITION = 'Marker Definition'
export const MATRIX_DEFINITION = 'Matrix Definition'

export interface TemplateSchema {
  concepts: Concept[]
  markers: Marker[]
  matrices: MatrixDecl[]
  taxonomy: TaxonomyEdge[]
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() !== '' ? v : undefined
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.map(String)
  return undefined
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v)
  return undefined
}

function asObject(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined
}

/**
 * Extracts a template schema from a parsed document's body elements.
 * Returns empty arrays when the document does not instantiate the root
 * primitives (e.g. a plain level-3 model).
 */
export function extractTemplateSchema(parsed: ParsedModel): TemplateSchema {
  const concepts: Concept[] = []
  const fieldsByConcept = new Map<string, ConceptField[]>()

  for (const el of parsed.elements.get(CONCEPT_DEFINITION) ?? []) {
    const concept: Concept = {
      name: el.name,
      type: (asString(el.fields['type']) as Concept['type']) ?? 'text',
      icon: asString(el.fields['icon']),
      color: asString(el.fields['color']),
      weight: asNumber(el.fields['weight']),
    }
    concepts.push(concept)
    fieldsByConcept.set(concept.name, [])
  }

  for (const el of parsed.elements.get(FIELD_DEFINITION) ?? []) {
    const owner = asString(el.fields['concept'])
    if (!owner) continue
    const field: ConceptField = {
      name: el.name,
      type: (asString(el.fields['type']) as ConceptField['type']) ?? 'string',
      options: asStringArray(el.fields['options']),
      target_concepts: asStringArray(el.fields['target_concepts']),
    }
    const list = fieldsByConcept.get(owner)
    if (list) {
      list.push(field)
    } else {
      fieldsByConcept.set(owner, [field])
    }
  }

  for (const concept of concepts) {
    const fields = fieldsByConcept.get(concept.name)
    if (fields && fields.length > 0) concept.fields = fields
  }

  const markers: Marker[] = (parsed.elements.get(MARKER_DEFINITION) ?? []).map((el) => {
    const marker: Marker = {
      name: el.name,
      symbol: asString(el.fields['symbol']),
      icon: asString(el.fields['icon']),
      color: asString(el.fields['color']),
      weight: asNumber(el.fields['weight']),
    }
    const appliesTo = asStringArray(el.fields['applies_to'])
    if (appliesTo) marker.applies_to = appliesTo
    const values = asStringArray(el.fields['values'])
    if (values) marker.values = values
    const widget = asString(el.fields['widget'])
    if (widget) marker.widgetType = widget
    const widgetConfig = asObject(el.fields['widget_config'])
    if (widgetConfig) marker.widgetConfig = widgetConfig
    return marker
  })

  const matrices: MatrixDecl[] = (parsed.elements.get(MATRIX_DEFINITION) ?? []).map((el) => {
    const values = asStringArray(el.fields['values'])
    const widget = asString(el.fields['widget']) ?? asString(el.fields['widgetType'])
    const decl: MatrixDecl = {
      name: el.name,
      source: asString(el.fields['source']) ?? '',
      target: asString(el.fields['target']) ?? '',
      params: '',
    }
    if (values) decl.values = values
    if (widget) decl.widgetType = widget as MatrixDecl['widgetType']
    const widgetConfig = asObject(el.fields['widget_config'])
    if (widgetConfig) decl.widgetConfig = widgetConfig
    const description = asString(el.fields['description'])
    if (description) decl.description = description
    return decl
  })

  return { concepts, markers, matrices, taxonomy: parsed.taxonomy }
}

/**
 * Extracts a template schema from raw document content.
 * Templates instantiate the root primitives in their body; there is no
 * legacy frontmatter fallback.
 */
export function extractTemplateSchemaFromContent(content: string): TemplateSchema {
  return extractTemplateSchema(parseModel(content))
}

/* ── Metaschema (Self-Description) ──────────────────────────────
 *
 * The level-1 iNNfo spec carries, under its "## Metaschema (Self-Description)"
 * section, a fenced ```markdown block that expresses the four root primitives
 * in iNNfo's own syntax. `validateTemplateAgainstMetaschema` resolves that
 * block and checks a level-2 template's `… Definition` elements against it —
 * the same code path (`extractTemplateSchema` + per-Field checks) used to
 * validate a level-3 Model against its level-2 Template.
 */

/**
 * Pull the fenced ```markdown block that follows the "The Metaschema" heading
 * inside the level-1 iNNfo spec content. Returns null when absent.
 */
export function extractMetaschema(specContent: string): string | null {
  const anchor = specContent.search(/^#{1,6}\s+The Metaschema\s*$/m)
  const region = anchor >= 0 ? specContent.slice(anchor) : specContent
  const fence = region.match(/```(?:markdown|md)?\s*\n([\s\S]*?)\n```/)
  return fence ? fence[1] : null
}

/** Field names REQUIRED on each primitive — transcribed from the "(required)"
 *  markers in the iNNfo spec's Metaschema section (source of truth). */
const REQUIRED_BY_PRIMITIVE: Record<string, string[]> = {
  [CONCEPT_DEFINITION]: ['type'],
  [FIELD_DEFINITION]: ['concept', 'type'],
  [MARKER_DEFINITION]: [],
  [MATRIX_DEFINITION]: ['source', 'target'],
}

/**
 * Validate a level-2 template's root-primitive elements against the level-1
 * metaschema. `metaschemaSpecContent` is the raw content of the resolved
 * level-1 iNNfo spec. Unknown properties are warnings; bad enum values and
 * missing required properties are errors. When the spec carries no resolvable
 * metaschema block, a single warning is returned and the check is skipped.
 */
export function validateTemplateAgainstMetaschema(
  templateContent: string,
  metaschemaSpecContent: string,
): ValidationError[] {
  const diagnostics: ValidationError[] = []
  const metaMarkdown = extractMetaschema(metaschemaSpecContent)
  if (!metaMarkdown) {
    return [
      {
        path: 'metaschema',
        message:
          'Resolved level-1 spec has no "The Metaschema" block; template primitive validation skipped',
        severity: 'warning',
      },
    ]
  }

  const metaConcepts = extractTemplateSchema(parseModel(metaMarkdown)).concepts
  const template = parseModel(templateContent)

  for (const primitive of [CONCEPT_DEFINITION, FIELD_DEFINITION, MARKER_DEFINITION, MATRIX_DEFINITION]) {
    const primDef = metaConcepts.find((c) => c.name === primitive)
    if (!primDef || !primDef.fields || primDef.fields.length === 0) continue
    const allowed = new Map(primDef.fields.map((f) => [f.name, f]))
    const required = REQUIRED_BY_PRIMITIVE[primitive] ?? []

    for (const el of template.elements.get(primitive) ?? []) {
      for (const key of required) {
        const v = el.fields[key]
        if (v === undefined || v === null || v === '') {
          diagnostics.push({
            path: `${primitive}.${el.name}.${key}`,
            message: `${primitive} "${el.name}" is missing required property "${key}"`,
            severity: 'error',
          })
        }
      }

      for (const [key, rawVal] of Object.entries(el.fields)) {
        const fieldDef = allowed.get(key)
        if (!fieldDef) {
          diagnostics.push({
            path: `${primitive}.${el.name}.${key}`,
            message: `Property "${key}" is not declared on ${primitive} in the metaschema`,
            severity: 'warning',
          })
          continue
        }
        if (fieldDef.type === 'select' && fieldDef.options && fieldDef.options.length > 0) {
          const val = String(rawVal)
          if (!fieldDef.options.includes(val)) {
            diagnostics.push({
              path: `${primitive}.${el.name}.${key}`,
              message: `Invalid value "${val}" for "${key}". Allowed: ${fieldDef.options.join(', ')}`,
              severity: 'error',
            })
          }
        }
      }
    }
  }

  return diagnostics
}
