import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import {
  resolveTemplatePath,
  getTemplateSearchPaths,
  UnresolvedTemplateError,
  validateModel,
  parseModel,
} from './index'
import type { SpecDocument } from './types'

describe('Multi-Store Template Resolver (innfo-core)', () => {
  let tmpDir: string
  let workspaceDir: string
  let globalDir: string
  let skillsDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'innfo-resolver-test-'))
    workspaceDir = path.join(tmpDir, 'workspace')
    globalDir = path.join(tmpDir, 'global_templates')
    skillsDir = path.join(tmpDir, 'skills')

    fs.mkdirSync(path.join(workspaceDir, 'templates'), { recursive: true })
    fs.mkdirSync(globalDir, { recursive: true })
    fs.mkdirSync(path.join(skillsDir, 'nn-innfo', 'templates'), { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('resolves workspace-local template first (Precedence 1)', async () => {
    const tmplName = 'test_spec_NN'
    fs.writeFileSync(path.join(workspaceDir, 'templates', `${tmplName}.md`), '# NN concept: Local')
    fs.writeFileSync(path.join(globalDir, `${tmplName}.md`), '# NN concept: Global')
    fs.writeFileSync(
      path.join(skillsDir, 'nn-innfo', 'templates', `${tmplName}.md`),
      '# NN concept: Skill',
    )

    const loc = await resolveTemplatePath(tmplName, {
      workspaceDir,
      globalTemplatesDir: globalDir,
      skillsDir,
    })
    expect(loc).not.toBeNull()
    expect(loc?.source).toBe('workspace')
    expect(loc?.filePath).toBe(path.join(workspaceDir, 'templates', `${tmplName}.md`))
  })

  it('falls back to global templates when missing in workspace (Precedence 2)', async () => {
    const tmplName = 'global_only_spec'
    fs.writeFileSync(path.join(globalDir, `${tmplName}.md`), '# NN concept: Global')
    fs.writeFileSync(
      path.join(skillsDir, 'nn-innfo', 'templates', `${tmplName}.md`),
      '# NN concept: Skill',
    )

    const loc = await resolveTemplatePath(tmplName, {
      workspaceDir,
      globalTemplatesDir: globalDir,
      skillsDir,
    })
    expect(loc).not.toBeNull()
    expect(loc?.source).toBe('global')
    expect(loc?.filePath).toBe(path.join(globalDir, `${tmplName}.md`))
  })

  it('falls back to skill-bundled templates when missing in workspace and global (Precedence 3)', async () => {
    const tmplName = 'skill_only_spec'
    fs.writeFileSync(
      path.join(skillsDir, 'nn-innfo', 'templates', `${tmplName}.md`),
      '# NN concept: Skill',
    )

    const loc = await resolveTemplatePath(tmplName, {
      workspaceDir,
      globalTemplatesDir: globalDir,
      skillsDir,
    })
    expect(loc).not.toBeNull()
    expect(loc?.source).toBe('skill')
    expect(loc?.skillName).toBe('nn-innfo')
    expect(loc?.filePath).toBe(path.join(skillsDir, 'nn-innfo', 'templates', `${tmplName}.md`))
  })

  it('returns null and reports every searched tier when the template is missing everywhere', async () => {
    const missingName = 'non_existent_spec'
    const opts = { workspaceDir, globalTemplatesDir: globalDir, skillsDir }

    const loc = await resolveTemplatePath(missingName, opts)
    expect(loc).toBeNull()

    // The diagnostics must list the real precedence list, not an approximation:
    // every tier resolveTemplatePath walks has to appear in the searched paths.
    const checkedPaths = await getTemplateSearchPaths(missingName, opts)
    expect(checkedPaths).toContain(path.join(workspaceDir, 'templates', `${missingName}.md`))
    expect(checkedPaths).toContain(path.join(workspaceDir, `${missingName}.md`))
    expect(checkedPaths).toContain(path.join(workspaceDir, 'specs', `${missingName}.md`))
    expect(checkedPaths).toContain(path.join(globalDir, `${missingName}.md`))
    expect(checkedPaths).toContain(
      path.join(skillsDir, 'nn-innfo', 'templates', `${missingName}.md`),
    )
    expect(checkedPaths).toContain(path.join(skillsDir, 'nn-innfo', `${missingName}.md`))

    const err = new UnresolvedTemplateError(missingName, checkedPaths)
    expect(err.name).toBe('UnresolvedTemplateError')
    expect(err.message).toContain('Unresolved template "non_existent_spec"')
    expect(err.message).toContain('searched:')
    expect(err.checkedPaths).toEqual(checkedPaths)
  })

  it('validates model concepts against resolved Level 2 spec template from skill store', () => {
    const tmplContent = `---
spec_version: V_1-0-0
spec_level: 2
type: specification
id: projects_V_0-1-0_NN
name: Projects Template
---

# NN concept: Project
* type:: text
`
    const modelContent = `---
level: 3
model_version: V_0-1-0
parent_spec:
  name: projects_V_0-1-0_NN
  url: https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/templates/projects/projects_V_0-1-0_NN.md
---

# NN index
* [[Project]]

## NN Project: Alpha
* status:: active
`
    const parsed = parseModel(modelContent)
    const templateDoc: SpecDocument = {
      level: 2,
      name: 'projects_V_0-1-0_NN',
      rawContent: tmplContent,
      frontmatter: {
        level: 2,
        spec_version: 'V_1-0-0',
        spec_url: 'https://example.com/projects_V_0-1-0_NN.md',
      },
    }

    const res = validateModel(parsed, templateDoc, null)
    expect(res.valid).toBe(true)
    expect(res.errors.length).toBe(0)
  })
})
