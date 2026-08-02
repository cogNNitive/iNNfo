<template>
  <aside
    data-testid="left-sidebar"
    class="relative border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col overflow-y-auto shrink-0"
    :style="{ width: width + 'px' }"
  >
    <!-- Resize handle (right edge) -->
    <div
      @pointerdown="startResize"
      class="absolute top-0 right-0 z-30 h-full w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors"
      title="Drag to resize"
      data-testid="resize-handle"
    ></div>

    <div class="px-3 py-4 space-y-4">
      <!-- Navigation Switcher (Horizontal) -->
      <div class="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
        <!-- Editor -->
        <button
          class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize border border-transparent"
          :class="
            uiStore.activeView === 'editor'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('editor')"
          data-testid="view-switcher-editor"
        >
          <FileText class="w-3.5 h-3.5 shrink-0" />
          <span>editor</span>
        </button>

        <!-- Graph -->
        <button
          class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize border border-transparent"
          :class="
            uiStore.activeView === 'graph'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('graph')"
          data-testid="view-switcher-graph"
        >
          <LayoutDashboard class="w-3.5 h-3.5 shrink-0" />
          <span>graph</span>
        </button>

        <!-- Exports -->
        <button
          class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize border border-transparent"
          :class="
            uiStore.activeView === 'exports'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('exports')"
          data-testid="view-switcher-exports"
        >
          <FileOutput class="w-3.5 h-3.5 shrink-0" />
          <span>exports</span>
        </button>
      </div>

      <!-- Header with expand/collapse all + ghost filter -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-1.5">
          <Database class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Workspace
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <!-- Ghost filter: show complete only -->
          <button
            @click="toggleGhostFilter"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-2xs transition-colors flex items-center justify-center gap-1"
            :class="
              ghostFilterMode === 'model'
                ? 'text-primary dark:text-primary-100'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            "
            :title="ghostFilterMode === 'model' ? 'Show all concepts' : 'Filter complete only'"
            data-testid="ghost-filter-toggle"
          >
            <span class="text-[10px] font-medium">
              {{ ghostFilterMode === 'model' ? 'ALL' : 'CMP' }}
            </span>
          </button>
          <button
            @click="expandAll"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-2xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center"
            title="Expand All"
            data-testid="expand-all"
          >
            <ChevronsDown class="w-3.5 h-3.5" />
          </button>
          <button
            @click="collapseAll"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-2xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center"
            title="Collapse All"
            data-testid="collapse-all"
          >
            <ChevronsUp class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Exports section (when Exports view is active) -->
      <div v-if="uiStore.activeView === 'exports'" class="space-y-1">
        <div class="flex items-center gap-1.5 px-2 py-1">
          <FileOutput class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Outputs
          </h2>
        </div>

        <div v-if="exportsLoading" class="flex items-center gap-2 px-2 py-2 text-xs text-slate-400 dark:text-slate-500">
          <Loader class="w-3 h-3 animate-spin" />
          <span>Scanning exports...</span>
        </div>

        <div v-else-if="exportsList.length === 0" class="px-2 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
          No exports in <code class="text-2xs bg-slate-100 dark:bg-slate-800 px-1 rounded">traNNsform/output/</code>
        </div>

        <div v-else class="space-y-0.5">
          <div
            v-for="xf in exportsList"
            :key="xf.name"
            class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
            @click="openExport(xf)"
          >
            <FileOutput class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span class="text-xs truncate flex-1 text-slate-700 dark:text-slate-300">{{ xf.name }}</span>
            <ExternalLink class="w-3 h-3 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      </div>

      <!-- Tree section: complete-only or merged all, grouped by model -->
      <div v-else class="space-y-2">
        <div v-for="rootId in visibleRootIds" :key="rootId" class="space-y-1">
          <!-- Model Header (File) -->
          <div
            class="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
            :class="
              rootId === activeModelId
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-100 font-bold ring-1 ring-primary/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            "
            @click="selectModelHeader(rootId)"
          >
            <ChevronDown
              class="transition-transform duration-200 w-3 h-3 text-slate-400 dark:text-slate-500"
              :class="{ '-rotate-90': !isModelExpanded(rootId) }"
            />
            <FileText class="w-3.5 h-3.5 shrink-0" :class="rootId === activeModelId ? 'text-primary' : 'text-slate-400 dark:text-slate-500'" />
            <span class="truncate flex-1">{{
              getModelName(rootId)
            }}</span>
          </div>

          <!-- Concepts under this Model -->
          <div
            v-if="isModelExpanded(rootId)"
            class="ml-2 pl-1 border-l border-slate-200 dark:border-slate-700 space-y-0.5"
          >
            <div v-for="item in getConceptsForModel(rootId, ghostFilterMode)" :key="item.name">
              <VirtualGroupNode
                :concept-name="item.name"
                :elements="item.elements"
                :sub-groups="item.children"
                :selected-id="selectedId"
                :depth="0"
                :expanded-generation="expandedGeneration"
                :ghost="item.ghost"
                @select="(id: string) => handleSelectNode(rootId, id)"
                @click-ghost="(cname: string) => handleClickGhost(cname, rootId)"
              />
            </div>
            <p
              v-if="getConceptsForModel(rootId, ghostFilterMode).length === 0"
              class="px-2 py-2 text-2xs text-slate-400 dark:text-slate-500 italic"
            >
              No nodes loaded
            </p>
          </div>
        </div>
        <p
          v-if="visibleRootIds.length === 0"
          class="px-2 py-4 text-xs text-slate-400 dark:text-slate-500 italic text-center"
        >
          No models loaded
        </p>
      </div>

      <!-- Relations Section (hidden in exports view) -->
      <div v-if="uiStore.activeView !== 'exports'" class="space-y-1">
        <div class="flex items-center justify-between px-2 py-1">
          <div class="flex items-center gap-1.5">
            <Table2 class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <h2
              class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Relations
            </h2>
          </div>
          <button
            @click.stop="navigateToConfig"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer"
            title="Metamatrix Config"
          >
            <Settings class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="space-y-0.5 pl-1">
          <MatrixPill
            v-for="(matrix, idx) in matrixDefs"
            :key="matrix.name"
            :name="matrix.name"
            :source="matrix.source"
            :target="matrix.target"
            :label="matrix.label"
            :value-count="getMatrixValueCount(matrix.name)"
            :selected="uiStore.activeMatrixIndex === idx && uiStore.activeView === 'matrices'"
            :full-width="true"
            interactive
            show-source-target
            as="button"
            @click="selectMatrix(idx)"
          />
          <p
            v-if="matrixDefs.length === 0"
            class="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic"
          >
            No relations defined.
          </p>
        </div>

        <!-- Selected matrix details -->
        <div
          v-if="selectedMatrix"
          class="mt-3 px-2.5 py-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2"
        >
          <div class="flex items-center gap-1.5 flex-wrap text-xs">
            <span
              class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              >Matrix:</span
            >
            <BlockPill
              kind="concept"
              :concept-type="selectedMatrix.source"
              :name="selectedMatrix.source"
              :icon="getConceptMeta(selectedMatrix.source).icon"
              :color="getConceptMeta(selectedMatrix.source).color"
              hide-empty
            />
            <span class="text-slate-400 dark:text-slate-500">&rarr;</span>
            <BlockPill
              kind="concept"
              :concept-type="selectedMatrix.target"
              :name="selectedMatrix.target"
              :icon="getConceptMeta(selectedMatrix.target).icon"
              :color="getConceptMeta(selectedMatrix.target).color"
              hide-empty
            />
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-semibold border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {{ selectedMatrix.widgetType }}
            </span>
          </div>

          <div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed" data-testid="selected-matrix-description">
            {{ selectedMatrix.description }}
          </div>

          <div
            v-if="Object.keys(selectedMatrixDistribution).length > 0"
            class="flex items-center gap-1.5 flex-wrap text-xs"
          >
            <span
              class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0"
              >Values:</span
            >
            <span
              v-for="(count, value) in selectedMatrixDistribution"
              :key="value"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {{ value === '-' ? '\u2014' : value }}: {{ count }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ModelNode, MetamodelConcept } from '../../model/types'
