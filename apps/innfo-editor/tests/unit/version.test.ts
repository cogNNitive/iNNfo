import { describe, it, expect } from 'vitest'
import { buildFormatFilename, parseFormatFilename } from '../../src/utils/version'

describe('version utilities', () => {
  it('buildFormatFilename sanitizes spaces in baseName into hyphens', () => {
    const filename = buildFormatFilename('My Model Name', 'business', {
      major: 1,
      minor: 2,
      patch: 3,
    })
    expect(filename).toBe('My-Model-Name_V_1-2-3_business_NN.md')
  })

  it('buildFormatFilename preserves existing dashes', () => {
    const filename = buildFormatFilename('My-Model-Name', 'procedures', {
      major: 0,
      minor: 1,
      patch: 0,
    })
    expect(filename).toBe('My-Model-Name_V_0-1-0_procedures_NN.md')
  })

  it('parseFormatFilename correctly parses a compliant filename', () => {
    const parsed = parseFormatFilename('My-Model-Name_V_1-2-3_business_NN.md')
    expect(parsed).not.toBeNull()
    expect(parsed!.baseName).toBe('My-Model-Name')
    expect(parsed!.templateName).toBe('business')
    expect(parsed!.version).toEqual({ major: 1, minor: 2, patch: 3 })
  })
})
