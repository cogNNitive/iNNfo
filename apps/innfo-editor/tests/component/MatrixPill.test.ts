import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import MatrixPill from '../../src/components/editor/MatrixPill.vue'
import { useModelStore } from '../../src/stores/modelStore'

describe('MatrixPill component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders matrix name, source, and target', () => {
    const wrapper = mount(MatrixPill, {
      props: {
        name: 'work-role',
        source: 'Work',
        target: 'Role',
        showSourceTarget: true,
      },
    })
    expect(wrapper.text()).toContain('Work')
    expect(wrapper.text()).toContain('Role')
  })

  it('renders source and target like tree concept headers with colored name, icon, and element counts', () => {
    const modelStore = useModelStore()
    modelStore.setGraph(
      {
        'spec:business': {
          id: 'spec:business',
          name: 'business_V_0-2-1',
          parentId: null,
          childIds: [],
          type: 'category',
          kind: 'root',
          localMetamodel: {
            concepts: [
              { name: 'Work', icon: 'briefcase', type: 'weight', color: 'blue' },
              { name: 'Role', icon: 'users', type: 'weight', color: 'green' },
            ],
            markers: [],
          },
          fields: {},
          markers: {},
          relationships: [],
          rawSections: {},
        },
        'w1': { id: 'w1', name: 'Work A', type: 'Work', kind: 'element', childIds: [], fields: {}, markers: {}, relationships: [], rawSections: {} },
        'w2': { id: 'w2', name: 'Work B', type: 'Work', kind: 'element', childIds: [], fields: {}, markers: {}, relationships: [], rawSections: {} },
        'r1': { id: 'r1', name: 'Role A', type: 'Role', kind: 'element', childIds: [], fields: {}, markers: {}, relationships: [], rawSections: {} },
      },
      ['spec:business'],
    )

    const wrapper = mount(MatrixPill, {
      props: {
        name: 'work-role',
        source: 'Work',
        target: 'Role',
        showSourceTarget: true,
      },
    })

    expect(wrapper.text()).toContain('Work')
    expect(wrapper.text()).toContain('Role')

    const sourceCount = wrapper.find('[data-testid="matrix-pill-source-count-work-role"]')
    expect(sourceCount.exists()).toBe(true)
    expect(sourceCount.text()).toBe('2')

    const targetCount = wrapper.find('[data-testid="matrix-pill-target-count-work-role"]')
    expect(targetCount.exists()).toBe(true)
    expect(targetCount.text()).toBe('1')

    // Colored by concept: uppercase name uses the concept hex color
    const coloredNames = wrapper.findAll('.uppercase')
    expect(coloredNames.length).toBe(2)
    expect(coloredNames[0].text()).toBe('Work')
    expect(coloredNames[0].attributes('style')).toContain('#3b82f6')
    expect(coloredNames[1].text()).toBe('Role')
    expect(coloredNames[1].attributes('style')).toContain('#22c55e')
  })

  it('renders count badge when valueCount is provided (> 0)', () => {
    const wrapper = mount(MatrixPill, {
      props: {
        name: 'work-role',
        source: 'Work',
        target: 'Role',
        valueCount: 5,
      },
    })
    const countBadge = wrapper.find('[data-testid="matrix-pill-count-work-role"]')
    expect(countBadge.exists()).toBe(true)
    expect(countBadge.text()).toBe('5')
    // Non-ghost border
    expect(wrapper.classes()).not.toContain('border-dashed')
  })

  it('renders ghost state styling and count 0 when valueCount is 0', () => {
    const wrapper = mount(MatrixPill, {
      props: {
        name: 'empty-matrix',
        source: 'Work',
        target: 'Role',
        valueCount: 0,
        interactive: true,
      },
    })
    const countBadge = wrapper.find('[data-testid="matrix-pill-count-empty-matrix"]')
    expect(countBadge.exists()).toBe(true)
    expect(countBadge.text()).toBe('0')
    // Ghost state applies border-dashed styling
    expect(wrapper.classes()).toContain('border-dashed')
    expect(wrapper.classes()).toContain('opacity-80')
  })

  it('respects explicit ghost prop', () => {
    const wrapper = mount(MatrixPill, {
      props: {
        name: 'ghost-matrix',
        source: 'Work',
        target: 'Role',
        ghost: true,
        interactive: true,
      },
    })
    expect(wrapper.classes()).toContain('border-dashed')
  })
})
