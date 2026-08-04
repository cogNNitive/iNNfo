import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  parseModel,
  parseFrontmatter,
  validateModel,
  validateFormatContent,
  buildHierarchyTree,
  extractRelationships,
  extractAnalysis,
  slugify,
  deriveElementSlugs,
  IdentityRegistry,
  applyMutation,
  uniqueSlugify,
  validateReferences,
  serializeModel,
  deriveMatrixWidgetType,
  normalizeMatrixDecl,
} from '../src/index'
import type { ElementNode } from '../src/types'

const specsV020 = join(import.meta.dirname!, '..', '..', '..', 'specs', 'v0.2.0')
const specsLatest = join(import.meta.dirname!, '..', '..', '..', 'specs', 'latest')

function readSpec(pathSegments: string): string {
  return readFileSync(join(specsV020, pathSegments), 'utf-8')
}
function readLatestSpec(pathSegments: string): string {
  return readFileSync(join(specsLatest, pathSegments), 'utf-8')
}
describe('defiNNe (level 0)', () => {
  const content = readSpec('level0/defiNNe_V_0-2-0_NN.md')
  const fm = parseFrontmatter(content)!

  it('parses frontmatter', () => {
    expect(fm.level).toBe(0)
    expect(fm.spec_version).toBe('V_0-2-0')
    expect(fm.parent_spec).toBeUndefined()
    expect(fm.title).toContain('defiNNe')
  })
})

describe('iNNfo (level 1)', () => {
  const content = readSpec('level1/iNNfo_V_0-2-0_NN.md')
  const fm = parseFrontmatter(content)!

  it('parses frontmatter', () => {
    expect(fm.level).toBe(1)
    expect(fm.parent_spec).toBeDefined()
    expect(fm.parent_spec!.name).toBe('defiNNe_V_0-2-0')
    expect(fm.title).toContain('iNNfo')
  })
})

describe('business template (level 2)', () => {
  const content = readSpec('level2/business/business_V_0-2-0_NN.md')
  const fm = parseFrontmatter(content)!

  it('parses frontmatter', () => {
    expect(fm.level).toBe(2)
    expect(fm.parent_spec!.name).toBe('iNNfo_V_0-2-0')
    expect(fm.concepts?.find((c: any) => c.type === 'text')).toBeTruthy()
    expect(fm.concepts).toBeDefined()
    expect(fm.concepts!.length).toBeGreaterThan(60)
    expect(fm.markers).toBeDefined()
    expect(fm.markers!.length).toBeGreaterThan(0)
    expect(fm.matrices).toBeDefined()
    expect(fm.matrices!.length).toBeGreaterThan(10)
  })

  it('has relationship_types', () => {
    expect(fm.relationship_types).toBeDefined()
    expect((fm.relationship_types as any)?.evaluable_matrix?.enabled).toBe(true)
  })
})

describe('iNNfo model with _NN markers (level 3)', () => {
  // Use inline content with _NN markers — legacy fixtures with _F are out of scope
  const modelContent = [
    '---',
    'spec_version: "V_0-2-0"',
    'level: 3',
    'model_version: "V_0-1-2"',
    'title: "Test Model"',
    'mode: "FILE"',
    'parent_spec:',
    '  name: "business_V_0-1-1"',
    '  url: "https://example.com/business"',
    'matrices:',
    '  - name: "problems-value propositions matrix"',
    '    source: "Problems"',
    '    target: "Value propositions"',
    'concepts:',
    '  - name: "Stakeholders"',
    '    type: list',
    '  - name: "Problems"',
    '    type: list',
    '  - name: "Value propositions"',
    '    type: list',
    '---',
    '',
    '> [!NOTE]',
    '> This is an **iNNfo document**.',
    '',
    '# NN index',
    '',
    '* [[Market]]',
    '  * [[Segments]]',
    '* [[Stakeholders]]',
    '* [[Problems]]',
    '* [[Value propositions]]',
    '',
    '# NN Stakeholders',
    '',
    '## NN Stakeholders: Founder One',
    '  A founder.',
    '## NN Stakeholders: Founder Two',
    '  Another founder.',
    '## NN Stakeholders: Investor',
    '  An investor.',
    '',
    '# NN Problems',
    '',
    '## NN Problems: Problem Alpha',
    '  Description of alpha.',
    '## NN Problems: Problem Beta',
    '  Description of beta.',
    '',
    '# NN Value propositions',
    '',
    '## NN Value propositions: Prop A',
    '  Value prop A.',
    '',
    '# NN matrices: problems-value propositions matrix',
    '| Problems \\ Value propositions | Prop A |',
    '| :--- | :---: |',
    '| Problem Alpha | X |',
    '| Problem Beta | - |',
    '',
    '# NN matrices: item-markers matrix',
    '| Item \\ Marker | weight |',
    '| :--- | :---: |',
    '| Problem Alpha | 9 |',
    '',
  ].join('\n')

  const model = parseModel(modelContent)
  const fm = model.frontmatter

  it('parses frontmatter', () => {
    expect(fm.level).toBe(3)
    expect(fm.parent_spec!.name).toBe('business_V_0-1-1')
    expect(fm.model_version).toBe('V_0-1-2')
    expect(fm.mode).toBe('FILE')
  })

  it('parses taxonomy from index block', () => {
    expect(model.taxonomy.length).toBeGreaterThan(0)
    const marketChild = model.taxonomy.find((e) => e.parent === 'Market')
    expect(marketChild).toBeDefined()
    expect(marketChild!.child).toBe('Segments')
  })

  it('parses concept elements', () => {
    expect(model.elements.has('Stakeholders')).toBe(true)
    expect(model.elements.has('Problems')).toBe(true)
    expect(model.elements.has('Value propositions')).toBe(true)

    const stakeholders = model.elements.get('Stakeholders')!
    expect(stakeholders.length).toBeGreaterThanOrEqual(3)
    expect(stakeholders[0].name).toContain('Founder One')
    expect(stakeholders[0].type).toBe('Stakeholders')
  })

  it('parses matrix values', () => {
    expect(model.matrices.length).toBeGreaterThanOrEqual(1)
    const vpMatrix = model.matrices.find((m) => m.name.toLowerCase().includes('problems-value'))
    expect(vpMatrix).toBeDefined()
    expect(vpMatrix!.cells.length).toBeGreaterThan(0)
    expect(vpMatrix!.cells[0].value).toBeTruthy()
  })

  it('parses item-markers matrix into nodeMarkers', () => {
    expect(Object.keys(model.nodeMarkers).length).toBeGreaterThan(0)
    expect(model.nodeMarkers['Problem Alpha']).toBeDefined()
    expect(model.nodeMarkers['Problem Alpha'].weight).toBe(9)
  })

  it('serializes and re-parses correctly', async () => {
    const { serializeModel } = await import('../src/index')
    const serialized = serializeModel(model)
    expect(serialized).toContain('spec_version: "V_0-2-0"')
    expect(serialized).toContain('# NN Stakeholders')
    expect(serialized).toContain('# NN matrices: problems-value propositions matrix')
    expect(serialized).toContain('## NN Stakeholders:')
  })

  it('serializes and re-parses preserving full structure', async () => {
    const { serializeModel, parseModel } = await import('../src/index')
    const serialized = serializeModel(model)
    const reparsed = parseModel(serialized)

    // Frontmatter
    expect(reparsed.frontmatter.title).toBe(model.frontmatter.title)
    expect(reparsed.frontmatter.level).toBe(model.frontmatter.level)
    expect(reparsed.frontmatter.mode).toBe(model.frontmatter.mode)
    expect(reparsed.frontmatter.model_version).toBe(model.frontmatter.model_version)

    // Matrix declarations (round-trip critical)
    expect(reparsed.matrices.length).toBe(model.matrices.length)
    if (model.matrices.length > 0) {
      expect(reparsed.matrices[0].name).toBe(model.matrices[0].name)
      expect(reparsed.matrices[0].source).toBe(model.matrices[0].source)
      expect(reparsed.matrices[0].cells.length).toBe(model.matrices[0].cells.length)
    }

    // Node markers
    expect(Object.keys(reparsed.nodeMarkers).length).toBe(Object.keys(model.nodeMarkers).length)

    // Elements preserved
    expect(reparsed.elements.size).toBe(model.elements.size)
    for (const [key] of model.elements.entries()) {
      expect(reparsed.elements.has(key)).toBe(true)
      const origNodes = model.elements.get(key)!
      const reparsedNodes = reparsed.elements.get(key)!
      expect(reparsedNodes.length).toBe(origNodes.length)
    }

    // Taxonomy preserved
    expect(reparsed.taxonomy.length).toBe(model.taxonomy.length)
  })
})

