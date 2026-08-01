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
