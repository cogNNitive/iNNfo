<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent, type Component } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/layout/Header.vue'
import SampleBanner from '../components/layout/SampleBanner.vue'
import LeftSidebar from '../components/layout/LeftSidebar.vue'
import RightGuidanceSidebar from '../components/layout/RightGuidanceSidebar.vue'
import ValidationReport from '../components/ValidationReport.vue'
import ToastMessage from '../components/ToastMessage.vue'
import SaveWorkspaceModal from '../components/layout/SaveWorkspaceModal.vue'
import OnboardingDashboard from '../components/layout/OnboardingDashboard.vue'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useModelStore } from '../stores/modelStore'
import { useUiStore, type ActiveView } from '../stores/uiStore'
import { useMetamodelStore } from '../stores/metamodelStore'
import { useToast } from '../shared/useToast'
import { useHashSync } from '../composables/useHashSync'
import { ValidationService } from '../services/ValidationService'
import type { ModelNode } from '../model/types'

// Dynamic sub-editors
const BlockFeed = defineAsyncComponent(() => import('../components/editor/BlockFeed.vue'))
const BlockSheet = defineAsyncComponent(() => import('../components/editor/BlockSheet.vue'))
const TextEditor = defineAsyncComponent(() => import('../components/editor/TextEditor.vue'))
const TreeEditor = defineAsyncComponent(() => import('../components/editor/TreeEditor.vue'))
const GraphViewer = defineAsyncComponent(() => import('../components/editor/GraphViewer.vue'))
const MatricesGrid = defineAsyncComponent(() => import('../components/editor/MatricesGrid.vue'))
const ConceptTableView = defineAsyncComponent(
  () => import('../components/editor/ConceptTableView.vue'),
)
const MetamatrixConfig = defineAsyncComponent(
  () => import('../components/editor/MetamatrixConfig.vue'),
)
const ModelInfoPanel = defineAsyncComponent(() => import('../components/editor/ModelInfoPanel.vue'))
const AiWorkflowPanel = defineAsyncComponent(() => import('../components/editor/AiWorkflowPanel.vue'))


const router = useRouter()
const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()
const uiStore = useUiStore()
const metamodelStore = useMetamodelStore()
const { show } = useToast()
const validationService = new ValidationService(modelStore, show)

// ── Hash sync ──
// Syncs uiStore.selectedNodeId with the URL hash (#conceptName.elementName)
useHashSync()

// ── Toolbar / validation state ──
const validationReport = computed(() => modelStore.validationReport)
const validating = ref(false)

// Validation report is set silently on import (auto-run in setGraph → validateModel).
// The overlay only opens on explicit Validate button click (runValidation).

const selectedNodeId = computed(() => uiStore.selectedNodeId)

const selectedNode = computed(() => {
  const id = selectedNodeId.value
  if (!id) return null
  if (id.startsWith('virtual:')) {
    const parts = id.split(':')
    const parentId = parts[1]
    const conceptName = parts[2]
    const parentNode = modelStore.getNode(parentId)
    if (!parentNode) return null

    const childIds = parentNode.childIds.filter((cid) => {
      const child = modelStore.getNode(cid)
      return child?.type === conceptName && child?.kind === 'element'
    })

    return {
      id,
      name: conceptName,
      parentId,
      childIds,
      type: conceptName,
      kind: 'concept',
      fields: {},
      markers: {},
      relationships: [],
      rawSections: {},
      source: parentNode.source,
    } as any
  }
  return modelStore.getNode(id)
})

const selectedNodeName = computed(() => selectedNode.value?.name ?? '')
const selectedNodeType = computed(() => selectedNode.value?.type ?? 'text')
const conceptType = computed(() => {
  return selectedNode.value?.conceptBinding?.name ?? selectedNode.value?.type ?? null
})
const rootNode = computed(() => {
  const ids = modelStore.rootIds
  return ids.length > 0 ? modelStore.getNode(ids[0]) : null
})

/** Determines which editor sub-view to render based on node characteristics. */
const isConceptLike = (node: { kind?: string }) => node.kind === 'concept' || node.kind === 'root'

