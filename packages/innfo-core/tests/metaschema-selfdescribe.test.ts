import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  extractMetaschema,
  extractTemplateSchemaFromContent,
  validateTemplateAgainstMetaschema,
} from '../src/index'

const specsRoot = join(import.meta.dirname!, '..', '..', '..', 'specs')
const readSpec = (p: string): string => readFileSync(join(specsRoot, p), 'utf-8')

describe('Metaschema (Self-Description)', () => {
  const iNNfo = readSpec('iNNfo_V_0-1-0_NN.md')

  it('the level-1 spec carries a resolvable metaschema block', () => {
    const meta = extractMetaschema(iNNfo)
    expect(meta).not.toBeNull()
    expect(meta!).toContain('## NN Concept Definition: Matrix Definition')
    expect(meta!).toContain('## NN Field Definition: applies_to')
    expect(meta!).toContain('## NN Field Definition: widget_config')
  })

  it('the metaschema describes the four root primitives with their fields', () => {
    const meta = extractMetaschema(iNNfo)!
    const schema = extractTemplateSchemaFromContent(meta)
    const names = schema.concepts.map((c) => c.name).sort()
    expect(names).toEqual([
      'Concept Definition',
      'Field Definition',
      'Marker Definition',
      'Matrix Definition',
    ])
    const matrixDef = schema.concepts.find((c) => c.name === 'Matrix Definition')!
    expect(matrixDef.fields!.map((f) => f.name)).toEqual(
      expect.arrayContaining(['source', 'target', 'values', 'widget', 'widget_config', 'description']),
    )
    const conceptTypeField = schema.concepts
      .find((c) => c.name === 'Concept Definition')!
      .fields!.find((f) => f.name === 'type')!
    expect(conceptTypeField.type).toBe('select')
    expect(conceptTypeField.options).toEqual([
      'text',
      'category',
      'weight',
      'list',
      'steps',
      'sequence',
    ])
  })

  it('every shipped template validates green against the metaschema', () => {
    const templates = [
      'templates/blank/blank_V_0-1-0_NN.md',
      'templates/business/business_V_0-1-0_NN.md',
      'templates/cogNNitive/cogNNitive_V_0-1-0_NN.md',
      'templates/innovation/innovation_V_0-1-0_NN.md',
      'templates/organization/organization_V_0-1-0_NN.md',
      'templates/procedures/procedures_V_0-1-0_NN.md',
      'templates/projects/projects_V_0-1-0_NN.md',
    ]
    for (const rel of templates) {
      const diags = validateTemplateAgainstMetaschema(readSpec(rel), iNNfo)
      const errors = diags.filter((d) => d.severity === 'error')
      expect(errors, `${rel}: ${JSON.stringify(errors)}`).toEqual([])
    }
  })

  it('the metaschema validates against itself (bootstrap axiom)', () => {
    const meta = extractMetaschema(iNNfo)!
    // Wrap the metaschema body as a minimal level-2 template and check it
    // against the same metaschema: no errors — it is a fixpoint.
    const asTemplate = ['---', 'level: 2', 'title: Metaschema', '---', '', meta, ''].join('\n')
    const diags = validateTemplateAgainstMetaschema(asTemplate, iNNfo)
    expect(diags.filter((d) => d.severity === 'error')).toEqual([])
  })

  it('flags an out-of-enum concept type as an error', () => {
    const badTemplate = [
      '---',
      'level: 2',
      'title: Bad',
      'parent_spec:',
      '  name: iNNfo_V_0-1-0',
      '  url: https://example.com/iNNfo_V_0-1-0_NN.md',
      '---',
      '',
      '> [!NOTE]',
      '> x',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Stakeholders',
      'type:: importance',
      '',
    ].join('\n')
    const diags = validateTemplateAgainstMetaschema(badTemplate, iNNfo)
    expect(
      diags.some(
        (d) => d.severity === 'error' && d.message.includes('Invalid value "importance"'),
      ),
    ).toBe(true)
  })

  it('flags an undeclared primitive property as a warning', () => {
    const badTemplate = [
      '---',
      'level: 2',
      'title: Bad',
      '---',
      '',
      '# NN Marker Definition',
      '',
      '## NN Marker Definition: priority',
      'applies_to:: [Element]',
      'bogus_prop:: 1',
      '',
    ].join('\n')
    const diags = validateTemplateAgainstMetaschema(badTemplate, iNNfo)
    expect(
      diags.some((d) => d.severity === 'warning' && d.message.includes('bogus_prop')),
    ).toBe(true)
  })
})
