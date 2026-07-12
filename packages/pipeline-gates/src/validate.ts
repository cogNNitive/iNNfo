import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import type { GateResult, ValidateOptions } from './types.js'

const VALID_FRONTMATTER_FIELDS = ['spec_version', 'spec_url', 'level', 'parent_spec', 'model_version', 'title']
const NOTICE_RE = />\s*\[!NOTE\][\s\S]*?\*\*iNNfo document\*\*/

const MODEL_FILENAME_RE = /^([A-Za-z]\w*(?:_[A-Za-z]\w*)*)_V_(\d+(?:-\d+)?(?:-\d+)?)_([A-Za-z]\w*)_NN\.md$/

export async function validateGate(opts: ValidateOptions): Promise<GateResult> {
  const errors: string[] = []
  const warnings: string[] = []

  const content = await readFile(opts.filePath, 'utf-8')
  const fileName = basename(opts.filePath)

  checkNaming(fileName, errors)
  if (errors.length === 0) {
    checkFrontmatter(content, errors)
    checkNotice(content, errors)
  }

  if (!opts.skipMcp && errors.length === 0) {
    const mcpResult = await callMcpValidate(content)
    if (!mcpResult.valid) {
      errors.push(...mcpResult.errors)
    }
  }

  return { passed: errors.length === 0, errors, warnings }
}

function checkNaming(fileName: string, errors: string[]): void {
  if (fileName.endsWith('_NN_draft.md')) {
    errors.push('Filename must end with _NN.md, not _NN_draft.md. Use frontmatter status: "Draft" instead.')
    return
  }
  if (!fileName.endsWith('_NN.md')) {
    errors.push(`Filename must end with _NN.md, got: ${fileName}`)
    return
  }
  const match = fileName.match(MODEL_FILENAME_RE)
  if (!match) {
    errors.push('Filename must follow pattern: <Name>_V_x-y-z_<Template>_NN.md (e.g. MyModel_V_0-1-0_business_NN.md)')
  }
}

function checkFrontmatter(content: string, errors: string[]): void {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    errors.push('No YAML frontmatter found. File must start with ---')
    return
  }
  const fm = fmMatch[1]
  for (const field of VALID_FRONTMATTER_FIELDS) {
    const re = new RegExp(`^${field}\\s*:`, 'm')
    if (!re.test(fm)) {
      errors.push(`Missing frontmatter field: ${field}`)
    }
  }
  const levelMatch = fm.match(/^level\s*:\s*(\d+)/m)
  if (levelMatch && levelMatch[1] !== '3') {
    errors.push(`Expected level: 3 for model, got level: ${levelMatch[1]}`)
  }
  const parentMatch = fm.match(/^parent_spec\s*:/m)
  if (parentMatch) {
    if (!fm.match(/^\s+name\s*:/m) || !fm.match(/^\s+url\s*:/m)) {
      errors.push('parent_spec must contain both name and url fields')
    }
  }
}

function checkNotice(content: string, errors: string[]): void {
  const afterFm = content.replace(/^---[\s\S]*?---\n*/, '')
  if (!NOTICE_RE.test(afterFm)) {
    errors.push('Missing iNNfo document notice: > [!NOTE] This is a **iNNfo document**...')
  }
}

async function callMcpValidate(content: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const result = await fetchModel('validate_model', { content })
    const parsed = JSON.parse(result)
    if (parsed.isError) {
      return { valid: false, errors: [`MCP validate_model failed: ${parsed.content?.[0]?.text ?? 'unknown error'}`] }
    }
    const data = JSON.parse(parsed.content?.[0]?.text ?? '{}')
    if (data.valid) return { valid: true, errors: [] }
    const errs: string[] = (data.errors ?? []).map((e: { message: string }) => e.message)
    return { valid: false, errors: errs.length > 0 ? errs : ['MCP validation failed'] }
  } catch (err) {
    return { valid: false, errors: [`innfo-mcp unavailable: ${err}`] }
  }
}

async function fetchModel(tool: string, args: Record<string, unknown>): Promise<string> {
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const { execSync } = await import('node:child_process')
  const input = JSON.stringify({ method: 'tools/call', params: { name: tool, arguments: args } })
  return execSync(`${cmd} innfo-mcp`, { input, encoding: 'utf-8', timeout: 15000 })
}