describe('procedures template (level 2)', () => {
  const content = readSpec('level2/procedures/procedures_V_0-2-0_NN.md')
  const fm = parseFrontmatter(content)!

  it('parses frontmatter', () => {
    expect(fm.level).toBe(2)
    expect(fm.parent_spec!.name).toBe('iNNfo_V_0-2-0')
    expect(fm.concepts).toBeDefined()
    expect(fm.markers).toBeDefined()
    expect(fm.matrices).toBeDefined()
  })
})

describe('validator', () => {
  const validModelContent = [
    '---',
    'spec_version: "V_0-2-0"',
    'level: 3',
    'model_version: "V_0-1-2"',
    'title: "Inline Model"',
    'mode: "FILE"',
    'parent_spec:',
    '  name: "business_V_0-1-1"',
    '  url: "https://example.com/business"',
    '---',
    '',
    '# NN index',
    '',
    '* [[Stakeholders]]',
    '',
    '# NN Stakeholders',
    '## NN Stakeholders: Alice',
    '',
  ].join('\n')

  const bizTemplateContent = readLatestSpec('level2/business/business_NN.md')
  const bizTemplateFm = parseFrontmatter(bizTemplateContent)!

  it('validates a model against the migrated business template', () => {
    const model = parseModel(validModelContent)

    const result = validateModel(
      model,
      {
        name: 'business_V_0-3-0',
        level: 2,
        parentName: 'iNNfo_V_0-3-0',
        frontmatter: bizTemplateFm,
        rawContent: bizTemplateContent,
      },
      null,
    )

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects model with unknown concept', () => {
    const model = parseModel(validModelContent)

    model.elements.set('NonExistentConcept', [
      { type: 'NonExistentConcept', name: 'Test', description: '', fields: {}, markers: {} },
    ])

    const result = validateModel(
      model,
      {
        name: 'business_V_0-3-0',
        level: 2,
        parentName: 'iNNfo_V_0-3-0',
        frontmatter: bizTemplateFm,
        rawContent: bizTemplateContent,
      },
      null,
    )

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('NonExistentConcept'))).toBe(true)
  })
})

describe('reserved names validation (R-MM-02)', () => {
  it('rejects template with reserved concept name "Concepts"', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Bad Template"',
      '---',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Concepts',
      'type:: text',
      '',
      '# NN index',
      '* [[Concepts]]',
      '',
    ].join('\n')

    const result = validateFormatContent(content, 'test_NN.md')
    const reservedCheck = result.checks.find((c) => c.id === 'fm-reserved-names')
    expect(reservedCheck).toBeDefined()
    expect(reservedCheck!.passed).toBe(false)
    expect(reservedCheck!.severity).toBe('error')
    expect(reservedCheck!.message).toMatch(/Concepts/)
  })

  it('rejects template with reserved concept name "Elements"', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Bad Model"',
      '---',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Elements',
      'type:: list',
      '',
      '# NN index',
      '* [[Elements]]',
      '',
    ].join('\n')

    const result = validateFormatContent(content, 'bad_NN.md')
    const reservedCheck = result.checks.find((c) => c.id === 'fm-reserved-names')
    expect(reservedCheck).toBeDefined()
    expect(reservedCheck!.passed).toBe(false)
    expect(reservedCheck!.message).toMatch(/Elements/)
  })

  it('rejects template with reserved concept name "Markers"', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Bad Template"',
      '---',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Markers',
      'type:: text',
      '',
      '# NN index',
      '* [[Markers]]',
      '',
    ].join('\n')

    const result = validateFormatContent(content, 'test_NN.md')
    const reservedCheck = result.checks.find((c) => c.id === 'fm-reserved-names')
    expect(reservedCheck).toBeDefined()
    expect(reservedCheck!.passed).toBe(false)
    expect(reservedCheck!.message).toMatch(/Markers/)
  })

  it('passes when no reserved concept names are used', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Good Template"',
      '---',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Customer',
      'type:: text',
      '',
      '## NN Concept Definition: Product',
      'type:: text',
      '',
      '# NN index',
      '* [[Customer]]',
      '* [[Product]]',
      '',
    ].join('\n')

    const result = validateFormatContent(content, 'good_NN.md')
    const reservedCheck = result.checks.find((c) => c.id === 'fm-reserved-names')
    expect(reservedCheck).toBeUndefined()
  })
})

