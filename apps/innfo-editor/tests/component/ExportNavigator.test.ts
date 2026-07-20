import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ExportNavigator from '../../src/components/editor/ExportNavigator.vue'
import { useModelStore } from '../../src/stores/modelStore'
import { useWorkspaceStore } from '../../src/stores/workspaceStore'
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

describe.skip('ExportNavigator.vue (deprecated — exports moved to sidebar)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('step 2 prompt in template starts with "innfo:" prefix', async () => {
    const workspaceStore = useWorkspaceStore()
    workspaceStore.hasHandle = true

    const modelStore = useModelStore()
    modelStore.rootIds = ['ModelA']
    modelStore.nodes = {
      ModelA: makeModelNode('ModelA', 'MyModel_V_1-0-0_Business_NN.md'),
    }

    const wrapper = mount(ExportNavigator)
    await wrapper.vm.$nextTick()

    // The step 2 prompt is rendered inside a <code> block
    const codeBlocks = wrapper.findAll('code')
    const step2Code = codeBlocks.find((c) => c.text().includes('generate an HTML visualizer'))
    expect(step2Code).toBeDefined()
    expect(step2Code!.text()).toMatch(/^innfo: /)
  })
})
