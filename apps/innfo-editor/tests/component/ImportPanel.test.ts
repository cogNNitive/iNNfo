import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ImportPanel from '../../src/components/editor/ImportPanel.vue'
import { useWorkspaceStore } from '../../src/stores/workspaceStore'
import { buildFakeTree } from '../helpers/fakeFs'
import type { DirectoryHandleLike } from '../../src/model/fs-types'

describe('ImportPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows file list when traNNsform/input/ contains files', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'report.docx': 'report content',
          'notes.md': 'note content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    // Wait for async operations (getDirectoryHandle, entries)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('report.docx')
    expect(wrapper.text()).toContain('notes.md')
    expect(wrapper.text()).toContain('traNNsform/input/')
  })

  it('shows empty state when input/ directory is empty', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {},
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No files found')
  })

  it('shows guidance when traNNsform/ directory is missing', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {})
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('traNNsform')
    expect(wrapper.text()).toMatch(/not availabl|not found|re-init/i)
  })

  it('shows guidance when workspace handle is unavailable', () => {
    const workspaceStore = useWorkspaceStore()
    workspaceStore.handle = null
    workspaceStore.hasHandle = false

    const wrapper = mount(ImportPanel)

    expect(wrapper.text()).toContain('Open a model')
    expect(wrapper.text()).toContain('import')
  })

  it('displays a copy button for the agent prompt', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'report.docx': 'report content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    const copyBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('copy'))
    expect(copyBtn).toBeDefined()
  })

  it('refresh button re-scans and detects new files', async () => {
    const workspaceStore = useWorkspaceStore()
    // Start with no files
    const tree: Record<string, any> = {
      traNNsform: {
        input: {},
      },
    }
    const handle = buildFakeTree('workspace', tree)
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    // Initially empty
    expect(wrapper.text()).toContain('No files found')

    // Mutate the fake tree to add a file
    tree.traNNsform.input['new-doc.md'] = 'new content'

    // Click refresh button
    const refreshBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('refresh'))
    expect(refreshBtn).toBeDefined()
    await refreshBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    // Now the file should appear
    expect(wrapper.text()).toContain('new-doc.md')
  })

  it('agent prompt starts with "innfo:" prefix', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'doc.md': 'content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('innfo:')
  })

  it('agent prompt references workflows/import.workflow.md', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'doc.md': 'content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('workflows/import.workflow.md')
  })

  it('agent prompt does not contain explicit skill name', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'doc.md': 'content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('innv0-trannsform')
  })

  it('agent prompt does not contain "Files to import:" when input/ is empty', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {},
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    // Prompt content should show the static portion without file list
    expect(wrapper.text()).toContain('innfo:')
    expect(wrapper.text()).not.toContain('Files to import:')
  })

  it('agent prompt file list section is preserved', async () => {
    const workspaceStore = useWorkspaceStore()
    const handle = buildFakeTree('workspace', {
      traNNsform: {
        input: {
          'report.docx': 'report content',
          'notes.md': 'note content',
        },
      },
    })
    workspaceStore.handle = handle as DirectoryHandleLike
    workspaceStore.hasHandle = true

    const wrapper = mount(ImportPanel)
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Files to import:')
    expect(wrapper.text()).toContain('report.docx')
    expect(wrapper.text()).toContain('notes.md')
  })
})