describe('identity collision throws error (R-IE-02)', () => {
  it('throws on duplicate sibling name instead of returning #2', () => {
    const reg = new IdentityRegistry()
    reg.register(null, 'Root')
    expect(() => reg.register(null, 'Root')).toThrow(/duplicate/i)
    expect(() => reg.register(null, 'Root')).toThrow(/Root/i)
  })

  it('normalizeSingleModel reports collision as issue', async () => {
    const { normalizeSingleModel } = await import('../src/recursiveParser')
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Collision Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Duplicate]]',
      '',
      '# NN Components',
      '## NN Components: Duplicate',
      '  First element.',
      '## NN Components: Duplicate',
      '  Second element — same name.',
      '',
    ].join('\n')

    const result = normalizeSingleModel(content, 'test_NN.md', 'CollisionTest')
    const collisionIssues = result.issues.filter((i) =>
      i.message.toLowerCase().includes('duplicate'),
    )
    expect(collisionIssues.length).toBeGreaterThan(0)
    expect(collisionIssues[0].message).toMatch(/Duplicate/i)
    // Verify no node with #2 suffix exists
    const hasHashSuffix = Object.keys(result.nodes).some((id) => id.includes('#2'))
    expect(hasHashSuffix).toBe(false)
  })

  it('same-named elements across concepts are reported in normalizeSingleModel', async () => {
    const { normalizeSingleModel } = await import('../src/recursiveParser')
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Duplicate Element"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Review]]',
      '',
      '# NN Work',
      '## NN Work: Review',
      '  First.',
      '',
      '# NN Steps',
      '## NN Steps: Review',
      '  Second — same name across concepts.',
      '',
    ].join('\n')

    const result = normalizeSingleModel(content, 'test_NN.md', 'DupTest')
    const collisionIssues = result.issues.filter((i) =>
      i.message.toLowerCase().includes('duplicate'),
    )
    expect(collisionIssues.length).toBeGreaterThan(0)
  })

  it('catches matching names under different taxonomy parents', async () => {
    const { normalizeSingleModel } = await import('../src/recursiveParser')
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Nested Dup"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Work]]',
      '  * [[Review]]',
      '* [[Steps]]',
      '  * [[Review]]',
      '',
      '# NN Work',
      '## NN Work: Review',
      '  First review.',
      '',
      '# NN Steps',
      '## NN Steps: Review',
      '  Colliding review.',
      '',
    ].join('\n')

    const result = normalizeSingleModel(content, 'test_NN.md', 'NestedDup')
    const collisionIssues = result.issues.filter((i) =>
      i.message.toLowerCase().includes('duplicate'),
    )
    expect(collisionIssues.length).toBeGreaterThan(0)
  })
})

describe('applyMutation (R-IE-01)', () => {
  const makeModel = () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Work]]',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Work',
      'type:: list',
      '',
      '# NN Field Definition',
      '',
      '## NN Field Definition: status',
      'concept:: Work',
      'type:: string',
      '',
      '# NN Marker Definition',
      '',
      '## NN Marker Definition: priority',
      'symbol:: !',
      '',
      '# NN Work',
      '## NN Work: Triage',
      '  First element.',
      '',
    ].join('\n')
    return parseModel(content)
  }

  it('adds a concept', () => {
    const model = makeModel()
    const result = applyMutation(model, 'add_concept', { conceptName: 'Steps', type: 'list' })
    expect(result.success).toBe(true)
    expect(model.elements.get('Concept Definition')!.some((d) => d.name === 'Steps')).toBe(true)
  })

  it('rejects duplicate concept', () => {
    const model = makeModel()
    const result = applyMutation(model, 'add_concept', { conceptName: 'Work', type: 'list' })
    expect(result.success).toBe(false)
    expect(result.errors!.length).toBeGreaterThan(0)
  })

  it('adds an element', () => {
    const model = makeModel()
    const result = applyMutation(model, 'add_element', {
      conceptName: 'Work',
      elementName: 'Review',
      description: 'Code review step.',
    })
    expect(result.success).toBe(true)
    const elements = model.elements.get('Work')!
    expect(elements.some((e) => e.name === 'Review')).toBe(true)
  })

  it('rejects duplicate element across concepts (model-wide)', () => {
    // Add a second concept, then try adding an element with same name
    const model = makeModel()
    applyMutation(model, 'add_concept', { conceptName: 'Steps', type: 'list' })
    // Triage already exists in Work; try adding Triage in Steps
    const result = applyMutation(model, 'add_element', {
      conceptName: 'Steps',
      elementName: 'Triage',
    })
    expect(result.success).toBe(false)
  })

  it('removes an element', () => {
    const model = makeModel()
    const result = applyMutation(model, 'remove_element', {
      conceptName: 'Work',
      elementName: 'Triage',
    })
    expect(result.success).toBe(true)
    const elements = model.elements.get('Work')!
    expect(elements.some((e) => e.name === 'Triage')).toBe(false)
  })

  it('renames a concept and updates references', () => {
    const model = makeModel()
    const result = applyMutation(model, 'rename_concept', {
      conceptName: 'Work',
      newName: 'Task',
    })
    expect(result.success).toBe(true)
    const defs = model.elements.get('Concept Definition')!
    expect(defs.some((d) => d.name === 'Task')).toBe(true)
    expect(defs.some((d) => d.name === 'Work')).toBe(false)
    const fds = model.elements.get('Field Definition')!
    expect(fds.every((f) => f.fields['concept'] !== 'Work')).toBe(true)
    const elements = model.elements.get('Task')
    expect(elements).toBeDefined()
    expect(elements![0].type).toBe('Task')
  })

  it('renames an element', () => {
    const model = makeModel()
    const result = applyMutation(model, 'rename_element', {
      conceptName: 'Work',
      elementName: 'Triage',
      newName: 'Prioritize',
    })
    expect(result.success).toBe(true)
    const elements = model.elements.get('Work')!
    expect(elements.some((e) => e.name === 'Prioritize')).toBe(true)
    expect(elements.some((e) => e.name === 'Triage')).toBe(false)
  })

  it('rejects rename to existing element name (model-wide)', () => {
    const model = makeModel()
    applyMutation(model, 'add_concept', { conceptName: 'Steps', type: 'list' })
    applyMutation(model, 'add_element', {
      conceptName: 'Steps',
      elementName: 'Prioritize',
    })
    const result = applyMutation(model, 'rename_element', {
      conceptName: 'Work',
      elementName: 'Triage',
      newName: 'Prioritize',
    })
    expect(result.success).toBe(false)
  })

  it('adds a field', () => {
    const model = makeModel()
    const result = applyMutation(model, 'add_field', {
      conceptName: 'Work',
      fieldName: 'assignee',
      fieldType: 'string',
    })
    expect(result.success).toBe(true)
    const fds = model.elements.get('Field Definition')!
    expect(fds.some((f) => f.name === 'assignee' && f.fields['concept'] === 'Work')).toBe(true)
  })

  it('sets a marker', () => {
    const model = makeModel()
    const result = applyMutation(model, 'set_marker', {
      markerName: 'urgency',
      symbol: '!!',
    })
    expect(result.success).toBe(true)
    expect(model.elements.get('Marker Definition')!.some((m) => m.name === 'urgency')).toBe(true)
  })

  it('rename_concept updates matrix declaration source/target', () => {
    const model = parseModel([
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'model_version: "V_0-0-1"',
      'title: "Rename Concept Matrix"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Open PR]]',
      '* [[Reviewer]]',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Work',
      'type:: list',
      '',
      '## NN Concept Definition: Roles',
      'type:: list',
      '',
      '# NN Matrix Definition',
      '',
      '## NN Matrix Definition: work-roles matrix',
      'source:: Work',
      'target:: Roles',
      '',
      '# NN Work',
      '## NN Work: Open PR',
      '',
      '# NN Roles',
      '## NN Roles: Reviewer',
      '',
      '# NN matrices: work-roles matrix',
      '| Work \\ Roles | Reviewer |',
      '| Open PR      | ✅ |',
      '',
    ].join('\n'))

    // Rename "Work" concept to "Task"
    applyMutation(model, 'rename_concept', { conceptName: 'Work', newName: 'Task' })

    const mds = model.elements.get('Matrix Definition')!
    const matrixDecl = mds.find((m) => m.name === 'work-roles matrix')
    expect(matrixDecl).toBeDefined()
    // Source and target should be updated
    expect(matrixDecl!.fields['source']).toBe('Task')
  })

  it('rename_element updates taxonomy entries', () => {
    const model = parseModel([
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Rename Element Taxonomy"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'concepts:',
      '  - name: "Work"',
      '    type: "list"',
      '---',
      '',
      '# NN index',
      '* [[Parent]]',
      '  * [[Open PR]]',
      '',
      '# NN Work',
      '## NN Work: Parent',
      '  Top-level.',
      '## NN Work: Open PR',
      '  Nested child.',
      '',
    ].join('\n'))

    expect(model.taxonomy.length).toBeGreaterThan(0)
    // Open PR has a parent in the index (nested), so it gets a taxonomy edge
    const oldEdge = model.taxonomy.find((t) => t.child === 'Open PR')
    expect(oldEdge).toBeDefined()
    expect(oldEdge!.parent).toBe('Parent')

    const result = applyMutation(model, 'rename_element', {
      conceptName: 'Work',
      elementName: 'Open PR',
      newName: 'Create PR',
    })
    expect(result.success).toBe(true)

    const newEdge = model.taxonomy.find((t) => t.child === 'Create PR')
    expect(newEdge).toBeDefined()
    expect(newEdge!.parent).toBe('Parent')
    expect(model.taxonomy.some((t) => t.child === 'Open PR')).toBe(false)
  })
})

