import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SourceRefPill from '../../src/components/editor/SourceRefPill.vue'
import { parseSourceRef } from '../../src/utils/sourceRef'

describe('parseSourceRef utility (sources/markdown/ path format)', () => {
  it('parses canonical source reference string with line number', () => {
    const res = parseSourceRef('sources/markdown/The_Goonies.md#L13')
    expect(res.isValid).toBe(true)
    expect(res.filePath).toBe('sources/markdown/The_Goonies.md')
    expect(res.fileName).toBe('The_Goonies.md')
    expect(res.startLine).toBe(13)
    expect(res.endLine).toBe(13)
  })

  it('parses canonical source reference string with accented unicode characters', () => {
    const res = parseSourceRef('sources/markdown/Una_noche_en_la_ópera.md#L62')
    expect(res.isValid).toBe(true)
    expect(res.filePath).toBe('sources/markdown/Una_noche_en_la_ópera.md')
    expect(res.fileName).toBe('Una_noche_en_la_ópera.md')
    expect(res.startLine).toBe(62)
  })

  it('parses canonical line range in source reference string', () => {
    const res = parseSourceRef('sources/markdown/interviews/interview.md#L12-L45')
    expect(res.isValid).toBe(true)
    expect(res.filePath).toBe('sources/markdown/interviews/interview.md')
    expect(res.fileName).toBe('interview.md')
    expect(res.startLine).toBe(12)
    expect(res.endLine).toBe(45)
  })

  it('parses a full-file reference with no line anchor', () => {
    const res = parseSourceRef('sources/markdown/clientA/report.md')
    expect(res.isValid).toBe(true)
    expect(res.filePath).toBe('sources/markdown/clientA/report.md')
    expect(res.fileName).toBe('report.md')
    expect(res.startLine).toBeUndefined()
    expect(res.endLine).toBeUndefined()
  })

  it('rejects strings that do not carry the sources/markdown/ prefix', () => {
    expect(parseSourceRef('Just plain text').isValid).toBe(false)
    expect(parseSourceRef('The_Goonies.md#L13').isValid).toBe(false)
    expect(parseSourceRef('src-003 (sources/markdown/The_Goonies.md#L13)').isValid).toBe(false)
    expect(parseSourceRef('sources/original/The_Goonies.docx').isValid).toBe(false)
  })

  it('rejects empty and non-string input', () => {
    expect(parseSourceRef('').isValid).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(parseSourceRef(undefined as any).isValid).toBe(false)
  })
})

describe('SourceRefPill component', () => {
  it('renders pill with link icon and file name (no synthetic id) when given valid canonical reference string', () => {
    const wrapper = mount(SourceRefPill, {
      props: {
        rawValue: 'sources/markdown/Una_noche_en_la_ópera.md#L62',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.text()).toContain('Una_noche_en_la_ópera.md')
    expect(wrapper.text()).toContain(':L62')
    expect(wrapper.text()).not.toContain('src-')
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