import { parseModel, parseFrontmatter, normalizeMatrixDecl } from '@cognnitive/innfo-core'
import { parseFormatFilename, type SemVer } from '../../utils/version'
import { resolveEffectiveMetamodel } from '../../model/metamodel'
import {
  ChevronsDown,
  ChevronsUp,
  LayoutDashboard,
  Table2,
  Settings,
  FileText,
  FileOutput,
  ExternalLink,
  Loader,
  Database,
  ChevronDown,
} from 'lucide-vue-next'
import { useModelStore } from '../../stores/modelStore'
import { useMetamodelStore } from '../../stores/metamodelStore'
import { useUiStore } from '../../stores/uiStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import type { FileHandleLike, DirectoryHandleLike } from '../../model/fs-types'
import { useResizablePanel } from '../../composables/useResizablePanel'
import ConceptTreeNode from './ConceptTreeNode.vue'
import VirtualGroupNode, { type TreeGroup } from './VirtualGroupNode.vue'
import MatrixPill from '../editor/MatrixPill.vue'
import BlockPill from '../editor/BlockPill.vue'

const emit = defineEmits<{
  'select-node': [nodeId: string]
  'select-matrix': [idx: number]
  'select-view': [view: string]
}>()

const modelStore = useModelStore()
const metamodelStore = useMetamodelStore()
const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()

