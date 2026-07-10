import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useModelStore } from '../../src/stores/modelStore'
import type { ModelNode } from '../../src/model/types'

function makeNode(id: string, overrides: Partial<ModelNode> = {}): ModelNode {
  return {
    id,
    name: id,
    parentId: null,
    childIds: [],
    type: 'text',
    fields: {},
    markers: {},
    relationships: [],
    rawSections: {},
    source: { path: id },
    ...overrides,
  }
}

describe('modelStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('holds exactly one normalized graph as the source of truth', () => {
    const modelStore = useModelStore()
    const root = makeNode('Root')
    modelStore.setGraph({ Root: root }, ['Root'])

    expect(modelStore.getRoots()).toEqual([root])
    expect(modelStore.getNode('Root')).toEqual(root)
  })

  it('exposes selectors for children lookup via parentId/childIds', () => {
    const modelStore = useModelStore()
    const child = makeNode('Root/Child', { parentId: 'Root' })
    const root = makeNode('Root', { childIds: ['Root/Child'] })
    modelStore.setGraph({ Root: root, 'Root/Child': child }, ['Root'])

    expect(modelStore.getChildren('Root')).toEqual([child])
  })

  it('tracks dirty nodes independently per node', () => {
    const modelStore = useModelStore()
    modelStore.setGraph({ Root: makeNode('Root') }, ['Root'])

    expect(modelStore.isDirty('Root')).toBe(false)
    modelStore.markDirty('Root')
    expect(modelStore.isDirty('Root')).toBe(true)
    modelStore.clearDirty('Root')
    expect(modelStore.isDirty('Root')).toBe(false)
  })

  it('resolves parent specifications locally first from specs/ directory handle', async () => {
    const { buildFakeTree } = await import('../helpers/fakeFs')

    const indexMd = '# _NN index\n* [[model_NN.md]]'
    const modelMd = [
      '---',
      'spec_version: "V_0-1-1"',
      'level: 3',
      'parent_spec:',
      '  name: "test-template_V_1-0-0"',
      '  url: "https://example.com/network-fallback-url-should-not-be-called"',
      'model_version: "V_0-0-1"',
      'title: "My Model"',
      '---',
      '',
      '# _NN index',
      '* [[Market]]',
      '',
      '# _NN Market',
      '* _NN Market: Test Market',
    ].join('\n')

    const specMd = [
      '---',
      'specification_version: "V_1-0-0"',
      'specification_url: "https://example.com/test-template"',
      'level: 2',
      'title: "Test Template"',
      'concepts:',
      '  - name: "Market"',
      '    type: "weight"',
      '    color: "blue"',
      '---',
      '',
      '# Test Template',
      '## Market',
      '### Summary',
      'Test summary.',
      '### Description',
      'Test description.',
      '### Methodologies',
      '*No methodologies*',
      '### Prompts',
      '*No prompts*',
    ].join('\n')

    const fakeTree = buildFakeTree('workspace', {
      'index.md': indexMd,
      'model_NN.md': modelMd,
      specs: {
        'test-template_V_1-0-0_NN.md': specMd,
      },
    })

    const modelStore = useModelStore()

    // We expect parseFromHandle to resolve parent_spec from the local specs/ directory handle
    await modelStore.parseFromHandle(fakeTree)

    // Verify that the synthetic spec node was created and populated with rawContent from local file
    const specNode = modelStore.getNode('spec:test-template_V_1-0-0')
    expect(specNode).toBeDefined()
    expect(specNode!.name).toBe('test-template_V_1-0-0')
    expect(specNode!.rawContent).toBe(specMd)

    // Verify concept attributes were mapped correctly
    expect(specNode!.localMetamodel?.concepts).toHaveLength(1)
    expect(specNode!.localMetamodel?.concepts[0].name).toBe('Market')
    expect(specNode!.localMetamodel?.concepts[0].color).toBe('blue')
  })
})