describe('CRLF line-ending handling', () => {
  it('parses a CRLF-encoded model with the same fidelity as LF', () => {
    const lfContent = [
      '---',
      'spec_version: "V_0-1-1"',
      'level: 3',
      'model_version: "V_0-1-1"',
      'title: "CRLF fixture"',
      'mode: "FILE"',
      '---',
      '',
      '# NN index',
      '',
      '* [[Parent]]',
      '  * [[Child]]',
      '',
      '# NN Stakeholders',
      '## NN Stakeholders: First Stakeholder',
      '  Description text for the stakeholder.',
      '## NN Stakeholders: Second Stakeholder',
      '  Another description.',
      '',
    ].join('\n')
    const crlfContent = lfContent.replace(/\n/g, '\r\n')

    const lfModel = parseModel(lfContent)
    const crlfModel = parseModel(crlfContent)

    expect(crlfModel.taxonomy.length).toBe(lfModel.taxonomy.length)
    expect(crlfModel.taxonomy.length).toBeGreaterThan(0)

    expect(crlfModel.elements.has('Stakeholders')).toBe(true)
    expect(crlfModel.elements.get('Stakeholders')!.length).toBe(2)
    expect(crlfModel.elements.get('Stakeholders')![0].name).toBe('First Stakeholder')
    expect(crlfModel.elements.get('Stakeholders')![0].description).toBe(
      'Description text for the stakeholder.',
    )

    expect(crlfModel.elements.size).toBe(lfModel.elements.size)
  })

  it('parses a model with _NN markers from CRLF content with full fidelity', () => {
    const lfContent = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-1-2"',
      'title: "Inline Test"',
      'mode: "FILE"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '',
      '* [[Market]]',
      '  * [[Segments]]',
      '* [[Stakeholders]]',
      '* [[Problems]]',
      '',
      '# NN Stakeholders',
      '## NN Stakeholders: S1',
      '## NN Stakeholders: S2',
      '## NN Stakeholders: S3',
      '## NN Stakeholders: S4',
      '## NN Stakeholders: S5',
      '## NN Stakeholders: S6',
      '## NN Stakeholders: S7',
      '',
      '# NN Problems',
      '## NN Problems: P1',
      '## NN Problems: P2',
      '',
    ].join('\n')
    const crlfContent = lfContent.replace(/\n/g, '\r\n')
    const model = parseModel(crlfContent)

    expect(model.taxonomy.length).toBeGreaterThan(0)
    const segEdge = model.taxonomy.find((e) => e.parent === 'Market')
    expect(segEdge).toBeDefined()
    expect(segEdge!.child).toBe('Segments')
    expect(model.elements.size).toBeGreaterThan(1)
    expect(model.elements.has('Stakeholders')).toBe(true)
    expect(model.elements.get('Stakeholders')!.length).toBeGreaterThanOrEqual(7)
  })
})