const exportsList = ref<Array<{ name: string; handle: FileHandleLike }>>([])
const exportsLoading = ref(false)

async function scanExports(): Promise<void> {
  if (!workspaceStore.handle) return
  exportsLoading.value = true
  exportsList.value = []
  try {
    const transformDir = await workspaceStore.handle.getDirectoryHandle('traNNsform')
    let outputsDir: DirectoryHandleLike
    try {
      outputsDir = await transformDir.getDirectoryHandle('output')
    } catch {
      exportsLoading.value = false
      return
    }
    const results: Array<{ name: string; handle: FileHandleLike }> = []
    for await (const [name, entry] of outputsDir.entries()) {
      if (entry.kind !== 'file') continue
      results.push({ name, handle: entry as unknown as FileHandleLike })
    }
    results.sort((a, b) => a.name.localeCompare(b.name))
    exportsList.value = results
  } catch {
    // no traNNsform directory
  } finally {
    exportsLoading.value = false
  }
}

async function openExport(xf: { name: string; handle: FileHandleLike }): Promise<void> {
  const content = await xf.handle.getFile().then((f) => f.text())
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

watch(
  () => uiStore.activeView,
  (view) => {
    if (view === 'exports') scanExports()
  },
)

function isTemplateNode(node: ModelNode | undefined): boolean {
  if (!node) return true
  if (node.id.startsWith('spec:')) return true
  if (node.rawContent) {
    try {
      const fm = parseFrontmatter(node.rawContent) as any
      if (fm?.kind === 'template' || fm?.kind === 'spec') return true
      if (Array.isArray(fm?.concepts) && fm.concepts.length > 0 && !fm?.parent_spec) return true
    } catch {
      // silent
    }
  }
  const pathOrName = node.source?.path || node.name || ''
  if (/_template_NN\.md$/i.test(pathOrName) || /_spec_NN\.md$/i.test(pathOrName)) return true
  return false
}

function getModelInfo(rootId: string): { baseName: string; version: SemVer } {
  const rootNode = modelStore.getNode(rootId)
  const path = rootNode?.source?.path || ''
  const filename = path.split('/').pop()?.split('\\').pop() || rootNode?.name || ''

  const parsed = parseFormatFilename(filename)
  if (parsed) {
    return { baseName: parsed.baseName, version: parsed.version }
  }

  let version: SemVer = { major: 0, minor: 0, patch: 0 }
  let baseName = filename.replace(/\.md$/i, '').replace(/_NN$/i, '')
  if (rootNode?.rawContent) {
    try {
      const fm = parseFrontmatter(rootNode.rawContent) as any
      if (fm?.title) baseName = fm.title
      if (typeof fm?.model_version === 'string') {
        const vMatch = fm.model_version.match(/(\d+)\.(\d+)\.(\d+)/) || fm.model_version.match(/(\d+)-(\d+)-(\d+)/)
        if (vMatch) {
          version = { major: Number(vMatch[1]), minor: Number(vMatch[2]), patch: Number(vMatch[3]) }
        }
      }
    } catch {
      // fallback
    }
  }

  const vMatch = filename.match(/_V_(\d+)-(\d+)-(\d+)/i)
  if (vMatch) {
    version = { major: Number(vMatch[1]), minor: Number(vMatch[2]), patch: Number(vMatch[3]) }
    const parts = filename.split(/_V_\d+-\d+-\d+/i)
    if (parts[0]) baseName = parts[0]
  }

  return { baseName, version }
}

function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}

