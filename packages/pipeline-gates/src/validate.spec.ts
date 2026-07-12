import { describe, it, expect } from 'vitest'
import { writeFile, unlink, mkdtemp } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { validateGate } from './validate.js'

const VALID_MODEL = `---
spec_version: "V_0-2-0"
spec_url: "https://example.com/spec"
level: 3
parent_spec:
  name: "business_V_0-1-1"
  url: "https://example.com/business"
model_version: "V_0-1-0"
title: "Test Model"
---

> [!NOTE]
> This is a **iNNfo document** — a plain-text Markdown file.

# _NN index

- [[Test]]
`

async function withTempFile(name: string, content: string, fn: (path: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), 'pipeline-val-'))
  const filePath = join(dir, name)
  await writeFile(filePath, content, 'utf-8')
  try {
    await fn(filePath)
  } finally {
    await unlink(filePath).catch(() => {})
  }
}

describe('validateGate', () => {
  it('passes valid model', async () => {
    await withTempFile('Test_V_0-1-0_business_NN.md', VALID_MODEL, async (fp) => {
      const result = await validateGate({ filePath: fp, skipMcp: true })
      expect(result.passed).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  it('rejects _NN_draft.md naming', async () => {
    await withTempFile('Test_V_0-1-0_business_NN_draft.md', VALID_MODEL, async (fp) => {
      const result = await validateGate({ filePath: fp, skipMcp: true })
      expect(result.passed).toBe(false)
      expect(result.errors[0]).toContain('_NN_draft.md')
    })
  })

  it('rejects non-_NN.md suffix', async () => {
    await withTempFile('test.md', '', async (fp) => {
      const result = await validateGate({ filePath: fp, skipMcp: true })
      expect(result.passed).toBe(false)
      expect(result.errors[0]).toContain('_NN.md')
    })
  })

  it('rejects missing version in filename', async () => {
    await withTempFile('Foo_bar_NN.md', VALID_MODEL, async (fp) => {
      const result = await validateGate({ filePath: fp, skipMcp: true })
      expect(result.passed).toBe(false)
      expect(result.errors.some((e) => e.includes('pattern'))).toBe(true)
    })
  })
})