const editorView = computed<'text' | 'tree' | 'sheet' | 'table'>(() => {
  if (!selectedNode.value) return 'sheet'
  // If it's a concept-like node
  if (isConceptLike(selectedNode.value)) {
    if (selectedNode.value.type === 'text') {
      return 'text'
    }
    return 'table'
  }
  // Nodes with rawContent show TextEditor
  if (selectedNode.value.rawContent) {
    return 'text'
  }
  // Nodes with children get the TreeEditor (structural)
  if (selectedNode.value.childIds.length > 0) {
    return 'tree'
  }
  // Everything else gets a BlockSheet view
  return 'sheet'
})

const getConceptFieldsForNode = (node: ModelNode) => {
  const metamodelFields = metamodelStore.getConceptFields(node.type) ?? []
  const fieldsMap = new Map<string, { name: string; type: string; [key: string]: any }>()

  for (const f of metamodelFields) {
    fieldsMap.set(f.name, { ...f })
  }

  if (node.fields) {
    for (const [key, fv] of Object.entries(node.fields)) {
      if (!fieldsMap.has(key)) {
        const val = (fv as any).value
        const rawType = typeof val
        let type = rawType === 'boolean' ? 'boolean' : 'string'
        if (rawType === 'number') {
          type = Number.isInteger(val) && val >= 1 && val <= 5 ? 'rating' : 'number'
        } else if (rawType === 'string') {
          if (/^#[0-9a-fA-F]{6}$/.test(val)) type = 'color'
          else if (/^https?:\/\//.test(val)) type = 'url'
          else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) type = 'date'
        }
        fieldsMap.set(key, { name: key, type })
      }
    }
  }

  return Array.from(fieldsMap.values())
}

const activeConceptFields = computed(() => {
  const node = selectedNode.value
  if (!node) return []
  return getConceptFieldsForNode(node)
})

const conceptBlock = computed(() => {
  const node = selectedNode.value
  if (!node) return { id: '', name: '', description: '' }
  const metamodelFields = metamodelStore.getConceptFields(node.type) ?? []
  const fields: Record<string, any> = {}

  for (const f of metamodelFields) {
    fields[f.name] = f.type === 'boolean' ? false : ''
  }

  if (node.fields) {
    for (const [k, fv] of Object.entries(node.fields)) {
      fields[k] = (fv as any).value
    }
  }

  return {
    id: node.id,
    name: node.name,
    description: node.rawSections?.description || '',
    fields,
  }
})

const childItems = computed(() => {
  const node = selectedNode.value
  if (!node) return []
  return node.childIds
    .map((id: string) => modelStore.getNode(id))
    .filter((n: ModelNode | undefined): n is ModelNode => !!n)
    .map((n: ModelNode) => ({
      id: n.id,
      name: n.name,
      description: n.rawSections?.description || '',
      fields: Object.fromEntries(
        Object.entries(n.fields ?? {}).map(([k, fv]) => [k, (fv as any).value]),
      ),
    }))
})

const isListConcept = computed(() => childItems.value.length > 0)

// The active editor is a dynamic <component :is>: each editorView selects a
// different component with a different prop shape, correlated at runtime but
// not statically expressible. Type it as an opaque Component so vue-tsc does
// not try (and fail) to reconcile the prop unions at the binding site.
const activeEditorComponent = computed<Component>(() => {
  if (editorView.value === 'text') return TextEditor
  if (editorView.value === 'tree') return TreeEditor
  if (editorView.value === 'table') return BlockSheet
  return BlockFeed
})

const activeEditorProps = computed(() => {
  const nid = selectedNodeId.value ?? ''
  if (editorView.value === 'text') {
    return {
      nodeId: nid,
      conceptName: selectedNodeName.value,
      conceptType: selectedNodeType.value,
    }
  }
  if (editorView.value === 'tree') {
    return {
      nodeId: nid,
      conceptName: selectedNodeName.value,
    }
  }
  if (editorView.value === 'table') {
    return {
      block: conceptBlock.value,
      kind: 'concept',
      conceptType: selectedNodeType.value,
      conceptName: selectedNodeName.value,
      conceptFields: activeConceptFields.value,
      collapsed: false,
      isEditing: false,
    }
  }
  return {
    conceptName: selectedNodeName.value,
    conceptType: selectedNodeType.value,
    conceptBlock: conceptBlock.value,
    conceptFields: activeConceptFields.value,
    items: childItems.value,
    isListConcept: isListConcept.value,
  }
})

const activeEditorEvents = computed(() => {
  if (editorView.value === 'text') {
    return {
      change: onEditorChange,
    }
  }
  if (editorView.value === 'tree') {
    return {
      'navigate-to-node': onNavigateToNode,
    }
  }
  if (editorView.value === 'table') {
    return {
      change: onEditorChange,
      'navigate-to-node': onNavigateToNode,
      'update:concept-name': onConceptNameChange,
    }
  }
  return {
    'change-concept': onEditorChange,
    'change-item': onEditorChange,
    'change-concept-name': onConceptNameChange,
  }
})

// ── Event handlers ──

function onSelectNode(nodeId: string): void {
  uiStore.selectNode(nodeId)
  if (
    uiStore.activeView === 'matrices' ||
    uiStore.activeView === 'info'
  ) {
    uiStore.setActiveView('editor')
  }
}

function onEditorChange(): void {
  // Editor changes are tracked through provenance — nothing extra needed
}

function onConceptNameChange(newName: string): void {
  const node = selectedNode.value
  if (!node || !selectedNodeId.value) return
  modelStore.upsertNode({ ...node, name: newName })
  modelStore.markDirty(selectedNodeId.value)
}

function onNavigateToNode(nodeId: string): void {
  uiStore.selectNode(nodeId)
}

/** Switches the active view (editor / graph / matrices / info). */
function setActiveView(view: ActiveView): void {
  uiStore.setActiveView(view)
  if (view === 'matrices' && uiStore.activeMatrixIndex < 0) {
    for (const id of modelStore.rootIds) {
      const root = modelStore.getNode(id)
      if (!root) continue
      const defs = root.fields?.__matrix_defs?.value ?? root.fields?.matrices?.value
      if (Array.isArray(defs) && defs.length > 0) {
        uiStore.setActiveMatrixIndex(0)
        break
      }
    }
  }
}

function onSelectMatrix(idx: number): void {
  uiStore.setActiveMatrixIndex(idx)
  uiStore.setActiveView('matrices')
}

function onSelectView(view: string): void {
  if (view === 'metamatrix-config') {
    uiStore.setActiveView('matrices')
    uiStore.showMetamatrixConfig = !uiStore.showMetamatrixConfig
  }
}

// ── Validation ──

async function runValidation(): Promise<void> {
  if (!selectedNodeId.value) return

  validating.value = true

  try {
    const report = await validationService.runValidation(selectedNodeId.value)
    modelStore.validationReport = report
    if (report) {
      uiStore.setShowValidationReport(true)
    }
  } catch (err) {
    show(err instanceof Error ? err.message : 'Validation failed', 'error')
  } finally {
    validating.value = false
  }
}

/** Creates a new model from the sample template. Closes workspace first. */
function onSampleCreate(): void {
  const templateName = workspaceStore.sampleTemplateName
  workspaceStore.reset()
  modelStore.setGraph({}, [])
  uiStore.selectNode(null)
  router.push({ name: 'home', query: { createTemplate: templateName || undefined } })
}

/** No-op — dismissal state handled by SampleBanner via sessionStorage. */
function onSampleBannerDismiss(): void {
  // handled internally by SampleBanner
}

/** Resets the workspace and returns to home. */
function closeWorkspace(): void {
  if (modelStore.dirtyIds.size > 0) {
    const confirmLeave = confirm('Tenés cambios sin guardar. ¿Estás seguro de que querés salir?')
    if (!confirmLeave) return
  }
  workspaceStore.reset()
  modelStore.setGraph({}, [])
  uiStore.selectNode(null)
  router.push('/')
}

// ── Keyboard shortcuts ──

async function onKeydown(e: KeyboardEvent): Promise<void> {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (!workspaceStore.hasHandle) {
      uiStore.setShowSaveWorkspaceModal(true)
      return
    }
    try {
      await workspaceStore.saveActiveFile()
      show('Saved successfully.', 'success')
    } catch {
      show('Save failed.', 'error')
    }
  }
}

