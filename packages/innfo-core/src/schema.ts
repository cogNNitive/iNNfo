import type { Concept, ConceptField, Marker, MatrixDecl, ParsedModel } from './types'
import { parseModel } from './parser'

/**
 * Root primitives of the Metaplantilla Nivel 1 (V_0-3-0). A level-2 template
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

  const markers: Marker[] = (parsed.elements.get(MARKER_DEFINITION) ?? []).map((el) => ({
    name: el.name,
    symbol: asString(el.fields['symbol']),
    icon: asString(el.fields['icon']),
    color: asString(el.fields['color']),
    weight: asNumber(el.fields['weight']),
  }))

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
    const description = asString(el.fields['description'])
    if (description) decl.description = description
    return decl
  })

  return { concepts, markers, matrices }
}

/**
 * Extracts a template schema from raw document content.
 * Templates instantiate the root primitives in their body; there is no
 * legacy frontmatter fallback.
 */
export function extractTemplateSchemaFromContent(content: string): TemplateSchema {
  return extractTemplateSchema(parseModel(content))
}
