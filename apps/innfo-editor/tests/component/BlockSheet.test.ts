import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BlockSheet from '../../src/components/editor/BlockSheet.vue'
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

describe('BlockSheet.vue — Redesigned layout & assets', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Header and Layout', () => {
    it('renders element title with concept name and element name without tabs', async () => {
      const modelStore = useModelStore()
      const root = makeNode('Root', { rawContent: '---\nspec_version: V_0-1-5\n---\n' })
      const element = makeNode('Root/Task1', {
        name: 'Task1',
        parentId: 'Root',
        type: 'Task',
      })
      modelStore.setGraph({ Root: root, 'Root/Task1': element }, ['Root'])

      const wrapper = mount(BlockSheet, {
        props: {
          block: { id: 'Root/Task1', name: 'Task1', description: 'Sample description' },
          kind: 'instance',
          conceptType: 'Task',
          conceptName: 'Task',
          collapsed: false,
          isEditing: false,
        },
      })

      expect(wrapper.text()).toContain('Task')
      expect(wrapper.text()).toContain('Task1')
      expect(wrapper.text()).toContain('Sample description')
      // Ensure tab buttons are removed
      expect(wrapper.find('button[class*="border-b-2"]').exists()).toBe(false)
    })

    it('renders unified connections section when node has relationships', async () => {
      const modelStore = useModelStore()
      const root = makeNode('Root', { rawContent: '---\nspec_version: V_0-1-5\n---\n' })
      const element = makeNode('Root/Task1', {
        name: 'Task1',
        parentId: 'Root',
        type: 'Task',
        relationships: [{ label: 'depends_on', targetId: 'Root/Task2' }],
      })
      modelStore.setGraph({ Root: root, 'Root/Task1': element }, ['Root'])

      const wrapper = mount(BlockSheet, {
        props: {
          block: { id: 'Root/Task1', name: 'Task1', description: '' },
          kind: 'instance',
          conceptType: 'Task',
          conceptName: 'Task',
          collapsed: false,
          isEditing: false,
        },
      })

      expect(wrapper.text()).toContain('Connections & Relationships')
      expect(wrapper.text()).toContain('depends_on')
      expect(wrapper.text()).toContain('Task2')
    })
  })

  describe('assetItems (Media & Attachments)', () => {
    it('renders declared node.assets as attachment items in NodeMedia', async () => {
      const modelStore = useModelStore()
      const root = makeNode('Root', { rawContent: '---\nspec_version: V_0-1-5\n---\n' })
      const element = makeNode('Root/Task1', {
        parentId: 'Root',
        type: 'Task',
        assets: ['docs/report.pdf'],
      })
      modelStore.setGraph({ Root: root, 'Root/Task1': element }, ['Root'])

      const wrapper = mount(BlockSheet, {
        props: {
          block: { id: 'Root/Task1', name: 'Task1', description: '' },
          kind: 'instance',
          conceptType: 'Task',
          conceptName: 'Task',
          collapsed: false,
          isEditing: false,
        },
      })

      await flushPromises()

      const mediaSection = wrapper.find('[data-testid="node-media"]')
      expect(mediaSection.exists()).toBe(true)
      expect(mediaSection.text()).toContain('report.pdf')
    })

    it('shows the empty-state message when the node has no assets', async () => {
      const modelStore = useModelStore()
      const root = makeNode('Root', { rawContent: '---\nspec_version: V_0-1-5\n---\n' })
      const element = makeNode('Root/Task2', { parentId: 'Root', type: 'Task' })
      modelStore.setGraph({ Root: root, 'Root/Task2': element }, ['Root'])

      const wrapper = mount(BlockSheet, {
        props: {
          block: { id: 'Root/Task2', name: 'Task2', description: '' },
          kind: 'instance',
          conceptType: 'Task',
          conceptName: 'Task',
          collapsed: false,
          isEditing: false,
        },
      })

      await flushPromises()

      expect(wrapper.text()).toContain('No media or attachments.')
    })
  })
})
