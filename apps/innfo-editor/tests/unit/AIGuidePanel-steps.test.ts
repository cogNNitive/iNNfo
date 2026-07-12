import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import AIGuidePanel from '../../src/components/editor/AIGuidePanel.vue'

/**
 * Reproduces the reported behaviour: after a step is checked and the accordion
 * auto-advances (collapsing it), the checked state must survive on the
 * collapsed step — the same way step 1 already does.
 */
describe('AIGuidePanel steps accordion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  /** Checkbox/number badge buttons, one per step, in DOM order. */
  const boxes = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('button[aria-pressed]')

  it('keeps step 2 checked after it collapses on auto-advance', async () => {
    const wrapper = mount(AIGuidePanel)

    const step1 = boxes(wrapper)[0]
    const step2 = boxes(wrapper)[1]

    // Complete step 1 -> accordion advances, step 2 opens.
    await step1.trigger('click')
    expect(boxes(wrapper)[0].attributes('aria-pressed')).toBe('true')

    // Complete step 2 -> accordion advances to step 3, step 2 collapses.
    await step2.trigger('click')

    // The collapsed step 2 MUST still read as checked.
    expect(boxes(wrapper)[1].attributes('aria-pressed')).toBe('true')
  })

  it('completes and advances via the explicit "Done" button in the body', async () => {
    const wrapper = mount(AIGuidePanel)

    const doneBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Done — next step'))
    expect(doneBtn).toBeTruthy()

    await doneBtn!.trigger('click')

    // Step 1 checked, and it survives being collapsed.
    expect(boxes(wrapper)[0].attributes('aria-pressed')).toBe('true')
  })

  it('does not check a step when its header is clicked to collapse', async () => {
    const wrapper = mount(AIGuidePanel)

    // Complete step 1 so step 2 becomes the open one.
    await boxes(wrapper)[0].trigger('click')

    // Click step 2's HEADER row (not the checkbox) — should only collapse.
    const step2Header = wrapper.findAll('[data-step-header]')[1]
    await step2Header.trigger('click')

    expect(boxes(wrapper)[1].attributes('aria-pressed')).toBe('false')
  })
})
