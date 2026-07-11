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
      <!-- Navigation views -->
      <div class="space-y-0.5">
        <!-- Editor View button -->
        <button
          class="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all text-left cursor-pointer border border-transparent capitalize"
          :class="
            uiStore.activeView === 'editor'
              ? 'bg-slate-200/60 dark:bg-slate-800/80 text-primary font-semibold shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('editor')"
          data-testid="view-switcher-editor"
        >
          <FileText class="w-4 h-4" />
          <span>editor</span>
        </button>

        <!-- Graph View button -->
        <button
          class="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all text-left cursor-pointer border border-transparent capitalize"
          :class="
            uiStore.activeView === 'graph'
              ? 'bg-slate-200/60 dark:bg-slate-800/80 text-primary font-semibold shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('graph')"
          data-testid="view-switcher-graph"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>graph</span>
        </button>

        <!-- Matrices View button -->
        <button
          class="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all text-left cursor-pointer border border-transparent capitalize"
          :class="
            uiStore.activeView === 'matrices'
              ? 'bg-slate-200/60 dark:bg-slate-800/80 text-primary font-semibold shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
          "
          @click="uiStore.setActiveView('matrices')"
          data-testid="view-switcher-matrices"
        >
          <Table2 class="w-4 h-4" />
          <span>matrices</span>
        </button>
      </div>


      <!-- Header with expand/collapse all + ghost filter -->
      <div class="flex items-center justify-between px-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Model
        </h2>
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

      <!-- Tree section: complete-only or merged all -->
      <div class="space-y-0.5">
        <template v-if="ghostFilterMode === 'model'">
          <!-- Complete only: non-ghost concepts, nested by _NN index -->
          <div v-for="item in conceptTreeRoots" :key="item.name">
            <VirtualGroupNode
              :concept-name="item.name"
              :elements="item.elements"
              :sub-groups="item.children"
              :selected-id="selectedId"
              :depth="0"
              :expanded-generation="expandedGeneration"
              :ghost="false"
              @select="(id: string) => $emit('select-node', id)"
              @click-ghost="handleClickGhost"
            />
          </div>
          <p
            v-if="conceptTreeRoots.length === 0"
            class="px-2 py-4 text-xs text-slate-400 dark:text-slate-500 italic text-center"
          >
            No nodes loaded
          </p>
        </template>
        <template v-else>
          <!-- Merged: all concepts including ghosts, nested by _NN index -->
          <div v-for="item in mergedConcepts" :key="item.name">
            <VirtualGroupNode
              :concept-name="item.name"
              :elements="item.elements"
              :sub-groups="item.children"
              :selected-id="selectedId"
              :depth="0"
              :expanded-generation="expandedGeneration"
              :ghost="item.ghost"
              @select="(id: string) => $emit('select-node', id)"
              @click-ghost="handleClickGhost"
            />
          </div>
        </template>
      </div>

      <!-- Relations Section -->
      <div class="space-y-1">
        <div
          @click="relationsOpen = !relationsOpen"
          class="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div class="flex items-center gap-2">
            <ChevronRight
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-90': relationsOpen }"
            />
            <Table2 class="w-3.5 h-3.5" />
            <h2
              class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Relations
            </h2>
          </div>
          <button
            @click.stop="navigateToConfig"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary transition-colors"
            title="Metamatrix Config"
          >
            <Settings class="w-3.5 h-3.5" />
          </button>
        </div>

        <div v-if="relationsOpen" class="space-y-0.5 pl-1">
          <MatrixPill
            v-for="(matrix, idx) in matrixDefs"
            :key="matrix.name"
            :name="matrix.name"
            :source="matrix.source"
            :target="matrix.target"
            :label="matrix.label"
            :selected="uiStore.activeMatrixIndex === idx"
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
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ModelNode } from '../../model/types'
import { parseModel } from '@innv0/innfo-core'
import {
  ChevronsDown,
  ChevronsUp,
  LayoutDashboard,
  ChevronRight,
  Table2,
  Settings,
  FileText,
} from 'lucide-vue-next'
import { useModelStore } from '../../stores/modelStore'
import { useMetamodelStore } from '../../stores/metamodelStore'
import { useUiStore } from '../../stores/uiStore'
import { useResizablePanel } from '../../composables/useResizablePanel'
import ConceptTreeNode from './ConceptTreeNode.vue'
import VirtualGroupNode, { type TreeGroup } from './VirtualGroupNode.vue'
import MatrixPill from '../editor/MatrixPill.vue'

const emit = defineEmits<{
  'select-node': [nodeId: string]
  'select-matrix': [idx: number]
  'select-view': [view: string]
}>()

const modelStore = useModelStore()
const metamodelStore = useMetamodelStore()
const uiStore = useUiStore()

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
      return modelStore.rootIds.some((rid) => {
        const root = modelStore.getNode(rid)
        return (
          root?.rawSections &&
          Object.keys(root.rawSections).some(
            (k) => k.toLowerCase() === conceptName.toLowerCase(),
          )
        )
      })
    }
    return false
  }

  // Parse _NN index taxonomy from ALL root models
  let allTaxonomyEdges: Array<{ parent: string; child: string }> = []
  for (const rootId of modelStore.rootIds) {
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
  const taxonomyRoots =
    [...taxonomyChildren.keys()].filter((p) => !allChildren.has(p))

  // Build a recursive tree from taxonomy edges
  function buildTree(name: string): TreeGroup {
    const directElements = childrenByType.get(name) ?? []
    const kids = taxonomyChildren.get(name) ?? []
    const subGroups: TreeGroup[] = []
    for (const k of kids) {
      subGroups.push(buildTree(k))
    }

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

  // Stable sort
  const orderedTaxonomyRoots = new Map(taxonomyRoots.map((r, i) => [r, i]))
  items.sort((a, b) => {
    const ia = orderedTaxonomyRoots.get(a.name) ?? 99999
    const ib = orderedTaxonomyRoots.get(b.name) ?? 99999
    if (ia !== ib) return ia - ib
    return (templateOrder.get(a.name) ?? 999) - (templateOrder.get(b.name) ?? 999)
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

function handleClickGhost(conceptName: string): void {
  const concept = metamodelStore.getConceptByName(conceptName)
  const type = concept?.type ?? 'text'
  if (type === 'text') {
    modelStore.addTextSection(conceptName)
    uiStore.selectNode(modelStore.rootIds[0])
  } else {
    const id = modelStore.addConceptElement(conceptName, `New ${conceptName}`)
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
const relationsOpen = ref(true)

function extractMatrixDefs(root: any): any[] {
  const defs = root.fields?.[MATRIX_DEFS_KEY]?.value
  if (Array.isArray(defs) && defs.length > 0) return defs
  const raw = root.fields?.matrices?.value
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((m: any) => ({
      name: m.name,
      source: m.source,
      target: m.target,
      widgetType: m.widgetType || 'text',
      params: m.params || '',
    }))
  }
  return []
}

const matrixDefs = computed(() => {
  const rootIds = modelStore.rootIds
  for (const id of rootIds) {
    const root = modelStore.getNode(id)
    if (!root) continue
    const defs = extractMatrixDefs(root)
    if (defs.length > 0) return defs
  }
  return []
})

function selectMatrix(idx: number): void {
  emit('select-matrix', idx)
  emit('select-view', 'matrices')
}

function navigateToConfig(): void {
  emit('select-view', 'metamatrix-config')
}
</script>
