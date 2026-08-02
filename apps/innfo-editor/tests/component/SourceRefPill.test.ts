import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SourceRefPill from '../../src/components/editor/SourceRefPill.vue'
import { parseSourceRef } from '../../src/utils/sourceRef'

describe('parseSourceRef utility (strict V_0-3-0)', () => {
  it('parses canonical source reference string with line number', () => {
    const res = parseSourceRef('src-003 (sources/markdown/The_Goonies.md#L13)')
    expect(res.isValid).toBe(true)
    expect(res.sourceId).toBe('src-003')
    expect(res.filePath).toBe('sources/markdown/The_Goonies.md')
    expect(res.fileName).toBe('The_Goonies.md')
    expect(res.startLine).toBe(13)
  })

  it('parses canonical source reference string with accented unicode characters', () => {
    const res = parseSourceRef('src-004 (sources/markdown/Una_noche_en_la_ópera.md#L62)')
    expect(res.isValid).toBe(true)
    expect(res.sourceId).toBe('src-004')
    expect(res.filePath).toBe('sources/markdown/Una_noche_en_la_ópera.md')
    expect(res.fileName).toBe('Una_noche_en_la_ópera.md')
    expect(res.startLine).toBe(62)
  })

  it('parses canonical line range in source reference string', () => {
    const res = parseSourceRef('src-001 (raw/interview.pdf#L12-L45)')
    expect(res.isValid).toBe(true)
    expect(res.sourceId).toBe('src-001')
    expect(res.filePath).toBe('raw/interview.pdf')
    expect(res.fileName).toBe('interview.pdf')
    expect(res.startLine).toBe(12)
    expect(res.endLine).toBe(45)
  })

  it('rejects non-canonical legacy strings without src-NNN (path#lines) envelope', () => {
    expect(parseSourceRef('Just plain text').isValid).toBe(false)
    expect(parseSourceRef('The_Goonies.md#L13').isValid).toBe(false)
    expect(parseSourceRef('sources/markdown/The_Goonies.md').isValid).toBe(false)
  })
})

describe('SourceRefPill component', () => {
  it('renders pill with link icon when given valid canonical reference string', () => {
    const wrapper = mount(SourceRefPill, {
      props: {
        rawValue: 'src-004 (sources/markdown/Una_noche_en_la_ópera.md#L62)',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.text()).toContain('src-004')
    expect(wrapper.text()).toContain('Una_noche_en_la_ópera.md')
    expect(wrapper.text()).toContain(':L62')
  })

  it('renders plain text when given non-canonical reference string', () => {
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
