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

/* ── Additive template composition (`includes`) ─────────────────
 *
 * A level-2 template MAY declare `includes: [{ name, url }, ...]` naming peer
 * templates whose Concept / Field / Marker / Matrix Definitions are merged
 * into its effective schema **additively** (iNNfo "Level 2 Template
 * Structure"). Resolution is depth-first, left to right; each included
 * template is itself composed through its own `includes`. Composition never
 * overrides or removes an inherited Definition — a name collision between two
 * sources is a validation ERROR that names both. `includes` is orthogonal to
 * the vertical `parent_spec` chain and to the inert `specializes` field.
 */

/** Resolve the raw content of an included template by name (and optionally
 *  URL). Returns null when it cannot be resolved. Supplied by the host
 *  (innfo-mcp / the editor) so this module stays I/O-free. */
export type IncludeResolver = (ref: { name: string; url: string }) => string | null

export interface ResolvedTemplateSchema {
  schema: TemplateSchema
  /** Collisions, cycles and unresolved includes encountered while composing. */
  errors: ValidationError[]
}

function mergeSchemaInto(
  acc: TemplateSchema,
  incoming: TemplateSchema,
  incomingSource: string,
  provenance: {
    concept: Map<string, string>
    marker: Map<string, string>
    matrix: Map<string, string>
    field: Map<string, string>
  },
  errors: ValidationError[],
): void {
  for (const c of incoming.concepts) {
    const key = c.name.toLowerCase()
    const prior = provenance.concept.get(key)
    if (prior) {
      errors.push({
        path: `includes.Concept.${c.name}`,
        message: `Concept Definition "${c.name}" is declared by both "${prior}" and "${incomingSource}" — \`includes\` composition is additive and MUST NOT redeclare a Definition`,
        severity: 'error',
      })
      continue
    }
    provenance.concept.set(key, incomingSource)
    acc.concepts.push(c)
    for (const f of c.fields ?? []) {
      provenance.field.set(`${key}.${f.name.toLowerCase()}`, incomingSource)
    }
  }
  for (const m of incoming.markers) {
    const key = m.name.toLowerCase()
    const prior = provenance.marker.get(key)
    if (prior) {
      errors.push({
        path: `includes.Marker.${m.name}`,
        message: `Marker Definition "${m.name}" is declared by both "${prior}" and "${incomingSource}" — \`includes\` composition is additive`,
        severity: 'error',
      })
      continue
    }
    provenance.marker.set(key, incomingSource)
    acc.markers.push(m)
  }
  for (const mx of incoming.matrices) {
    const key = mx.name.toLowerCase()
    const prior = provenance.matrix.get(key)
    if (prior) {
      errors.push({
        path: `includes.Matrix.${mx.name}`,
        message: `Matrix Definition "${mx.name}" is declared by both "${prior}" and "${incomingSource}" — \`includes\` composition is additive`,
        severity: 'error',
      })
      continue
    }
    provenance.matrix.set(key, incomingSource)
    acc.matrices.push(mx)
  }
  for (const edge of incoming.taxonomy) acc.taxonomy.push(edge)
}

/**
 * Resolve a level-2 template's effective schema, composing every template it
 * `includes` (recursively, depth-first, left to right) on top of a base of
 * the included schemas. Returns the merged schema plus any composition
 * errors (name collisions, cycles, unresolved includes). When the template
 * declares no `includes`, or no resolver is supplied, this is just
 * `extractTemplateSchema` with an empty error list.
 */