describe('extended parser features', () => {
  const modelContent = [
    '---',
    'spec_version: "V_0-2-0"',
    'level: 3',
    'model_version: "V_0-1-2"',
    'title: "Inline Test"',
    'mode: "FILE"',
    'parent_spec:',
    '  name: "test_V_0-1-1"',
    '  url: "https://example.com/test"',
    '---',
    '',
    '# NN index',
    '',
    '* [[Market]]',
    '  * [[Segments]]',
    '* [[Stakeholders]]',
    '* [[Problems]]',
    '',
    '# NN Stakeholders',
    '## NN Stakeholders: S1',
    '## NN Stakeholders: S2',
    '## NN Stakeholders: S3',
    '## NN Stakeholders: S4',
    '## NN Stakeholders: S5',
    '## NN Stakeholders: S6',
    '## NN Stakeholders: S7',
    '',
    '# NN Problems',
    '## NN Problems: P1',
    '## NN Problems: P2',
    '',
  ].join('\n')
  const model = parseModel(modelContent)

  it('buildHierarchyTree returns tree from taxonomy', () => {
    const tree = buildHierarchyTree(model.taxonomy, model.elements, model.matrices)
    expect(Array.isArray(tree)).toBe(true)
    expect(tree.length).toBeGreaterThan(0)
  })

  it('extractRelationships finds wikilink refs', () => {
    const rels = extractRelationships(model.frontmatter, model.elements)
    expect(Array.isArray(rels)).toBe(true)
    // The Ghostbusters model currently defines no wikilinks in element descriptions
    // nor graph_edges in frontmatter, so extractRelationships must return an empty array.
    // This is the real contract — if relationships are added to the fixture, this test
    // will fail and must be bumped to the new expected count (not a >= 0 tautology).
    expect(rels.length).toBe(0)
  })

  it('extractAnalysis returns array', () => {
    const analysis = extractAnalysis(modelContent)
    expect(Array.isArray(analysis)).toBe(true)
  })
})

/* ── FR-002: Slug derivation ─────────────────────────────────── */

describe('slugify (FR-002)', () => {
  it('converts a simple name to kebab-case', () => {
    expect(slugify('My Great Element')).toBe('my-great-element')
  })

  it('lowercases the input', () => {
    expect(slugify('ALLCAPS Name')).toBe('allcaps-name')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world test')).toBe('hello-world-test')
  })

  it('strips accented characters', () => {
    expect(slugify('José Martínez')).toBe('jose-martinez')
    expect(slugify('Café Crème')).toBe('cafe-creme')
    expect(slugify('München')).toBe('munchen')
  })

  it('removes non-alphanumeric characters except hyphens', () => {
    expect(slugify('Hello (World)!')).toBe('hello-world')
    expect(slugify('Price: $10')).toBe('price-10')
    expect(slugify('A&B Special')).toBe('ab-special')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world')
    expect(slugify('a--b')).toBe('a-b')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
    expect(slugify('-hello-')).toBe('hello')
  })

  it('handles empty and whitespace-only input', () => {
    expect(slugify('')).toBe('')
    expect(slugify('   ')).toBe('')
  })
})

describe('slugify R-IE-06 enhancements', () => {
  it('converts underscore to hyphen', () => {
    expect(slugify('hello_world')).toBe('hello-world')
    expect(slugify('my_var_name')).toBe('my-var-name')
    expect(slugify('_leading')).toBe('leading')
    expect(slugify('trailing_')).toBe('trailing')
  })

  it('uniqueSlugify appends -1 on collision', () => {
    const existing = new Set(['my-slug'])
    expect(uniqueSlugify('My Slug', existing)).toBe('my-slug-1')
    expect(existing.has('my-slug-1')).toBe(true)
  })

  it('uniqueSlugify appends -2 when -1 also exists', () => {
    const existing = new Set(['my-slug', 'my-slug-1'])
    expect(uniqueSlugify('My Slug', existing)).toBe('my-slug-2')
  })

  it('uniqueSlugify returns slugify result if no collision', () => {
    const existing = new Set<string>()
    expect(uniqueSlugify('Hello World', existing)).toBe('hello-world')
    expect(existing.has('hello-world')).toBe(true)
  })
})

describe('diagnostic policy (R-IE-05) — slug collisions surfaced', () => {
  it('normalizeSingleModel surfaces slug collisions as issues', async () => {
    const { normalizeSingleModel } = await import('../src/recursiveParser')
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Slug Collision"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[My Element]]',
      '* [[my element]]',
      '',
      '# NN Components',
      '## NN Components: My Element',
      '  First one.',
      '## NN Components: my element',
      '  Second one — same slug.',
      '',
    ].join('\n')

    const result = normalizeSingleModel(content, 'test_NN.md', 'SlugTest')
    const slugIssues = result.issues.filter((i) =>
      i.message.toLowerCase().includes('slug'),
    )
    expect(slugIssues.length).toBeGreaterThan(0)
  })
})

describe('validateReferences (R-IE-04)', () => {
  it('reports dangling matrix reference', () => {
    const parsed = parseModel([
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Ref Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'matrices:',
      '  - name: "work-roles matrix"',
      '    source: "Work"',
      '    target: "Roles"',
      '---',
      '',
      '# NN index',
      '* [[Open PR]]',
      '* [[Reviewer]]',
      '',
      '# NN Work',
      '## NN Work: Open PR',
      '',
      '# NN Roles',
      '## NN Roles: Reviewer',
      '',
      '# NN matrices: work-roles matrix',
      '| Work \\ Roles | Reviewer |',
      '| Open PR      | ✅ |',
      '| NonExistent  | ✅ |',
      '',
    ].join('\n'))

    const result = validateReferences(parsed)
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((d) => d.message.includes('NonExistent'))).toBe(true)
    expect(result.some((d) => d.severity === 'error')).toBe(true)
  })

  it('passes when all matrix references resolve', () => {
    const parsed = parseModel([
      '---',
      'spec_version: "V_0-2-0"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Ref Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'matrices:',
      '  - name: "work-roles matrix"',
      '    source: "Work"',
      '    target: "Roles"',
      '---',
      '',
      '# NN index',
      '* [[Open PR]]',
      '* [[Reviewer]]',
      '',
      '# NN Work',
      '## NN Work: Open PR',
      '',
      '# NN Roles',
      '## NN Roles: Reviewer',
      '',
      '# NN matrices: work-roles matrix',
      '| Work \\ Roles | Reviewer |',
      '| Open PR      | ✅ |',
      '',
    ].join('\n'))

    const result = validateReferences(parsed)
    expect(result.length).toBe(0)
  })
})

