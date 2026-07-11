import { SpecFrontmatter } from '../types'
import { parse as yamlParse } from 'yaml'
import { normalizeSource, YAML_BLOCK_RE } from './markdown'

export function parseYaml(yamlStr: string): Record<string, any> {
  try {
    return yamlParse(yamlStr) || {}
  } catch (_err) {
    return parseYamlLegacy(yamlStr)
  }
}

function parseYamlLegacy(yamlStr: string): Record<string, any> {
  const lines = yamlStr.split(/\r?\n/)
  const root: Record<string, any> = {}
  const stack: Array<{
    indent: number
    key: string | null
    data: Record<string, any> | unknown[]
    type: 'object' | 'array'
  }> = [{ indent: -1, key: null, data: root, type: 'object' }]

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const indent = line.search(/\S/)
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack[stack.length - 1]

    if (trimmed.startsWith('-')) {
      const rest = trimmed.substring(1).trim()
      if (parent.type !== 'array') {
        if (parent.key && stack.length >= 2) {
          const gp = stack[stack.length - 2]
          ;(gp.data as Record<string, any>)[parent.key] = []
          parent.data = (gp.data as Record<string, any>)[parent.key] as unknown[]
          parent.type = 'array'
        }
      }
      if (rest === '') {
        const obj: any = {}
        ;(parent.data as unknown[]).push(obj)
        stack.push({ indent, key: null, data: obj, type: 'object' })
      } else {
        const ci = rest.indexOf(':')
        if (ci !== -1) {
          const k = rest.substring(0, ci).trim()
          const v = parseYamlValueLegacy(rest.substring(ci + 1).trim())
          const obj = { [k]: v }
          ;(parent.data as unknown[]).push(obj)
          stack.push({ indent, key: k, data: obj, type: 'object' })
        } else {
          ;(parent.data as unknown[]).push(parseYamlValueLegacy(rest))
        }
      }
    } else {
      const ci = trimmed.indexOf(':')
      if (ci === -1) continue
      const key = trimmed.substring(0, ci).trim()
      const valStr = trimmed.substring(ci + 1).trim()
      if (valStr === '') {
        ;(parent.data as Record<string, any>)[key] = {}
        stack.push({
          indent,
          key,
          data: (parent.data as Record<string, any>)[key] as Record<string, any>,
          type: 'object',
        })
      } else {
        ;(parent.data as Record<string, any>)[key] = parseYamlValueLegacy(valStr)
      }
    }
  }
  return root
}

function parseYamlValueLegacy(v: string): any {
  v = v.trim()
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => parseYamlValueLegacy(s.trim()))
  }
  if (v.includes('#') && !v.startsWith('"') && !v.startsWith("'")) v = v.split('#')[0].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
    return v.slice(1, -1)
  if (v.toLowerCase() === 'null') return null
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  if (/^\d+$/.test(v)) return parseInt(v, 10)
  if (/^\d+\.\d+$/.test(v)) return parseFloat(v)
  return v
}

export function parseFrontmatter(content: string): SpecFrontmatter | null {
  const match = normalizeSource(content).match(YAML_BLOCK_RE)
  if (!match) return null
  const parsed = parseYaml(match[1])
  // Normalize legacy parent → parent_spec (defiNNe V_0-1-0 era)
  if ((parsed as any).parent && !(parsed as any).parent_spec) {
    ;(parsed as any).parent_spec = (parsed as any).parent
    delete (parsed as any).parent
  }
  // Normalize legacy FORMAT-era field names (specification_* → spec_*)
  if ((parsed as any).specification_version && !(parsed as any).spec_version) {
    ;(parsed as any).spec_version = (parsed as any).specification_version
  }
  if ((parsed as any).specification_url && !(parsed as any).spec_url) {
    ;(parsed as any).spec_url = (parsed as any).specification_url
  }
  // Normalize legacy matrix params → values (R-MM-08 / 4.5 reader tolerance)
  const matrices = (parsed as any).matrices
  if (Array.isArray(matrices)) {
    for (const m of matrices) {
      if (m.params && !m.values) {
        m.values = m.params.split(';').map((s: string) => s.trim())
      }
    }
  }
  return parsed as SpecFrontmatter
}