const visibleRootIds = computed(() => {
  const nonTemplateRootIds = modelStore.rootIds.filter((id) => {
    const node = modelStore.getNode(id)
    return node && !isTemplateNode(node)
  })

  // Group by baseName -> keep highest version
  const bestByBaseName = new Map<string, { id: string; version: SemVer }>()
  for (const id of nonTemplateRootIds) {
    const info = getModelInfo(id)
    const existing = bestByBaseName.get(info.baseName)
    if (!existing || compareSemVer(info.version, existing.version) > 0) {
      bestByBaseName.set(info.baseName, { id, version: info.version })
    }
  }

  const keptIds = new Set([...bestByBaseName.values()].map((v) => v.id))
  return nonTemplateRootIds.filter((id) => keptIds.has(id))
})

const { width, startResize } = useResizablePanel({
  storageKey: 'format.leftSidebarWidth',
  defaultWidth: 384,
  minWidth: 240,
  maxWidth: 640,
  side: 'right',
})

const ghostFilterMode = computed(() => uiStore.ghostFilterMode)

function toggleGhostFilter(): void {
  uiStore.setGhostFilterMode(ghostFilterMode.value === 'model' ? 'all' : 'model')
}

const mergedConcepts = computed<TreeGroup[]>(() => {
  // Collect children per concept type from all model nodes
  const childrenByType = new Map<string, ModelNode[]>()
  for (const node of Object.values(modelStore.nodes)) {
    if (node.type && node.kind === 'element') {
      const list = childrenByType.get(node.type)
      if (list) list.push(node)
      else childrenByType.set(node.type, [node])
    }
  }

  // Helper: check if a concept has content (elements or text section) in the model
  function hasContent(conceptName: string): boolean {
    if ((childrenByType.get(conceptName)?.length ?? 0) > 0) return true
    const concept = metamodelStore.getConceptByName(conceptName)
    if (concept?.type === 'text') {
      return visibleRootIds.value.some((rid) => {
        const root = modelStore.getNode(rid)
        return (
          root?.rawSections &&
          Object.keys(root.rawSections).some((k) => k.toLowerCase() === conceptName.toLowerCase())
        )
      })
    }
    return false
  }

  // Parse _NN index taxonomy from ALL root models
  let allTaxonomyEdges: Array<{ parent: string; child: string }> = []
  for (const rootId of visibleRootIds.value) {
    const root = modelStore.getNode(rootId)
    if (root?.rawContent) {
      try {
        const parsed = parseModel(root.rawContent)
        allTaxonomyEdges.push(...(parsed.taxonomy ?? []))
      } catch {
        // Silently fall back
      }
    }
  }

  // Build taxonomy tree: parent → children names
  const taxonomyChildren = new Map<string, string[]>()
  const allChildren = new Set<string>()
  for (const e of allTaxonomyEdges) {
    const list = taxonomyChildren.get(e.parent) ?? []
    list.push(e.child)
    taxonomyChildren.set(e.parent, list)
    allChildren.add(e.child)
  }

  // Roots = parents that are never a child in the taxonomy
  const taxonomyRoots = [...taxonomyChildren.keys()].filter((p) => !allChildren.has(p))

  // Build a recursive tree from taxonomy edges
  function buildTree(name: string): TreeGroup {
    const directElements = childrenByType.get(name) ?? []
    const kids = taxonomyChildren.get(name) ?? []
    const subGroups: TreeGroup[] = []
    for (const k of kids) {
      subGroups.push(buildTree(k))
    }
    subGroups.sort((a, b) => {
      const ta = templateOrder.get(a.name) ?? 99999
      const tb = templateOrder.get(b.name) ?? 99999
      if (ta !== tb) return ta - tb
      return a.name.localeCompare(b.name)
    })

    // A node has content if it has direct elements, a text section, or any descendant has content
    const isPresent = hasContent(name) || subGroups.some((s) => !s.ghost)

    return {
      name,
      ghost: !isPresent,
      elements: directElements,
      children: subGroups,
    }
  }

  const templateByName = new Map(metamodelStore.concepts.map((c) => [c.name, c]))
  const templateOrder = new Map(metamodelStore.concepts.map((c, i) => [c.name, i]))
  const seen = new Set<string>()
  const items: TreeGroup[] = []

  // Walk taxonomy roots preserving index order
  for (const root of taxonomyRoots) {
    walkTaxonomy(root)
  }

  // Append template concepts not in the taxonomy
  for (const [cname] of templateByName) {
    if (!seen.has(cname)) {
      seen.add(cname)
      items.push({
        name: cname,
        ghost: !hasContent(cname),
        elements: childrenByType.get(cname) ?? [],
        children: [],
      })
    }
  }

  // Stable sort: templateOrder primary, orderedTaxonomyRoots secondary
  const orderedTaxonomyRoots = new Map(taxonomyRoots.map((r, i) => [r, i]))
  items.sort((a, b) => {
    const ta = templateOrder.get(a.name) ?? 99999
    const tb = templateOrder.get(b.name) ?? 99999
    if (ta !== tb) return ta - tb
    const ia = orderedTaxonomyRoots.get(a.name) ?? 99999
    const ib = orderedTaxonomyRoots.get(b.name) ?? 99999
    return ia - ib
  })

  return items

  function walkTaxonomy(name: string): void {
    if (seen.has(name)) return
    seen.add(name)
    const isTemplateConcept = metamodelStore.getConceptByName(name) !== undefined
    if (isTemplateConcept) {
      items.push(buildTree(name))
    }
    const kids = taxonomyChildren.get(name) ?? []
    for (const k of kids) walkTaxonomy(k)
  }
})

