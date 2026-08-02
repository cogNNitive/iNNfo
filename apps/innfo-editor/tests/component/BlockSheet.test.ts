import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BlockSheet from '../../src/components/editor/BlockSheet.vue'
import { useModelStore } from '../../src/stores/modelStore'
import type { ModelNode } from '../../src/model/types'

/**
 * Approval tests pinning BlockSheet.vue's CURRENT `rawMarkdown` and
 * `assetItems` behavior before extracting them into
 * `useBlockRawMarkdown.ts` / `useBlockAssets.ts` (Phase 6). Zero prior
 * Vitest coverage existed for this component.
 */
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

describe('BlockSheet.vue — rawMarkdown + assetItems (pinning current behavior)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rawMarkdown (Code tab)', () => {
    it('returns the full raw source when the block node has rawContent', async () => {
      const modelStore = useModelStore()
      const rawContent = '---\nspec_version: V_0-1-5\n---\n\n# _F Root\n'
      modelStore.setGraph({ Root: makeNode('Root', { rawContent }) }, ['Root'])

      const wrapper = mount(BlockSheet, {
        props: {
          block: { id: 'Root', name: 'Root', description: '' },
          kind: 'instance',
          conceptType: 'Root',
          conceptName: 'Root',
          collapsed: false,
          isEditing: false,
        },
      })

      const codeTabBtn = wrapper.findAll('button').find((b) => b.text() === 'Code')!
      await codeTabBtn.trigger('click')

      expect(wrapper.find('pre code').element.textContent).toBe(rawContent)
    })

    it('reconstructs a "* _NN Type: Name" marker line with YAML fields for element nodes without rawContent', async () => {
      const modelStore = useModelStore()
      const root = makeNode('Root', {
        rawContent: '---\nspec_version: V_0-1-5\n---\n\n# _F Root\n',
      })
      const element = makeNode('Root/Task1', {
        name: 'Task1',
        parentId: 'Root',
        type: 'Task',
        fields: {
          priority: {
            value: 'high',
            provenance: {
              author: { kind: 'system', id: 'test' },
              timestamp: '2024-01-01T00:00:00.000Z',
            },
          },
        },
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

      const codeTabBtn = wrapper.findAll('button').find((b) => b.text() === 'Code')!
      await codeTabBtn.trigger('click')

      const codeText = wrapper.find('pre code').text()
      expect(codeText).toContain('* _NN Task: Task1')
      expect(codeText).toContain('```yaml')
      expect(codeText).toContain('priority: "high"')
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
