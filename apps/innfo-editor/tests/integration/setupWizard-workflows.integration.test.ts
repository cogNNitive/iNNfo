import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import SetupWizard from '../../src/components/layout/SetupWizard.vue'
import { routes } from '../../src/router/index'
import { buildFakeTree, readFakeTree } from '../helpers/fakeFs'

describe('SetupWizard — workflow files in initWorkspaceStructure', () => {
  beforeAll(() => {
    // Mock fetch globally: all transform file downloads return mock content
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Mock transform file content'),
      }),
    ) as unknown as typeof globalThis.fetch
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function mountWizard() {
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(SetupWizard, {
      global: { plugins: [router, createPinia()] },
    })
    await router.isReady()
    return wrapper
  }

  function buildEmptyTree() {
    const tree: Record<string, unknown> = {}
    return { tree, handle: buildFakeTree('workspace', tree) }
  }

  it('creates workflows/ directory with export.workflow.md and import.workflow.md', async () => {
    const { tree, handle } = buildEmptyTree()
    const wrapper = await mountWizard()

    await wrapper.vm.initWorkspaceStructure(handle, 'TestModel', 'business')

    // Verify workflow directory was created
    const traNNsformDir = tree['traNNsform'] as Record<string, unknown> | undefined
    expect(traNNsformDir).toBeTruthy()
    const workflowsDir = traNNsformDir!['workflows']
    expect(workflowsDir).toBeTruthy()

    // Verify workflow files exist with non-empty content
    const exportContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/workflows/export.workflow.md',
    )
    const importContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/workflows/import.workflow.md',
    )

    expect(exportContent).toBeTruthy()
    expect(typeof exportContent).toBe('string')
    expect(exportContent!.length).toBeGreaterThan(0)

    expect(importContent).toBeTruthy()
    expect(typeof importContent).toBe('string')
    expect(importContent!.length).toBeGreaterThan(0)
  })

  it('workflow file content is valid markdown (starts with #)', async () => {
    const { tree, handle } = buildEmptyTree()
    const wrapper = await mountWizard()

    await wrapper.vm.initWorkspaceStructure(handle, 'TestModel', 'business')

    const exportContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/workflows/export.workflow.md',
    )
    const importContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/workflows/import.workflow.md',
    )

    // Validate content: mock returns '# Mock transform file content'
    expect(exportContent).toMatch(/^#/)
    expect(importContent).toMatch(/^#/)
  })

  it('handles fetch failure gracefully — no crash, other files still created', async () => {
    // Override fetch to fail for workflow files specifically
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn((url: string) => {
      if (typeof url === 'string' && url.includes('workflow')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve(''),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Mock file content'),
      } as Response)
    }) as unknown as typeof globalThis.fetch

    const { tree, handle } = buildEmptyTree()
    const wrapper = await mountWizard()

    // Should not throw
    await expect(
      wrapper.vm.initWorkspaceStructure(handle, 'TestModel', 'business'),
    ).resolves.toBeUndefined()

    // Workflow files should NOT be created (fetch failed)
    const exportContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/workflows/export.workflow.md',
    )
    expect(exportContent).toBeUndefined()

    // But AGENT.md should still exist (unrelated files unaffected)
    const agentContent = readFakeTree(
      tree as Record<string, string | Record<string, unknown>>,
      'traNNsform/AGENT.md',
    )
    expect(agentContent).toBeDefined()

    // Restore the default mock
    globalThis.fetch = originalFetch
  })
})
