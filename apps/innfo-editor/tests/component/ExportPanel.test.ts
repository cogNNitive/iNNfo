import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ExportPanel from '../../src/components/editor/ExportPanel.vue'
import { useWorkspaceStore } from '../../src/stores/workspaceStore'
import { useModelStore } from '../../src/stores/modelStore'
import { buildFakeTree } from '../helpers/fakeFs'
import type { DirectoryHandleLike } from '../../src/model/fs-types'
import type { ModelNode } from '../../src/model/types'

function makeModelNode(id: string, filename: string, title?: string): ModelNode {
  return {
    id,
    name: title ?? id,
    parentId: null,
    childIds: [],
    type: 'document',
    kind: 'root',
    fields: {},
    markers: {},
    relationships: [],
    rawSections: {},
    source: { path: filename },
  }
}

describe('ExportPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows model selector with multiple models', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA', 'ModelB']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
      ModelB: makeModelNode('ModelB', 'OtherModel_V_2-1-0_Procedures_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('MyModel_V_1-0-0')
    expect(wrapper.text()).toContain('OtherModel_V_2-1-0')
  })

  it('pre-selects single model when only one exists', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('MyModel_V_1-0-0')
  })

  it('disables selector and shows message when no models exist', async () => {
    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toMatch(/No models|no models/i)
  })

  it('shows export prompt referencing the selected model', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('MyModel_V_1-0-0')
  })

  it('export prompt starts with "innfo:" prefix', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('innfo:')
  })

  it('export prompt references workflows/export.workflow.md', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('workflows/export.workflow.md')
  })

  it('export prompt uses source.path (full path, not just filename)', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'Projects/Foo/MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Projects/Foo/MyModel_V_1-0-0_Business_NN.md')
  })

  it('export prompt falls back to filename when source.path is undefined', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: {
        id: 'ModelA',
        name: 'FallbackModel',
        parentId: null,
        childIds: [],
        type: 'document',
        kind: 'root',
        fields: {},
        markers: {},
        relationships: [],
        rawSections: {},
        source: {},
      },
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('innfo:')
    expect(wrapper.text()).toContain('FallbackModel')
  })

  it('shows a copy button for the export prompt', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    const copyBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('copy'))
    expect(copyBtn).toBeDefined()
  })

  it('prompt updates when model selection changes', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA', 'ModelB']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'Alpha_V_1-0-0_Business_NN.md', 'Alpha'),
      ModelB: makeModelNode('ModelB', 'Beta_V_2-0-0_Procedures_NN.md', 'Beta'),
    }

    const wrapper = mount(ExportPanel)
    await wrapper.vm.$nextTick()

    // Find the select element and change it
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)

    // Change to Beta
    await select.setValue('ModelB')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Beta_V_2-0-0')
  })

  it('shows empty state when traNNsform/output/ does not exist', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }
    // No traNNsform directory at all
    const workspaceStore = useWorkspaceStore()
    workspaceStore.handle = buildFakeTree('workspace', {}) as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ExportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No previous exports')
  })

  it('shows previous exports from traNNsform/output/', async () => {
    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }
    const workspaceStore = useWorkspaceStore()
    workspaceStore.handle = buildFakeTree('workspace', {
      traNNsform: {
        output: {
          'MyModel_V_1-0-0_Business_visualizer.html': '<html></html>',
        },
      },
    }) as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ExportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('MyModel_V_1-0-0_Business_visualizer.html')
  })
})