describe('legacy params → values reader tolerance (4.5)', () => {
  it('converts semicolon-delimited params to values array', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Legacy Test"',
      'matrices:',
      '  - name: "test matrix"',
      '    source: "A"',
      '    target: "B"',
      '    params: "Red;Green;Blue"',
      '---',
      '',
      '# NN index',
      '* [[Test]]',
      '',
    ].join('\n')

    const parsed = parseModel(content)
    const matrix = parsed.frontmatter.matrices?.find((m) => m.name === 'test matrix')
    expect(matrix).toBeDefined()
    expect((matrix as any).values).toEqual(['Red', 'Green', 'Blue'])
  })

  it('keeps native values when both params and values present', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Native Test"',
      'matrices:',
      '  - name: "test matrix"',
      '    source: "A"',
      '    target: "B"',
      '    values: [Responsible, Accountable]',
      '    params: "Red;Green;Blue"',
      '---',
      '',
      '# NN index',
      '* [[Test]]',
      '',
    ].join('\n')

    const parsed = parseModel(content)
    const matrix = parsed.frontmatter.matrices?.find((m) => m.name === 'test matrix')
    expect(matrix).toBeDefined()
    expect((matrix as any).values).toEqual(['Responsible', 'Accountable'])
  })
})

describe('element slug derivation (FR-002)', () => {
  it('derives slug from element name when slug field is absent', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN Problems',
      '',
      '## NN Problems: My Great Element',
      '  A description.',
      '',
    ].join('\n')

    const model = parseModel(content)
    const elements = model.elements.get('Problems')
    expect(elements).toBeDefined()
    expect(elements![0].slug).toBe('my-great-element')
  })

  it('uses explicit slug from YAML fields when declared', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN Problems',
      '',
      '## NN Problems: My Element',

      'slug:: my-custom-slug',
      'severity:: high',

      '  A description.',
      '',
    ].join('\n')

    const model = parseModel(content)
    const elements = model.elements.get('Problems')
    expect(elements).toBeDefined()
    expect(elements![0].slug).toBe('my-custom-slug')
    // slug should NOT remain in fields
    expect(elements![0].fields['slug']).toBeUndefined()
    // other fields should remain
    expect(elements![0].fields['severity']).toBe('high')
  })

  it('detects collisions when two elements derive the same slug', async () => {
    const { ElementsMap } = await import('../src/types')
    const elements = new ElementsMap()

    // Manually create elements with names that would slugify to the same value
    const el1: ElementNode = {
      type: 'Components',
      name: 'My Element',
      description: '',
      fields: {},
      markers: {},
    }
    const el2: ElementNode = {
      type: 'Components',
      name: 'my element',
      description: '',
      fields: {},
      markers: {},
    }

    elements.set('Components', [el1, el2])
    const collisions = deriveElementSlugs(elements)

    expect(collisions).toHaveLength(1)
    expect(collisions[0].slug).toBe('my-element')
    expect(collisions[0].elements).toContain('My Element')
    expect(collisions[0].elements).toContain('my element')
  })

  it('emits slugCollisions on parsed model when names collide', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN Components',
      '',
      '## NN Components: My Element',
      '  First one.',
      '## NN Components: my element',
      '  Second one with same slug.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.slugCollisions).toBeDefined()
    expect(model.slugCollisions!.length).toBeGreaterThanOrEqual(1)
    expect(model.slugCollisions![0].slug).toBe('my-element')
    expect(model.slugCollisions![0].elements).toContain('My Element')
  })

  it('passes slug from ElementNode to ModelNode via recursiveParser', async () => {
    // This is tested via recursiveParse which maps elements to model nodes.
    // We verify the slug field is populated on the model node.
    const { recursiveParse } = await import('../src/recursiveParser')

    const fakeFile = (name: string, content: string) => ({
      kind: 'file' as const,
      name,
      getFile: async () => ({ text: async () => content }),
    })

    const fakeDir = (entries: Array<[string, unknown]>) => ({
      kind: 'directory' as const,
      name: 'ws',
      entries: async function* () {
        for (const e of entries) yield e
      },
      getFileHandle: async (name: string) => {
        const found = entries.find(([n]) => n === name)
        if (!found) throw Object.assign(new Error('File not found'), { code: 'ENOENT' })
        return found[1]
      },
    })

    const modelContent = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: Test El',
      '  A test element.',
      '',
    ].join('\n')

    const indexContent = [
      '---',
      'spec_version: "V_0-1-2"',
      'level: 0',
      'title: "Index"',
      '---',
      '',
      '# NN index',
      '',
      '* [[test_NN.md]]',
      '',
    ].join('\n')

    const root = fakeDir([
      ['index.md', fakeFile('index.md', indexContent)],
      ['test_NN.md', fakeFile('test_NN.md', modelContent)],
    ])

    const result = await recursiveParse(root as any)
    const elementNodes = Object.values(result.nodes).filter((n) => n.kind === 'element')
    expect(elementNodes.length).toBeGreaterThan(0)
    expect(elementNodes[0].slug).toBe('test-el')
  })
})

/* ── FR-003: Asset field types ───────────────────────────────── */

describe('ConceptField.type with asset types (FR-003)', () => {
  it('accepts image/file/video/audio as field types', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Asset Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'concepts:',
      '  - name: Screenshots',
      '    type: text',
      '    fields:',
      '      - name: screenshot',
      '        type: image',
      '      - name: source',
      '        type: file',
      '      - name: demo',
      '        type: video',
      '      - name: narration',
      '        type: audio',
      '---',
      '',
      '# NN index',
      '* [[ScreenshotOne]]',
      '',
      '# NN Screenshots',
      '',
      '## NN Screenshots: ScreenshotOne',

      'screenshot:: photo.png',
      'source:: docs/report.pdf',
      'demo:: walkthrough.mp4',
      'narration:: voiceover.mp3',

      '  A test element with asset fields.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.frontmatter.concepts).toBeDefined()
    const screenshotConcept = model.frontmatter.concepts!.find((c) => c.name === 'Screenshots')
    expect(screenshotConcept).toBeDefined()
    const fieldTypes = screenshotConcept!.fields!.map((f) => f.type)
    expect(fieldTypes).toContain('image')
    expect(fieldTypes).toContain('file')
    expect(fieldTypes).toContain('video')
    expect(fieldTypes).toContain('audio')
  })
})

/* ── FR-004: asset_mode ─────────────────────────────────────── */

