import { SpecFrontmatter } from '../types'
import { parse as yamlParse } from 'yaml'
import { normalizeSource, YAML_BLOCK_RE } from './markdown'

export function parseYaml(yamlStr: string): Record<string, any> {
  try {
    return yamlParse(yamlStr) || {}
  } catch (_err) {
    return {}
  }
}

export function parseFrontmatter(content: string): SpecFrontmatter | null {
  const match = normalizeSource(content).match(YAML_BLOCK_RE)
  if (!match) return null
  const parsed = parseYaml(match[1])
  // Normalize parent → parent_spec (supporting both new string URL and legacy parent object)
  if ((parsed as any).parent && !(parsed as any).parent_spec) {
    if (typeof (parsed as any).parent === 'string') {
      const url = (parsed as any).parent
      const name = url.split(/[/\\]/).pop()?.replace(/\.(md|markdown)$/i, '').replace(/_(NN|FORMAT|F)$/i, '') || ''
      ;(parsed as any).parent_spec = { url, name }
    } else {
      ;(parsed as any).parent_spec = (parsed as any).parent
    }
    delete (parsed as any).parent
  }
  // Normalize legacy FORMAT-era field names (specification_* → spec_*)
  if ((parsed as any).specification_version && !(parsed as any).spec_version) {
    ;(parsed as any).spec_version = (parsed as any).specification_version
  }
  if ((parsed as any).specification_url && !(parsed as any).spec_url) {
    ;(parsed as any).spec_url = (parsed as any).specification_url
  }
  // Normalize `includes` entries: a bare string is shorthand for a name with
  // no explicit URL (resolved locally by name). Objects pass through.
  const includes = (parsed as any).includes
  if (Array.isArray(includes)) {
    ;(parsed as any).includes = includes
      .map((entry: unknown) => {
        if (typeof entry === 'string') {
          const name = entry.replace(/\.(md|markdown)$/i, '').replace(/_(NN|FORMAT|F)$/i, '')
          return { name, url: '' }
        }
        if (entry && typeof entry === 'object') {
          const e = entry as Record<string, unknown>
          return { name: String(e.name ?? ''), url: String(e.url ?? '') }
        }
        return null
      })
      .filter((e: unknown): e is { name: string; url: string } => !!e && !!(e as any).name)
  }
  // Normalize legacy matrix params → values (R-MM-08 / 4.5 reader tolerance)
  const matrices = (parsed as any).matrices
  if (Array.isArray(matrices)) {
    for (const m of matrices) {
      if (m.params && !m.values) {
        m.values = m.params.split(';').map((s: string) => s.trim())
      }
      // R-MM-08 uses `widget`; the codebase uses `widgetType` (reader tolerance)
      if (m.widget && !m.widgetType) {
        m.widgetType = m.widget
        delete m.widget
      }
    }
  }
  return parsed as SpecFrontmatter
}
