import { describe, it, expect } from 'vitest'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mkdtemp, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { integrateGate } from './integrate.js'

const MODEL_CONTENT = `---
spec_version: "V_0-2-0"
level: 3
parent_spec:
  name: "business_V_0-1-1"
  url: "https://example.com/business"
model_version: "V_0-1-0"
title: "Test"
---

> [!NOTE]
> This is a **iNNfo document**.

# _NN index

- [[Test]]
`

async function withTempModel(fn: (dir: string, filePath: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), 'pipeline-test-'))
  const filePath = join(dir, 'Test_V_0-1-0_business_NN.md')
  await writeFile(filePath, MODEL_CONTENT, 'utf-8')
  try {
    await fn(dir, filePath)
  } finally {
    await unlink(filePath).catch(() => {})
    await unlink(join(dir, 'index.md')).catch(() => {})
  }
}

describe('integrateGate', () => {
  it('increments patch version in dry-run mode', async () => {
    await withTempModel(async (dir, filePath) => {
      const result = await integrateGate({ filePath, dryRun: true })
      expect(result.passed).toBe(true)
      expect(result.newVersion).toBe('V_0-1-1')
      expect(result.newFilePath).toContain('Test_V_0-1-1_business_NN.md')
    })
  })

  it('writes updated file with new version', async () => {
    await withTempModel(async (dir, filePath) => {
      const result = await integrateGate({ filePath, targetDir: dir })
      expect(result.passed).toBe(true)
      const content = await readFile(result.newFilePath!, 'utf-8')
      expect(content).toContain('model_version: "V_0-1-1"')
      expect(content).toContain('V_0-1-1')
    })
  })

  it('creates index.md with wiki link', async () => {
    await withTempModel(async (dir, filePath) => {
      await integrateGate({ filePath, targetDir: dir })
      const indexContent = await readFile(join(dir, 'index.md'), 'utf-8')
      expect(indexContent).toContain('[[Test_V_0-1-1_business]]')
    })
  })

  it('appends to existing index.md', async () => {
    await withTempModel(async (dir, filePath) => {
      await writeFile(join(dir, 'index.md'), '# Workspace index\n\n## Models\n- [[Existing]]\n', 'utf-8')
      await integrateGate({ filePath, targetDir: dir })
      const indexContent = await readFile(join(dir, 'index.md'), 'utf-8')
      expect(indexContent).toContain('[[Existing]]')
      expect(indexContent).toContain('[[Test_V_0-1-1_business]]')
    })
  })
})
