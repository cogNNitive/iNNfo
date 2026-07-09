import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LeftSidebar from '../../src/components/layout/LeftSidebar.vue'
import { useModelStore } from '../../src/stores/modelStore'
import { useUiStore } from '../../src/stores/uiStore'
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

describe('LeftSidebar — ghost filter toggle (R-TGC-01, R-TGC-05)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders filter toggle when ghost concepts exist', () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          childIds: [],
          localMetamodel: {
            concepts: [
              { name: 'Ghost1', type: 'list' },
              { name: 'Ghost2', type: 'text' },
            ],
            markers: [],
          },
        }),
      },
      ['Root'],
    )

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })

    const toggle = wrapper.find('[data-testid="ghost-filter-toggle"]')
    expect(toggle.exists()).toBe(true)
  })

  it('renders filter toggle even when no ghost concepts exist', () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          localMetamodel: {
            concepts: [],
            markers: [],
          },
        }),
      },
      ['Root'],
    )

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })

    const toggle = wrapper.find('[data-testid="ghost-filter-toggle"]')
    expect(toggle.exists()).toBe(true)
  })

  it('filter buttons exist with correct labels', () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          localMetamodel: {
            concepts: [{ name: 'G', type: 'list' }],
            markers: [],
          },
        }),
      },
      ['Root'],
    )

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })

    expect(wrapper.find('[data-testid="filter-model"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-template"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-model"]').text()).toBe('Model')
    expect(wrapper.find('[data-testid="filter-template"]').text()).toBe('Template')
    expect(wrapper.find('[data-testid="filter-all"]').text()).toBe('All')
  })

  it('clicking filter buttons updates uiStore.ghostFilterMode', async () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          localMetamodel: {
            concepts: [{ name: 'G', type: 'list' }],
            markers: [],
          },
        }),
      },
      ['Root'],
    )

    const uiStore = useUiStore()
    expect(uiStore.ghostFilterMode).toBe('model')

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })

    // Click "Template"
    await wrapper.find('[data-testid="filter-template"]').trigger('click')
    expect(uiStore.ghostFilterMode).toBe('template')

    // Click "All"
    await wrapper.find('[data-testid="filter-all"]').trigger('click')
    expect(uiStore.ghostFilterMode).toBe('all')

    // Click "Model" (back to default)
    await wrapper.find('[data-testid="filter-model"]').trigger('click')
    expect(uiStore.ghostFilterMode).toBe('model')
  })

  it('shows ghost concept groups inline in "all" mode', () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          childIds: ['Root/ExistingItem'],
          localMetamodel: {
            concepts: [
              { name: 'ExistingConcept', type: 'list' },
              { name: 'GhostConcept', type: 'list' },
            ],
            markers: [],
          },
        }),
        'Root/ExistingItem': makeNode('Root/ExistingItem', {
          parentId: 'Root',
          type: 'ExistingConcept',
          kind: 'element',
        }),
      },
      ['Root'],
    )

    const uiStore = useUiStore()
    uiStore.setGhostFilterMode('all')

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })

    // Ghost groups are rendered inline, no separate section container
    expect(wrapper.find('[data-testid="ghost-concepts-section"]').exists()).toBe(false)
    // But ghost group headers exist in the single merged tree
    const ghostHeaders = wrapper.findAll('[data-testid="ghost-group-header"]')
    expect(ghostHeaders.length).toBeGreaterThan(0)
    expect(ghostHeaders[0].text()).toContain('GhostConcept')
  })

  it('hides ghost groups in "model" mode, shows in "all" mode', async () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        Root: makeNode('Root', {
          localMetamodel: {
            concepts: [{ name: 'G', type: 'list' }],
            markers: [],
          },
        }),
      },
      ['Root'],
    )

    const uiStore = useUiStore()
    uiStore.setGhostFilterMode('all')

    const wrapper = mount(LeftSidebar, {
      attachTo: document.body,
    })
    expect(wrapper.findAll('[data-testid="ghost-group-header"]').length).toBeGreaterThan(0)

    uiStore.setGhostFilterMode('model')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="ghost-group-header"]')).toHaveLength(0)
  })
})
