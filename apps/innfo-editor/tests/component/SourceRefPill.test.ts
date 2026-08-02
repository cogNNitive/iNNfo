import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SourceRefPill from '../../src/components/editor/SourceRefPill.vue'
import { parseSourceRef } from '../../src/utils/sourceRef'

describe('parseSourceRef utility', () => {
  it('parses standard source reference string with line number', () => {
    const res = parseSourceRef('src-003 (sources/markdown/The_Goonies.md#L13)')
    expect(res.isValid).toBe(true)
    expect(res.sourceId).toBe('src-003')
    expect(res.filePath).toBe('sources/markdown/The_Goonies.md')
    expect(res.fileName).toBe('The_Goonies.md')
    expect(res.startLine).toBe(13)
  })

  it('parses line range in source reference string', () => {
    const res = parseSourceRef('src-001 (raw/interview.pdf#L12-L45)')
    expect(res.isValid).toBe(true)
    expect(res.sourceId).toBe('src-001')
    expect(res.filePath).toBe('raw/interview.pdf')
    expect(res.fileName).toBe('interview.pdf')
    expect(res.startLine).toBe(12)
    expect(res.endLine).toBe(45)
  })

  it('returns invalid for standard string without reference pattern', () => {
    const res = parseSourceRef('Just plain text value')
    expect(res.isValid).false
  })
})

describe('SourceRefPill component', () => {
  it('renders pill with link icon when given valid reference string', () => {
    const wrapper = mount(SourceRefPill, {
      props: {
        rawValue: 'src-003 (sources/markdown/The_Goonies.md#L13)',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.text()).toContain('src-003')
    expect(wrapper.text()).toContain('The_Goonies.md')
    expect(wrapper.text()).toContain(':L13')
  })

  it('renders plain text when given invalid reference string', () => {
    const wrapper = mount(SourceRefPill, {
      props: {
        rawValue: 'Plain string without ref',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.text()).toBe('Plain string without ref')
  })
})