// Complete-only: filtered to non-ghost items
const conceptTreeRoots = computed<TreeGroup[]>(() => {
  return mergedConcepts.value.filter((item) => !item.ghost)
})

const activeModelId = computed(() => uiStore.activeModelId || visibleRootIds.value[0] || null)

function selectModelHeader(rootId: string): void {
  uiStore.setActiveModel(rootId)
  toggleModelExpanded(rootId)
}

function handleSelectNode(rootId: string, nodeId: string): void {
  uiStore.setActiveModel(rootId)
  emit('select-node', nodeId)
}

function handleClickGhost(conceptName: string, targetRootId?: string): void {
  const rootId = targetRootId ?? activeModelId.value ?? visibleRootIds.value[0]
  if (rootId) uiStore.setActiveModel(rootId)
  const concept = metamodelStore.getConceptByName(conceptName)
  const type = concept?.type ?? 'text'
  if (type === 'text') {
    modelStore.addTextSection(conceptName, rootId ?? undefined)
    uiStore.selectNode(rootId ?? visibleRootIds.value[0])
  } else {
    const id = modelStore.addConceptElement(conceptName, `New ${conceptName}`, rootId ?? undefined)
    if (id) uiStore.selectNode(id)
  }
}

// Expand/collapse all via generation counter
const expandedGeneration = ref(-1)

function expandAll(): void {
  expandedGeneration.value = Math.max(0, expandedGeneration.value) + 1
}

function collapseAll(): void {
  expandedGeneration.value = Math.min(-1, expandedGeneration.value) - 1
}

// Selected node for highlighting — driven by uiStore in Phase 6
const selectedId = computed(() => uiStore.selectedNodeId)

// Relations section
const MATRIX_DEFS_KEY = '__matrix_defs'

function extractMatrixDefs(root: any): any[] {
  const defs = root.fields?.[MATRIX_DEFS_KEY]?.value
  if (Array.isArray(defs) && defs.length > 0) return defs
  const raw = root.fields?.matrices?.value
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((m: any) => normalizeMatrixDecl(m))
  }
  return []
}

const matrixDefs = computed(() => {
  const rootIds = visibleRootIds.value
  const result: any[] = []
  const seen = new Set<string>()

  for (const id of rootIds) {
    const root = modelStore.getNode(id)
    if (!root) continue
    const defs = extractMatrixDefs(root)
    for (const d of defs) {
      if (!seen.has(d.name)) {
        seen.add(d.name)
        result.push(d)
      }
    }
  }
  return result
})

function getMatrixValueCount(matrixName: string): number {
  let count = 0
  const prefix = `${matrixName}||`
  for (const node of Object.values(modelStore.nodes)) {
    if (!node.fields) continue
    for (const [key, fv] of Object.entries(node.fields)) {
      if (key.startsWith(prefix)) {
        const val = (fv as any)?.value
        if (val !== undefined && val !== null && val !== '' && val !== '-' && val !== false) {
          count++
        }
      }
    }
  }
  return count
}

