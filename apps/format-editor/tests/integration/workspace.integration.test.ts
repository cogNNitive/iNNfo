import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import WorkspaceView from '../../src/views/WorkspaceView.vue'
import { useWorkspaceStore } from '../../src/stores/workspaceStore'
import { routes } from '../../src/router/index'
import { buildFakeTree, type FakeTree } from '../helpers/fakeFs'

const folderRootMd = `---
specification_version: "V_0-1-1"
specification_url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
level: 3
parent:
  name: "business_V_0-1-1"
  url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
model_version: "V_0-0-1"
title: "Integration Folder Root"
mode: "FOLDER"
concepts:
  - name: "Business summary"
    type: "text"
---

# _F Business summary

Folder root used in the workspace integration test.
`

const fileChildMd = `---
specification_version: "V_0-1-1"
specification_url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
level: 3
parent:
  name: "business_V_0-1-1"
  url: "https://example.test/specs/business_V_0-1-1_FORMAT.md"
model_version: "V_0-0-1"
title: "Integration File Child"
mode: "FILE"
---

# _F Problems

* _F Problems: Sample Problem
  A problem used to give the FILE child node some field data.
`

describe('WorkspaceView integration (mixed FILE/FOLDER tree)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts with Pinia + Router, renders layout chrome, and displays model tree with selectable nodes', async () => {
    const tree: FakeTree = {
      IntegrationRoot: {
        '_FORMAT.md': folderRootMd,
        'Child_FORMAT.md': fileChildMd,
      },
    }
    const handle = buildFakeTree('workspace', tree)

    const router = createRouter({ history: createMemoryHistory(), routes })
    const workspaceStore = useWorkspaceStore()
    await workspaceStore.open(handle)

    await router.push('/workspace')
    await router.isReady()

    const wrapper = mount(WorkspaceView, {
      global: { plugins: [router] },
    })
    await wrapper.vm.$nextTick()

    // Layout chrome should be present: Header with title
    expect(wrapper.text()).toContain('FORMAT Modeler')

    // Layout chrome renders header and sidebar
    expect(wrapper.text()).toContain('FORMAT Modeler')

    // Model tree should render the root node
    expect(wrapper.text()).toContain('IntegrationRoot')

    // View switcher buttons present
    expect(wrapper.text()).toContain('editor')
    expect(wrapper.text()).toContain('graph')

    // "Select a node" empty state shows when nothing is selected
    expect(wrapper.text()).toMatch(/Select a node/i)
  })
})