describe('asset_mode (FR-004)', () => {
  it('defaults to centralized when absent from frontmatter', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Asset Mode Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.frontmatter.asset_mode).toBeUndefined()
    // The default is handled at the recursiveParser level
  })

  it('accepts explicit centralized mode', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Asset Mode Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'asset_mode: centralized',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.frontmatter.asset_mode).toBe('centralized')
  })

  it('accepts per-element mode', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Asset Mode Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'asset_mode: per-element',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.frontmatter.asset_mode).toBe('per-element')
  })

  it('resolves asset paths in centralized mode correctly', async () => {
    const { recursiveParse } = await import('../src/recursiveParser')

    const fakeFile = (name: string, content: string) => ({
      kind: 'file' as const,
      name,
      getFile: async () => ({ text: async () => content }),
    })

    const fakeDir = (entries: Array<[string, unknown]>) => ({
      kind: 'directory' as const,
      name: 'ws',
      entries: async function* () {
        for (const e of entries) yield e
      },
      getFileHandle: async (name: string) => {
        const found = entries.find(([n]) => n === name)
        if (!found) throw Object.assign(new Error('File not found'), { code: 'ENOENT' })
        return found[1]
      },
    })

    const modelContent = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Asset Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'asset_mode: centralized',
      '---',
      '',
      '# NN Concept Definition',
      '',
      '## NN Concept Definition: Screenshots',
      'type:: text',
      '',
      '# NN Field Definition',
      '',
      '## NN Field Definition: screenshot',
      'concept:: Screenshots',
      'type:: image',
      '',
      '# NN index',
      '* [[ScreenshotOne]]',
      '',
      '# NN Screenshots',
      '',
      '## NN Screenshots: ScreenshotOne',
      'screenshot:: photo.png',
      '  A screenshot element.',
      '',
    ].join('\n')

    const indexContent = [
      '---',
      'spec_version: "V_0-1-2"',
      'level: 0',
      'title: "Index"',
      '---',
      '',
      '# NN index',
      '',
      '* [[test_NN.md]]',
      '',
    ].join('\n')

    const root = fakeDir([
      ['index.md', fakeFile('index.md', indexContent)],
      ['test_NN.md', fakeFile('test_NN.md', modelContent)],
    ])

    const result = await recursiveParse(root as any)
    // Locate the ScreenshotOne element (Concept Definition elements are also
    // graph nodes, so filter by name).
    const screenshotNode = Object.values(result.nodes).find((n) => n.name === 'ScreenshotOne')
    expect(screenshotNode).toBeDefined()
    // The asset path for centralized: <model-dir>/assets/photo.png
    // model-dir is '' (no directory prefix in the test), so path is 'assets/photo.png'
    expect(screenshotNode!.assets).toBeDefined()
    expect(screenshotNode!.assets!.length).toBeGreaterThan(0)
    expect(screenshotNode!.assets![0]).toContain('assets/photo.png')
  })
})

/* ── FR-007: FOLDER mode rejection ──────────────────────────── */

describe('FOLDER mode rejection (FR-007)', () => {
  it('parseModel emits a warning for FOLDER mode', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'mode: FOLDER',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const model = parseModel(content)
    expect(model.parseWarnings).toBeDefined()
    expect(model.parseWarnings!.some((w) => w.includes('FOLDER'))).toBe(true)
  })

  it('validateFormatContent reports error for FOLDER mode', async () => {
    const { validateFormatContent } = await import('../src/validator')
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'mode: FOLDER',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const report = validateFormatContent(content, 'test_NN.md')
    const folderCheck = report.checks.find((c) => c.id === 'fm-no-folder-mode')
    expect(folderCheck).toBeDefined()
    expect(folderCheck!.passed).toBe(false)
    expect(folderCheck!.severity).toBe('error')
    expect(folderCheck!.message).toContain('FOLDER')
  })

  it('validateModel reports error for FOLDER mode', () => {
    const content = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      'mode: FOLDER',
      '---',
      '',
      '# NN index',
      '* [[TestEl]]',
      '',
      '# NN Components',
      '',
      '## NN Components: TestEl',
      '  A test.',
      '',
    ].join('\n')

    const model = parseModel(content)
    const result = validateModel(model, null, null)
    const folderError = result.errors.find((e) => e.message.includes('FOLDER'))
    expect(folderError).toBeDefined()
    expect(folderError!.severity).toBe('error')
  })

  it('reports warnings for undocumented or incomplete parent concepts', () => {
    const modelContent = [
      '---',
      'spec_version: "V_0-1-3"',
      'level: 3',
      'model_version: "V_0-0-1"',
      'title: "Test"',
      'parent_spec:',
      '  name: "test_V_0-1-1"',
      '  url: "https://example.com/test"',
      '---',
      '',
      '# NN index',
      '* [[Market]]',
      '* [[Product]]',
    ].join('\n')

    const model = parseModel(modelContent)
    const mockTemplate = {
      name: 'test_V_0-1-1',
      level: 2 as const,
      frontmatter: {
        spec_version: 'V_0-1-1',
        spec_url: 'https://example.com/test',
        level: 2 as const,
      },
      rawContent: [
        '# Test Template',
        '',
        '# NN Concept Definition',
        '',
        '## NN Concept Definition: Market',
        'type:: weight',
        '',
        '## NN Concept Definition: Product',
        'type:: weight',
        '',
        '## Market',
        '### Summary',
        'A summary.',
        '### Description',
        'A description.',
        '### Methodologies',
        'Methodology list.',
        // Missing prompts for Market
        '',
        // Missing ## Product completely
      ].join('\n'),
    }

    const result = validateModel(model, mockTemplate, null)
    expect(result.warnings.length).toBeGreaterThanOrEqual(2)

    const marketWarning = result.warnings.find((w) => w.message.includes('Market'))
    expect(marketWarning).toBeDefined()
    expect(marketWarning!.message).toContain('has incomplete documentation in parent template')

    const productWarning = result.warnings.find((w) => w.message.includes('Product'))
    expect(productWarning).toBeDefined()
    expect(productWarning!.message).toContain('lacks optional guidance section')
  })
})

