import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ActiveView =
  | 'editor'
  | 'explorer'
  | 'graph'
  | 'matrices'
  | 'info'
  | 'ai-guide'
  | 'import'
  | 'export'
  | 'guided-procedure'

export type AiTab = 'guide' | 'import' | 'export'

export type GhostFilterMode = 'model' | 'all'

export type ExplorerFilterMode = 'all' | 'models' | 'sources' | 'artifacts'

/**
 * UI-only state that does not belong in modelStore.
 *
 * Following the design decision: modelStore stays a clean data graph with zero
 * UI state. All view-only state (selected node, active perspective, active
 * view) lives in uiStore.
 */
export const useUiStore = defineStore('ui', () => {
  const activeModelId = ref<string | null>(null)
  const activeConcept = ref<string | null>(null)
  const activePerspective = ref<string>('default')
  const activeView = ref<ActiveView>('editor')
  const selectedNodeId = ref<string | null>(null)
  const selectedInstanceId = ref<string | null>(null)
  const activeMatrixIndex = ref<number>(-1)
  const showValidationReport = ref(false)
  const showMetamatrixConfig = ref(false)
  const showSaveWorkspaceModal = ref(false)
  const showAiModal = ref(false)
  const activeAiTab = ref<AiTab>('guide')
  const ghostFilterMode = ref<GhostFilterMode>('all')
  const explorerFilterMode = ref<ExplorerFilterMode>('all')
  const isSearchOpen = ref(false)
  const searchQuery = ref('')
  const searchConceptFilter = ref('all')

  function setActiveModel(id: string | null): void {
    activeModelId.value = id
  }

  function setActiveConcept(name: string | null): void {
    activeConcept.value = name
  }

  function setActivePerspective(id: string): void {
    activePerspective.value = id
  }

  function setActiveView(view: ActiveView): void {
    activeView.value = view
  }

  function selectNode(id: string | null): void {
    selectedNodeId.value = id
  }

  function selectInstance(id: string | null): void {
    selectedInstanceId.value = id
  }

  function setActiveMatrixIndex(index: number): void {
    activeMatrixIndex.value = index
  }

  function setShowValidationReport(val: boolean): void {
    showValidationReport.value = val
  }

  function setShowSaveWorkspaceModal(val: boolean): void {
    showSaveWorkspaceModal.value = val
  }

  function setGhostFilterMode(mode: GhostFilterMode): void {
    ghostFilterMode.value = mode
  }

  function setExplorerFilterMode(mode: ExplorerFilterMode): void {
    explorerFilterMode.value = mode
  }

  function setShowAiModal(val: boolean): void {
    showAiModal.value = val
  }

  function setActiveAiTab(tab: AiTab): void {
    activeAiTab.value = tab
  }

  function toggleSearchOpen(): void {
    isSearchOpen.value = !isSearchOpen.value
    if (!isSearchOpen.value) {
      searchQuery.value = ''
      searchConceptFilter.value = 'all'
    }
  }

  function setSearchOpen(val: boolean): void {
    isSearchOpen.value = val
    if (!val) {
      searchQuery.value = ''
      searchConceptFilter.value = 'all'
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function setSearchConceptFilter(concept: string): void {
    searchConceptFilter.value = concept
  }

  function clearSearch(): void {
    searchQuery.value = ''
    searchConceptFilter.value = 'all'
  }

  return {
    activeModelId,
    activeConcept,
    activePerspective,
    activeView,
    selectedNodeId,
    selectedInstanceId,
    activeMatrixIndex,
    showValidationReport,
    showMetamatrixConfig,
    showSaveWorkspaceModal,
    showAiModal,
    activeAiTab,
    ghostFilterMode,
    explorerFilterMode,
    isSearchOpen,
    searchQuery,
    searchConceptFilter,
    setActiveModel,
    setActiveConcept,
    setActivePerspective,
    setActiveView,
    selectNode,
    selectInstance,
    setActiveMatrixIndex,
    setShowValidationReport,
    setShowSaveWorkspaceModal,
    setShowAiModal,
    setActiveAiTab,
    setGhostFilterMode,
    setExplorerFilterMode,
    toggleSearchOpen,
    setSearchOpen,
    setSearchQuery,
    setSearchConceptFilter,
    clearSearch,
  }
})

