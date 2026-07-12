import { describe, it, expect } from 'vitest'
import { parseVersion, formatVersion, incrementPatch, extractVersionFromFilename, replaceVersionInFilename } from './version.js'

describe('parseVersion', () => {
  it.each([
    ['V_0-1-0', { major: 0, minor: 1, patch: 0 }],
    ['V_1-2-3', { major: 1, minor: 2, patch: 3 }],
    ['V_1', { major: 1, minor: 0, patch: 0 }],
    ['V_10-20-30', { major: 10, minor: 20, patch: 30 }],
  ])('parses %s', (input, expected) => {
    expect(parseVersion(input)).toEqual(expected)
  })

  it('returns null for invalid version', () => {
    expect(parseVersion('invalid')).toBeNull()
    expect(parseVersion('')).toBeNull()
  })
})

describe('formatVersion', () => {
  it('formats correctly', () => {
    expect(formatVersion({ major: 0, minor: 1, patch: 0 })).toBe('V_0-1-0')
    expect(formatVersion({ major: 1, minor: 2, patch: 3 })).toBe('V_1-2-3')
  })
})

describe('incrementPatch', () => {
  it.each([
    ['V_0-1-0', 'V_0-1-1'],
    ['V_1-0-0', 'V_1-0-1'],
    ['V_1', 'V_1-0-1'],
  ])('%s → %s', (input, expected) => {
    expect(incrementPatch(input)).toBe(expected)
  })

  it('returns null for invalid input', () => {
    expect(incrementPatch('bad')).toBeNull()
  })
})

describe('extractVersionFromFilename', () => {
  it.each([
    ['Foo_V_0-1-0_bar_NN.md', 'V_0-1-0'],
    ['Lean_Business_Plan_V_0-1-0_business_NN.md', 'V_0-1-0'],
    ['test_V_1-0-0_business_NN.md', 'V_1-0-0'],
  ])('%s → %s', (filename, expected) => {
    expect(extractVersionFromFilename(filename)).toBe(expected)
  })
})

describe('replaceVersionInFilename', () => {
  it('replaces version correctly', () => {
    expect(replaceVersionInFilename('Foo_V_0-1-0_bar_NN.md', 'V_0-1-1')).toBe('Foo_V_0-1-1_bar_NN.md')
    expect(replaceVersionInFilename('Lean_Business_V_0-1-0_business_NN.md', 'V_0-1-1')).toBe('Lean_Business_V_0-1-1_business_NN.md')
  })
})