function onBeforeUnload(e: BeforeUnloadEvent): string | void {
  if (modelStore.dirtyIds.size > 0) {
    e.preventDefault()
    e.returnValue = 'Tenés cambios sin guardar. ¿Estás seguro de que querés salir?'
    return e.returnValue
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<template>
  <div class="flex flex-col h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <Header @close-workspace="closeWorkspace" />

    <SampleBanner
      v-if="workspaceStore.isSampleSession"
      :template-name="workspaceStore.sampleTemplateName"
      @create="onSampleCreate"
      @dismiss="onSampleBannerDismiss"
    />

    <div class="flex flex-1 overflow-hidden">
      <LeftSidebar
        @select-node="onSelectNode"
        @select-matrix="onSelectMatrix"
        @select-view="onSelectView"
      />

      <main class="flex-1 flex flex-col overflow-y-auto min-w-0">
        <!-- ── Editor View ── -->
        <template v-if="uiStore.activeView === 'editor'">
          <div
            v-if="selectedNodeId && !uiStore.showValidationReport"
            class="flex-1 p-4 overflow-y-auto"
          >
            <component
              :is="activeEditorComponent"
              :key="selectedNodeId"
              v-bind="activeEditorProps"
              v-on="activeEditorEvents"
            />
          </div>

          <div
            v-else-if="uiStore.showValidationReport && validationReport"
            class="flex-1 p-4 overflow-y-auto"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold">Validation Report</h3>
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                @click="uiStore.setShowValidationReport(false)"
              >
                Back to editor
              </button>
            </div>
            <ValidationReport :report="validationReport" />
          </div>

          <OnboardingDashboard v-else />
        </template>

        <!-- ── Graph View ── -->
        <template v-else-if="uiStore.activeView === 'graph'">
          <div class="flex-1 flex flex-col min-h-0">
            <GraphViewer
              :local-node-id="selectedNodeId ?? ''"
              :auto-select-concept="selectedNodeType"
              @select-node="onNavigateToNode"
            />
          </div>
        </template>

        <!-- ── Matrices View ── -->
        <template v-else-if="uiStore.activeView === 'matrices'">
          <div class="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
            <MetamatrixConfig v-if="uiStore.showMetamatrixConfig" class="mb-6" />
            <MatricesGrid
              :matrix-index="uiStore.activeMatrixIndex"
              @cell-change="(_key, _val) => {}"
            />
          </div>
        </template>

        <!-- ── Info View ── -->
        <template v-else-if="uiStore.activeView === 'info'">
          <div class="flex-1 p-4 overflow-y-auto">
            <ModelInfoPanel v-if="rootNode" :root-node-id="rootNode.id" />
            <p
              v-else
              class="flex items-center justify-center h-full text-sm text-slate-400 dark:text-slate-500"
            >
              No model loaded.
            </p>
          </div>
        </template>

        <!-- ── Exports View ── -->
        <template v-else-if="uiStore.activeView === 'exports'">
          <div class="flex-1 flex items-center justify-center p-4">
            <div class="text-center max-w-sm">
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Pick an export from the sidebar to open it in a new tab.
              </p>
            </div>
          </div>
        </template>

        <!-- ── AI Workflow View ── -->
        <template v-else-if="uiStore.activeView === 'ai-guide'">
          <div class="flex-1 flex flex-col min-h-0">
            <AiWorkflowPanel />
          </div>
        </template>
      </main>

      <RightGuidanceSidebar
        :concept-name="selectedNodeId ? modelStore.getNode(selectedNodeId)?.name : null"
        :concept-type="conceptType"
      />

      <ToastMessage />
      <SaveWorkspaceModal />
    </div>
  </div>
</template>