/** The matrix currently shown in the matrices view. */
const selectedMatrix = computed(() => {
  const idx = uiStore.activeMatrixIndex
  if (uiStore.activeView !== 'matrices' || idx < 0 || idx >= matrixDefs.value.length) return null
  return matrixDefs.value[idx]
})

/** Value distribution over ALL cells of the selected matrix (not just visible). */
const selectedMatrixDistribution = computed(() => {
  if (!selectedMatrix.value) return {} as Record<string, number>
  const counts: Record<string, number> = {}
  const prefix = selectedMatrix.value.name + '||'
  for (const node of Object.values(modelStore.nodes)) {
    if (!node.fields) continue
    for (const [key, fv] of Object.entries(node.fields)) {
      if (!key.startsWith(prefix)) continue
      const val = (fv as any)?.value
      const strVal = val === undefined || val === null || val === '-' ? '-' : String(val)
      counts[strVal] = (counts[strVal] || 0) + 1
    }
  }
  return counts
})

/** Resolves the concept icon/color from the effective (template) metamodel. */
function getConceptMeta(conceptType: string): { icon?: string; color?: string } {
  const lower = conceptType?.toLowerCase()
  for (const id of modelStore.rootIds) {
    const r = modelStore.getNode(id)
    const concepts = r?.localMetamodel?.concepts
    if (Array.isArray(concepts)) {
      const c = concepts.find((x) => x.name.toLowerCase() === lower)
      if (c) return { icon: c.icon, color: c.color }
    }
  }
  return {}
}

function selectMatrix(idx: number): void {
  emit('select-matrix', idx)
  emit('select-view', 'matrices')
}

function navigateToConfig(): void {
  emit('select-view', 'metamatrix-config')
}

// ── Model-based Concept grouping (Opción A) ──

const expandedModels = ref<Record<string, boolean>>({})

watch(
  visibleRootIds,
  (ids) => {
    for (const id of ids) {
      if (expandedModels.value[id] === undefined) {
        expandedModels.value[id] = true
      }
    }
  },
  { immediate: true },
)

function isModelExpanded(rootId: string): boolean {
  return expandedModels.value[rootId] !== false
}

function toggleModelExpanded(rootId: string): void {
  expandedModels.value[rootId] = !isModelExpanded(rootId)
}

function getModelName(rootId: string): string {
  const rootNode = modelStore.getNode(rootId)
  const path = rootNode?.source?.path || ''
  if (!path) return 'model.md'
  return path.split('/').pop()?.split('\\').pop() || path
}

