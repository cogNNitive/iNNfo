import { describe, it, expect } from 'vitest'
import { recursiveParse } from '../../src/model/recursiveParser'
import { buildFakeTree, type FakeTree } from '../helpers/fakeFs'

const validFormatMd = `---
specification_version: "V_0-1-1"
specification_url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
level: 3
parent:
  name: "business_V_0-1-1"
  url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
model_version: "V_0-0-1"
title: "Valid Folder"
mode: "FOLDER"
---

# _F Business summary

A valid sibling folder used to confirm isolated read failures don't abort the whole walk.
`

describe('recursiveParser: recursive read across mixed tree', () => {
  it('places all nodes (root + descendants, regardless of mode) in the same graph', async () => {
    const explicitTree: FakeTree = {
      Root: {
        '_FORMAT.md': validFormatMd,
        'Sibling_FORMAT.md': validFormatMd,
        Nested: {
          '_FORMAT.md': validFormatMd,
        },
      },
    }

    const root = buildFakeTree('workspace', explicitTree)
    const result = await recursiveParse(root)

    expect(result.issues).toHaveLength(0)
    const names = Object.values(result.nodes).map((n) => n.name)
    expect(names).toContain('Root')
    expect(names).toContain('Sibling')
    expect(names).toContain('Nested')
  })

  it('isolates a malformed node so sibling nodes still parse (read failure isolated)', async () => {
    const tree: FakeTree = {
      Root: {
        '_FORMAT.md': validFormatMd,
        Broken: {
          // Intentionally missing _FORMAT.md to trigger a read failure for this node.
          'notes.txt': 'no _FORMAT.md here',
        },
        Healthy: {
          '_FORMAT.md': validFormatMd,
        },
      },
    }

    const root = buildFakeTree('workspace', tree)
    const result = await recursiveParse(root)

    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.issues.some((i) => i.path.includes('Broken'))).toBe(true)

    const names = Object.values(result.nodes).map((n) => n.name)
    expect(names).toContain('Root')
    expect(names).toContain('Healthy')
    expect(names).not.toContain('Broken')
  })
})
