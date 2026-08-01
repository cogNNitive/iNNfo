import type { MatrixDecl } from './types'

export type MatrixWidgetType = 'boolean' | 'cycle' | 'scale' | 'set' | 'text'

/**
 * Resolves the interaction widget for a matrix cell.
 *
 * Precedence (R-MM-08): an explicit `widgetType` wins; otherwise the widget is
 * inferred from the declared `values` set:
 * - 0 values  → free text (`text`)
 * - 1 value   → binary presence (`boolean`)
 * - 2+ numeric values → rating scale (`scale`)
 * - 2+ values → dropdown set (`set`)
 *
 * A `params` string is honoured as a last-resort legacy source
 * (`min:1;max:5` → `scale`, `a;b;c` → `set`).
 */
export function deriveMatrixWidgetType(decl: {
  widgetType?: string
  widget?: string
  values?: string[]
  params?: string
}): MatrixWidgetType {
  if (decl.widgetType || decl.widget) {
    const explicit = (decl.widgetType || decl.widget || '').toLowerCase()
    if (explicit === 'boolean' || explicit === 'cycle' || explicit === 'scale' || explicit === 'set')
      return explicit
    return 'text'
  }

  if (Array.isArray(decl.values) && decl.values.length > 0) {
    if (decl.values.length <= 1) return 'boolean'
    const allNumeric = decl.values.every((v) => /^-?\d+(\.\d+)?$/.test(String(v).trim()))
    return allNumeric ? 'scale' : 'set'
  }

  const params = (decl.params || '').trim()
  if (/min:\d+/.test(params) || /max:\d+/.test(params)) return 'scale'
  if (/[;,]/.test(params)) return 'set'
  return 'text'
}

/**
 * Normalizes a raw matrix declaration (template or model frontmatter) into the
 * shape consumed by the UI (`__matrix_defs` entries): carries `values`,
 * `description` and the resolved `widgetType`, and keeps a `params` string for
 * legacy consumers (cell value set joined by `;`).
 */
export function normalizeMatrixDecl(decl: Record<string, unknown>): {
  name: string
  source: string
  target: string
  widgetType: MatrixWidgetType
  params: string
  values?: string[]
  description?: string
  label?: string
  min_color?: string
  max_color?: string
} {
  const raw = decl as unknown as MatrixDecl
  const values = Array.isArray(raw.values) && raw.values.length > 0 ? raw.values.map(String) : undefined
  const params = typeof raw.params === 'string' ? raw.params : ''
  const widgetType = deriveMatrixWidgetType({
    widgetType: raw.widgetType,
    widget: undefined,
    values,
    params: params || (values ? values.join(';') : ''),
  })

  return {
    name: String(raw.name ?? ''),
    source: String(raw.source ?? ''),
    target: String(raw.target ?? ''),
    widgetType,
    params: params || (values ? values.join(';') : ''),
    ...(values ? { values } : {}),
    ...(raw.description ? { description: raw.description } : {}),
    ...(raw.label ? { label: raw.label } : {}),
    ...(raw.min_color ? { min_color: raw.min_color } : {}),
    ...(raw.max_color ? { max_color: raw.max_color } : {}),
  }
}