describe('business template V_0-2-1 (patch)', () => {
  const content = readFileSync(
    join(import.meta.dirname!, '..', '..', '..', 'specs', 'v0.2.1', 'level2', 'business', 'business_V_0-2-1_NN.md'),
    'utf-8',
  )
  const fm = parseFrontmatter(content)!

  it('declares V_0-2-1 with parent iNNfo_V_0-2-0', () => {
    expect(fm.specification_version).toBe('V_0-2-1')
    expect(fm.parent_spec!.name).toBe('iNNfo_V_0-2-0')
  })

  it('declares per-matrix description, widget and values', () => {
    const journey = fm.matrices!.find((m) => m.name === 'Journey map')
    expect(journey).toBeDefined()
    expect(journey!.description).toBeTruthy()
    expect(journey!.widgetType).toBe('set')
    expect((journey!.values as string[]).length).toBe(9)

    const functionsPositions = fm.matrices!.find((m) => m.name === 'Functions-Positions Matrix')
    expect(functionsPositions).toBeDefined()
    expect(functionsPositions!.widgetType).toBe('boolean')
    expect(functionsPositions!.values).toEqual(['Assumes'])
  })

  it('normalizes declarations to __matrix_defs shape', () => {
    const def = normalizeMatrixDecl(fm.matrices!.find((m) => m.name === 'Journey map')! as any)
    expect(def.widgetType).toBe('set')
    expect(def.values).toEqual([
      'Max',
      'Very High',
      'High',
      'Slightly High',
      'Neutral',
      'Slightly Low',
      'Low',
      'Very Low',
      'Min',
    ])
    expect(def.description).toBeTruthy()
    expect(def.params).toContain('Max')

    const boolDef = normalizeMatrixDecl(fm.matrices!.find((m) => m.name === 'Functions-Positions Matrix')! as any)
    expect(boolDef.widgetType).toBe('boolean')
    expect(boolDef.values).toEqual(['Assumes'])
  })
})

describe('matrix widget inference (R-MM-08)', () => {
  it('uses explicit widgetType first', () => {
    expect(deriveMatrixWidgetType({ widgetType: 'cycle', values: ['A', 'B'] })).toBe('cycle')
  })

  it('infers boolean from a single value', () => {
    expect(deriveMatrixWidgetType({ values: ['Assumes'] })).toBe('boolean')
  })

  it('infers scale from numeric value sets', () => {
    expect(deriveMatrixWidgetType({ values: ['1', '2', '3', '4', '5'] })).toBe('scale')
  })

  it('infers set from multi-value sets', () => {
    expect(deriveMatrixWidgetType({ values: ['Max', 'High', 'Low'] })).toBe('set')
  })

  it('falls back to text', () => {
    expect(deriveMatrixWidgetType({})).toBe('text')
  })
})

describe('matrix value-set validation (R-MM-08)', () => {
  function buildModel(cellValue: string) {
    return parseModel(
      [
        '---',
        'spec_version: "V_0-2-0"',
        'level: 3',
        'model_version: "V_0-1-2"',
        'title: "Val Test"',
        'parent_spec:',
        '  name: "business_V_0-2-1"',
        '  url: "https://example.com/business"',
        '---',
        '',
        '# NN index',
        '* [[Problems]]',
        '* [[Value propositions]]',
        '',
        '# NN Problems',
        '## NN Problems: Problem One',
        '  Description.',
        '',
        '# NN Value propositions',
        '## NN Value propositions: VP One',
        '  Description.',
        '',
        '# NN matrices: problems-value propositions matrix',
        '| Problems \\ Value propositions | VP One |',
        '| :--- | :---: |',
        `| Problem One | ${cellValue} |`,
        '',
      ].join('\n'),
    )
  }

  function buildTemplate() {
    return {
      name: 'business_V_0-2-1',
      level: 2 as const,
      frontmatter: {
        spec_version: 'V_0-2-0',
        spec_url: 'https://example.com/business',
        level: 2 as const,
      },
      rawContent: [
        '# Test Template',
        '',
        '# NN Concept Definition',
        '',
        '## NN Concept Definition: Problems',
        'type:: weight',
        '',
        '## NN Concept Definition: Value propositions',
        'type:: weight',
        '',
        '# NN Matrix Definition',
        '',
        '## NN Matrix Definition: Problems-Value propositions Matrix',
        'source:: Problems',
        'target:: Value propositions',
        'values:: [Max, Very High, High]',
        '',
      ].join('\n'),
    }
  }

  it('accepts declared values, the empty cell and the boolean marker X', () => {
    for (const value of ['High', '-', 'X']) {
      const result = validateModel(buildModel(value), buildTemplate() as any, null)
      const valueWarnings = result.warnings.filter((w) => w.message.includes('value set'))
      expect(valueWarnings).toHaveLength(0)
    }
  })

  it('flags cell values outside the declared set', () => {
    const result = validateModel(buildModel('Garbage'), buildTemplate() as any, null)
    const warning = result.warnings.find((w) => w.message.includes('value set'))
    expect(warning).toBeDefined()
    expect(warning!.message).toContain('Garbage')
    expect(warning!.message).toContain('Max')
  })
})

describe('matrix metadata serializer round-trip', () => {
  it('preserves values, widget and description', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Round Trip"',
      'matrices:',
      '  - name: "test matrix"',
      '    source: "A"',
      '    target: "B"',
      '    widget: "set"',
      '    values: [Red, Green, Blue]',
      '    description: "A test matrix."',
      '---',
      '',
      '# NN index',
      '* [[A]]',
      '',
    ].join('\n')

    const parsed = parseModel(content)
    const serialized = serializeModel(parsed)
    const reparsed = parseModel(serialized)

    const m = reparsed.frontmatter.matrices!.find((x) => x.name === 'test matrix')!
    expect(m.widgetType).toBe('set')
    expect(m.values).toEqual(['Red', 'Green', 'Blue'])
    expect(m.description).toBe('A test matrix.')
    expect(serialized).toContain('widget: "set"')
    expect(serialized).toContain('values: [Red, Green, Blue]')
    expect(serialized).toContain('description: "A test matrix."')
  })

  it('keeps legacy params when no values are declared', () => {
    const content = [
      '---',
      'spec_version: "V_0-2-0"',
      'level: 2',
      'title: "Round Trip Legacy"',
      'matrices:',
      '  - name: "test matrix"',
      '    source: "A"',
      '    target: "B"',
      '    params: "Low;Medium;High"',
      '---',
      '',
      '# NN index',
      '* [[A]]',
      '',
    ].join('\n')

    const parsed = parseModel(content)
    const reparsed = parseModel(serializeModel(parsed))
    const m = reparsed.frontmatter.matrices!.find((x) => x.name === 'test matrix')!
    expect(m.values).toEqual(['Low', 'Medium', 'High'])
  })
})