function getConceptsForModel(rootId: string, ghostMode: 'model' | 'all'): TreeGroup[] {
  const rootNode = modelStore.getNode(rootId)
  if (!rootNode) return []

  const modelPath = rootNode.source?.path
  const childIdOrder = new Map((rootNode.childIds ?? []).map((id, i) => [id, i]))

  // Collect children per concept type ONLY for this model's nodes
  const childrenByType = new Map<string, ModelNode[]>()
  for (const node of Object.values(modelStore.nodes)) {
    if (node.type && node.kind === 'element') {
      const nodeRootId = modelStore.getModelRootForNode(node.id)
      const belongsToModel = nodeRootId
        ? nodeRootId === rootId
        : !modelPath || node.source?.path === modelPath
      if (belongsToModel) {
        const list = childrenByType.get(node.type)
        if (list) list.push(node)
        else childrenByType.set(node.type, [node])
      }
    }
  }

  // Sort elements within each concept type by document order (childIdOrder)
  for (const list of childrenByType.values()) {
    list.sort((a, b) => {
      const ia = childIdOrder.get(a.id) ?? 99999
      const ib = childIdOrder.get(b.id) ?? 99999
      return ia - ib
    })
  }

  // Resolve template concepts specifically for THIS model
  let modelConcepts: MetamodelConcept[] = []
  if (rootNode.rawContent) {
    try {
      const fm = parseFrontmatter(rootNode.rawContent) as any
      const parentName = fm?.parent_spec?.name
      if (parentName) {
        const normalizedParent = parentName.replace(/_NN$/, '')
        const specNode = Object.values(modelStore.nodes).find((n) => {
          if (!n.localMetamodel?.concepts?.length) return false
          const nameCandidate = (n.name || n.id).replace(/_NN$/, '').replace(/^spec:/, '')
          return nameCandidate === normalizedParent
        })
        if (specNode?.localMetamodel?.concepts) {
          modelConcepts = specNode.localMetamodel.concepts
        }
      }
    } catch {
      // fallback
    }
  }

  if (modelConcepts.length === 0) {
    const effective = resolveEffectiveMetamodel(rootId, modelStore.nodes, [rootId])
    modelConcepts = effective.concepts
  }

  if (modelConcepts.length === 0) {
    modelConcepts = Array.from(childrenByType.keys()).map((type) => ({
      name: type,
      type: 'concept',
      icon: 'file-text',
      color: 'slate',
    }))
  }

  // Helper: check if a concept has content in this model
  function hasContent(conceptName: string): boolean {
    if ((childrenByType.get(conceptName)?.length ?? 0) > 0) return true

    // Check if the rootNode itself contains a text section for this concept
    if (
      rootNode &&
      rootNode.rawSections &&
      Object.keys(rootNode.rawSections).some((k) => k.toLowerCase() === conceptName.toLowerCase())
    ) {
      return true
    }
    return false
  }

  // Parse taxonomy edges from this model
  let taxonomyEdges: Array<{ parent: string; child: string }> = []
  if (rootNode && rootNode.rawContent) {
    try {
      const parsed = parseModel(rootNode.rawContent)
      taxonomyEdges.push(...(parsed.taxonomy ?? []))
    } catch {
      // Graceful fallback
    }
  }

  // Build taxonomy tree: parent → children names
  const taxonomyChildren = new Map<string, string[]>()
  const allChildren = new Set<string>()
  for (const e of taxonomyEdges) {
    const list = taxonomyChildren.get(e.parent) ?? []
    list.push(e.child)
    taxonomyChildren.set(e.parent, list)
    allChildren.add(e.child)
  }

  // Roots = parents that are never a child in the taxonomy
  const taxonomyRoots = [...taxonomyChildren.keys()].filter((p) => !allChildren.has(p))

  // Build a recursive tree from taxonomy edges
  function buildTree(name: string): TreeGroup {
    const directElements = childrenByType.get(name) ?? []
    const kids = taxonomyChildren.get(name) ?? []
    const subGroups: TreeGroup[] = []
    for (const k of kids) {
      subGroups.push(buildTree(k))
    }
    subGroups.sort((a, b) => {
      const ta = templateOrder.get(a.name) ?? 99999
      const tb = templateOrder.get(b.name) ?? 99999
      if (ta !== tb) return ta - tb
      return a.name.localeCompare(b.name)
    })

    const isPresent = hasContent(name) || subGroups.some((s) => !s.ghost)

    return {
      name,
      ghost: !isPresent,
      elements: directElements,
      children: subGroups,
    }
  }

  const templateByName = new Map(modelConcepts.map((c) => [c.name, c]))
  const templateOrder = new Map(modelConcepts.map((c, i) => [c.name, i]))
  const seen = new Set<string>()
  const items: TreeGroup[] = []

  // Walk taxonomy roots preserving index order
  for (const root of taxonomyRoots) {
    const isTemplateConcept = templateByName.has(root)
    if (isTemplateConcept) {
      items.push(buildTree(root))
    }
    markSeenRecursively(root)
  }

  // Append template concepts not in the taxonomy
  for (const [cname] of templateByName) {
    if (!seen.has(cname)) {
      seen.add(cname)
      items.push({
        name: cname,
        ghost: !hasContent(cname),
        elements: childrenByType.get(cname) ?? [],
        children: [],
      })
    }
  }

  // Stable sort: templateOrder primary, orderedTaxonomyRoots secondary
  const orderedTaxonomyRoots = new Map(taxonomyRoots.map((r, i) => [r, i]))
  items.sort((a, b) => {
    const ta = templateOrder.get(a.name) ?? 99999
    const tb = templateOrder.get(b.name) ?? 99999
    if (ta !== tb) return ta - tb
    const ia = orderedTaxonomyRoots.get(a.name) ?? 99999
    const ib = orderedTaxonomyRoots.get(b.name) ?? 99999
    return ia - ib
  })

  // Filter out completely empty ghost concepts if ghostMode is 'model' (Complete Only)
  if (ghostMode === 'model') {
    return items.filter((item) => !item.ghost)
  }

  return items

  function markSeenRecursively(name: string): void {
    if (seen.has(name)) return
    seen.add(name)
    const kids = taxonomyChildren.get(name) ?? []
    for (const k of kids) markSeenRecursively(k)
  }
}
</script>