export function resolveTemplateSchema(
  templateContent: string,
  resolveInclude?: IncludeResolver,
  _seen: Set<string> = new Set(),
): ResolvedTemplateSchema {
  const parsed = parseModel(templateContent)
  const local = extractTemplateSchema(parsed)
  const includes = parsed.frontmatter?.includes ?? []
  if (!resolveInclude || includes.length === 0) {
    return { schema: local, errors: [] }
  }

  const selfLabel = String(parsed.frontmatter?.title ?? 'this template')
  const errors: ValidationError[] = []
  const base: TemplateSchema = { concepts: [], markers: [], matrices: [], taxonomy: [] }
  const provenance = {
    concept: new Map<string, string>(),
    marker: new Map<string, string>(),
    matrix: new Map<string, string>(),
    field: new Map<string, string>(),
  }

  for (const ref of includes) {
    const key = ref.name.toLowerCase()
    if (_seen.has(key)) {
      errors.push({
        path: `includes.${ref.name}`,
        message: `Cyclic \`includes\`: "${ref.name}" is already being composed further up the chain`,
        severity: 'error',
      })
      continue
    }
    const content = resolveInclude(ref)
    if (content === null) {
      errors.push({
        path: `includes.${ref.name}`,
        message: `Included template "${ref.name}" could not be resolved${ref.url ? ` from "${ref.url}"` : ''}`,
        severity: 'error',
      })
      continue
    }
    const nested = resolveTemplateSchema(content, resolveInclude, new Set([..._seen, key]))
    errors.push(...nested.errors)
    const includedLabel = String(parseModel(content).frontmatter?.title ?? ref.name)
    mergeSchemaInto(base, nested.schema, includedLabel, provenance, errors)
  }

  // The composite template's own definitions apply on top of the union.
  mergeSchemaInto(base, local, selfLabel, provenance, errors)

  return { schema: base, errors }
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

export interface SchemaCheckOptions {
  /** How to report a property no Field Definition declares. Default `warning`. */
  unknownProperty?: 'error' | 'warning' | 'ignore'
  /** `<concept name>` → field names that MUST be present on every element. */
  requiredByConcept?: Record<string, string[]>
  /** Also flag element groups whose Concept is absent from the schema. */
  reportUnknownConcept?: boolean
}

/**
 * The one property/enum conformance pass shared by every level boundary.
 * Given element groups (`Concept name` → elements) and a resolved schema
 * (`Concept[]` with their `fields`), it reports:
 *   - properties not declared by any Field Definition of the owning Concept,
 *   - values outside a `select` Field's `options`,
 *   - missing required properties.
 * Level-2-against-L1 (primitive elements vs the metaschema) and
 * level-3-against-L2 (model elements vs the template) call this with the same
 * signature — they differ only in which schema is passed. Reference and
 * matrix-cell checks are model-only and layered on top by `validateModel`.
 */
export function checkElementsAgainstSchema(
  elementGroups: Iterable<[string, Array<{ name: string; fields: Record<string, unknown> }>]>,
  concepts: Concept[],
  opts: SchemaCheckOptions = {},
): ValidationError[] {
  const unknownProperty = opts.unknownProperty ?? 'warning'
  const conceptByName = new Map(concepts.map((c) => [c.name.toLowerCase(), c]))
  const diagnostics: ValidationError[] = []

  for (const [conceptName, elements] of elementGroups) {
    const def = conceptByName.get(conceptName.toLowerCase())
    if (!def) {
      if (opts.reportUnknownConcept) {
        diagnostics.push({
          path: `${conceptName}`,
          message: `Concept "${conceptName}" is not defined in the schema`,
          severity: 'error',
        })
      }
      continue
    }
    const fieldByName = new Map((def.fields ?? []).map((f) => [f.name.toLowerCase(), f]))
    const required = opts.requiredByConcept?.[def.name] ?? opts.requiredByConcept?.[conceptName] ?? []

    for (const el of elements) {
      for (const key of required) {
        const v = el.fields[key]
        if (v === undefined || v === null || v === '') {
          diagnostics.push({
            path: `${def.name}.${el.name}.${key}`,
            message: `${def.name} "${el.name}" is missing required property "${key}"`,
            severity: 'error',
          })
        }
      }

      for (const [key, rawVal] of Object.entries(el.fields)) {
        const fieldDef = fieldByName.get(key.toLowerCase())
        if (!fieldDef) {
          if (unknownProperty !== 'ignore') {
            diagnostics.push({
              path: `${def.name}.${el.name}.${key}`,
              message: `Property "${key}" is not declared on ${def.name} in the schema`,
              severity: unknownProperty,
            })
          }
          continue
        }
        if (fieldDef.type === 'select' && fieldDef.options && fieldDef.options.length > 0) {
          const val = String(rawVal)
          if (!fieldDef.options.includes(val)) {
            diagnostics.push({
              path: `${def.name}.${el.name}.${key}`,
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

/** Allowed `widget_config` keys per `widget` value (iNNfo "Widget Configuration"). */
const WIDGET_CONFIG_KEYS: Record<string, string[]> = {
  scale: ['min', 'max', 'step'],
  cycle: ['order'],
  set: ['max_selections'],
  text: ['max_length'],
  boolean: [],
}

/**
 * Validate the `widget` / `widget_config` pair on Marker/Matrix Definition
 * elements: unknown keys for the declared widget are WARNINGs, a `scale`
 * missing `min`/`max` is an ERROR, `widget_config` without `widget` is a
 * WARNING.
 */
export function checkWidgetConfig(
  elementGroups: Iterable<[string, Array<{ name: string; fields: Record<string, unknown> }>]>,
): ValidationError[] {
  const diagnostics: ValidationError[] = []
  for (const [primitive, elements] of elementGroups) {
    for (const el of elements) {
      const widget = asString(el.fields['widget'])
      const cfg = asObject(el.fields['widget_config'])
      if (!cfg) continue
      if (!widget) {
        diagnostics.push({
          path: `${primitive}.${el.name}.widget_config`,
          message: `"${el.name}" declares widget_config but no widget`,
          severity: 'warning',
        })
        continue
      }
      const allowed = WIDGET_CONFIG_KEYS[widget.toLowerCase()]
      if (!allowed) continue
      for (const key of Object.keys(cfg)) {
        if (!allowed.includes(key)) {
          diagnostics.push({
            path: `${primitive}.${el.name}.widget_config.${key}`,
            message: `"${key}" is not a widget_config key for widget "${widget}". Allowed: ${allowed.join(', ') || '(none)'}`,
            severity: 'warning',
          })
        }
      }
      if (widget.toLowerCase() === 'scale') {
        for (const req of ['min', 'max']) {
          if (cfg[req] === undefined || cfg[req] === null || cfg[req] === '') {
            diagnostics.push({
              path: `${primitive}.${el.name}.widget_config.${req}`,
              message: `widget "scale" requires widget_config.${req}`,
              severity: 'error',
            })
          }
        }
      }
    }
  }
  return diagnostics
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
  const groups: Array<[string, Array<{ name: string; fields: Record<string, unknown> }>]> = [
    CONCEPT_DEFINITION,
    FIELD_DEFINITION,
    MARKER_DEFINITION,
    MATRIX_DEFINITION,
  ].map((primitive) => [primitive, template.elements.get(primitive) ?? []])

  return [
    ...checkElementsAgainstSchema(groups, metaConcepts, {
      unknownProperty: 'warning',
      requiredByConcept: REQUIRED_BY_PRIMITIVE,
    }),
    ...checkWidgetConfig([
      [MARKER_DEFINITION, template.elements.get(MARKER_DEFINITION) ?? []],
      [MATRIX_DEFINITION, template.elements.get(MATRIX_DEFINITION) ?? []],
    ]),
  ]
}
