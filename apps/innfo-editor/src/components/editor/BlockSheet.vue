<template>
  <div
    data-testid="block-sheet"
    class="rounded-lg bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 flex flex-col relative border border-slate-200 dark:border-slate-700"
  >
    <!-- Header: concept label + markers + controls -->
    <div
      class="flex items-center rounded-lg px-3 py-2.5 transition-all duration-150 gap-2 select-none text-slate-700 dark:text-slate-300"
    >
      <!-- Title: icon + name(s) -->
      <div class="flex items-center gap-1.5 min-w-0 flex-1">
        <template v-if="kind === 'concept'">
          <IconRenderer
            :icon="conceptIcon || 'layers'"
            custom-class="w-5 h-5 shrink-0"
            :class="[palette.text]"
          />
          <input
            v-if="isEditing"
            :value="conceptName"
            @input="onConceptNameInput"
            class="font-bold text-2xl border border-slate-200 dark:border-slate-600 rounded-md px-1 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-w-0 flex-1"
            placeholder="Concept name"
          />
          <span v-else class="font-bold text-2xl truncate" :class="[palette.text]">{{
            cleanConceptName
          }}</span>
          <span class="font-normal text-sm text-slate-500 dark:text-slate-400 shrink-0"
            >({{ conceptType }})</span
          >
        </template>
        <template v-else>
          <IconRenderer
            :icon="conceptIcon || 'layers'"
            custom-class="w-4 h-4 shrink-0"
            :class="[palette.text]"
          />
          <span class="font-bold text-sm" :class="[palette.text]">{{ cleanConceptName }}</span>
          <span class="text-slate-300 dark:text-slate-600 mx-0.5">:</span>
          <button
            v-if="!isEditing"
            @click.stop="navigateToInstance"
            class="font-semibold text-2xl text-slate-800 dark:text-slate-200 hover:text-primary hover:underline transition-colors cursor-pointer text-left truncate min-w-0"
            :title="block.name || '(Empty)'"
          >
            {{ block.name || '(Empty)' }}
          </button>
          <input
            v-else
            :value="block.name"
            @input="onNameInput"
            class="flex-1 border border-slate-200 dark:border-slate-600 rounded-md p-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-w-0"
            placeholder="Enter block name"
          />
        </template>
      </div>

      <!-- Marker cycling toolbar -->
      <template v-if="hasMarkers && block.id">
        <component
          v-for="marker in allMarkers"
          :key="marker.name"
          :is="getMarkerIcon(marker.name)"
          @click.stop="cycleMarker(marker.name)"
          class="cursor-pointer"
          :class="markerClassesFor(marker.name)"
        />
        <span class="w-px h-3.5 bg-current/20 mx-0.5"></span>
      </template>

      <!-- Add child -->
      <button
        v-if="showAddChild"
        @click.stop="$emit('add-child')"
        aria-label="Add child"
        class="p-0.5 hover:bg-current/10 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
      >
        <PlusCircle class="w-3.5 h-3.5" />
      </button>

      <!-- Reorder controls -->
      <template v-if="showReorder">
        <button
          @click.stop="$emit('move-up')"
          :disabled="isFirst"
          aria-label="Move up"
          class="p-0.5 hover:bg-current/10 disabled:opacity-20 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowUp class="w-3 h-3" />
        </button>
        <button
          @click.stop="$emit('move-down')"
          :disabled="isLast"
          aria-label="Move down"
          class="p-0.5 hover:bg-current/10 disabled:opacity-20 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowDown class="w-3 h-3" />
        </button>
      </template>

      <!-- Edit mode: big action buttons -->
      <template v-if="isEditing">
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Save -->
          <button
            @click.stop="$emit('edit-toggle')"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            Save
          </button>

          <!-- Close -->
          <button
            @click.stop="$emit('edit-toggle')"
            class="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X class="w-4 h-4" />
            Close
          </button>

          <!-- Delete -->
          <button
            v-if="showDelete"
            @click.stop="$emit('delete')"
            class="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 class="w-4 h-4" />
            Delete
          </button>
        </div>
      </template>

      <!-- Read mode: compact icon-only controls -->
      <template v-else>
        <!-- Pencil edit button -->
        <button
          @click.stop="$emit('edit-toggle')"
          aria-label="Edit"
          class="p-0.5 hover:bg-current/10 rounded transition-all cursor-pointer flex items-center justify-center shrink-0 text-current/60"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>

        <!-- Delete -->
        <button
          v-if="showDelete"
          @click.stop="$emit('delete')"
          aria-label="Delete"
          class="p-0.5 text-current/50 hover:text-rose-600 hover:scale-105 active:scale-95 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </template>

      <!-- Chevron expand/collapse (far right) -->
      <button
        v-if="!disableExpand"
        @click.stop="$emit('update:collapsed', !collapsed)"
        aria-label="Toggle expand"
        class="p-0.5 hover:bg-current/10 rounded transition-colors cursor-pointer flex items-center justify-center shrink-0"
      >
        <ChevronDown
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ '-rotate-90': collapsed }"
        />
      </button>
    </div>

    <!-- Tree path breadcrumb -->
    <div
      v-if="treePath.length > 0 && !collapsed && !isEditing"
      class="flex items-center flex-wrap gap-x-1 gap-y-0.5 px-3 pb-1 text-2xs text-slate-400 dark:text-slate-500 select-none"
    >
      <template v-for="(seg, i) in treePath" :key="i">
        <span v-if="i > 0" class="text-slate-300 dark:text-slate-600 mx-0.5">&rsaquo;</span>
        <span>{{ seg }}</span>
      </template>
    </div>

    <!-- Tab bar (read mode only, when expanded) -->
    <div
      v-if="!collapsed && !isEditing"
      class="flex items-center gap-1 px-3 border-b border-slate-200 dark:border-slate-700 select-none"
    >
      <button
        v-for="tab in tabDefs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer -mb-px"
        :class="
          activeTab === tab.id
            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Expandable body / edit form -->
    <div
      v-show="(!collapsed && !disableExpand) || isEditing"
      class="overflow-hidden transition-all duration-300"
    >
      <div class="px-3 pb-4 pt-2 space-y-6 flex flex-col">
        <!-- Edit-mode field inputs -->
        <template v-if="isEditing">
          <div
            v-if="conceptFields && conceptFields.length"
            class="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div v-for="field in conceptFields" :key="field.name" class="flex flex-col gap-1">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >{{ field.name.replace(/_/g, ' ') }}</label
              >
              <WidgetField
                :node-id="blockIdForFields"
                :field-key="field.name"
                :widget-type="field.type || 'string'"
                :field-definition="field"
              />
            </div>
          </div>

          <!-- Description textarea -->
          <div class="flex flex-col min-h-[100px]">
            <label
              class="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >Description / Details</label
            >
            <textarea
              :value="block.description"
              @input="onInput"
              rows="4"
              class="w-full mt-1 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none flex-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              placeholder="Enter description (supports basic markdown)..."
            ></textarea>
          </div>
        </template>

        <!-- Read-mode tabbed content -->
        <template v-else>
          <!-- ═══ Table Tab (default for concepts) ═══ -->
          <div v-if="activeTab === 'table'" class="space-y-6">
            <ConceptTableView
              v-if="block.id"
              :node-id="block.id"
              :concept-type="conceptType"
              :concept-fields="conceptFields"
            />

            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Description
              </div>
              <div
                v-if="renderedDescription"
                class="prose prose-slate max-w-none text-lg text-slate-600 dark:text-slate-300 leading-relaxed break-words bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                v-html="renderedDescription"
              ></div>
              <div v-else class="text-sm text-slate-400 dark:text-slate-500 italic">No description</div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Fields
              </div>
              <div
                v-if="conceptFields && conceptFields.length > 0"
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <FieldViewer :node-id="blockIdForFields" :field-definitions="conceptFields" readonly />
              </div>
              <div v-else class="text-sm text-slate-400 dark:text-slate-500 italic">No fields defined</div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Relationships
              </div>
              <div
                v-if="hasRelationships"
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <BlockRelationships :relationships="relationshipsList" :on-navigate="navigateToNode" />
              </div>
              <div v-else class="text-sm text-slate-400 dark:text-slate-500 italic">No relationships</div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Matrix
              </div>
              <div
                v-if="hasMatrices && block.id"
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <BlockMatrixSummary :root-node-id="rootNodeId" :node-concept="conceptType" :node-id="block.id" />
              </div>
              <div v-else class="text-sm text-slate-400 dark:text-slate-500 italic">No matrix participation</div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Media &amp; Attachments
              </div>
              <NodeMedia :assets="resolvedAssetItems" />
            </div>
          </div>

          <!-- ═══ View Tab ═══ -->
          <div v-else-if="activeTab === 'view'" class="space-y-6">
            <div
              v-if="renderedDescription"
              class="border-t border-slate-200 dark:border-slate-700 pt-5"
            >
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Content
              </div>
              <div
                class="prose prose-slate max-w-none text-lg text-slate-600 dark:text-slate-300 leading-relaxed break-words bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                v-html="renderedDescription"
              ></div>
            </div>

            <div
              v-if="conceptFields && conceptFields.length > 0"
              class="border-t border-slate-200 dark:border-slate-700 pt-5"
            >
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                  Fields
                </div>
                <button
                  @click.stop="$emit('edit-toggle')"
                  class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Pencil class="w-3 h-3" />
                  Edit
                </button>
              </div>
              <div
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <FieldViewer
                  :node-id="blockIdForFields"
                  :field-definitions="conceptFields"
                  :readonly="!isEditing"
                />
              </div>
            </div>

            <div
              v-if="hasRelationships"
              class="border-t border-slate-200 dark:border-slate-700 pt-5"
            >
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Relationships
              </div>
              <div
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <BlockRelationships
                  :relationships="relationshipsList"
                  :on-navigate="navigateToNode"
                />
              </div>
            </div>

            <div
              v-if="hasMatrices && block.id"
              class="border-t border-slate-200 dark:border-slate-700 pt-5"
            >
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Matrix
              </div>
              <div
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4"
              >
                <BlockMatrixSummary
                  :root-node-id="rootNodeId"
                  :node-concept="conceptType"
                  :node-id="block.id"
                />
              </div>
            </div>

            <div v-if="block.id" class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Media &amp; Attachments
              </div>
              <NodeMedia :assets="resolvedAssetItems" />
            </div>
          </div>

          <!-- ═══ Code Tab ═══ -->
          <div v-else-if="activeTab === 'code'" class="space-y-6">
            <div class="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div
                class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2"
              >
                <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
                Raw Markdown
              </div>
              <pre
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-x-auto text-xs leading-relaxed font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
              ><code>{{ rawMarkdown || 'No source available' }}</code></pre>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronDown, ArrowUp, ArrowDown, Pencil, Check, Trash2, PlusCircle, X } from 'lucide-vue-next'
import IconRenderer from './IconRenderer.vue'
import WidgetField from '../../shared/widgets/WidgetField.vue'
import { getMarkerIcon, getMarkerClasses } from './MarkerIcons'
import { renderMarkdown } from '../../utils/markdown'
import { useModelStore } from '../../stores/modelStore'
import { useNodeMediaScan } from '../../composables/useNodeMediaScan'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { commitMarkerValue } from '../../shared/provenance'
import { MARKER_CYCLE_COUNT } from '../../utils/constants'
import { getColorClasses } from '../../utils/colors'
import type { BlockKind } from '../../utils/conceptVisuals'

// Tab dependencies
import FieldViewer from './FieldViewer.vue'
import BlockRelationships from './BlockRelationships.vue'
import BlockMatrixSummary from './BlockMatrixSummary.vue'
import NodeMedia from './NodeMedia.vue'
import ConceptTableView from './ConceptTableView.vue'
import { parseFrontmatter } from '@innv0/innfo-core'

const props = withDefaults(
  defineProps<{
    block: { id?: string; name: string; description: string; fields?: Record<string, any> }
    kind: BlockKind
    conceptType: string
    conceptName: string
    conceptFields?: any[]
    conceptColor?: string
    conceptIcon?: string
    collapsed: boolean
    isEditing: boolean
    disableExpand?: boolean
    hasMarkers?: boolean
    showDelete?: boolean
    showReorder?: boolean
    showAddChild?: boolean
    isFirst?: boolean
    isLast?: boolean
  }>(),
  {
    conceptFields: () => [],
    conceptColor: '',
    conceptIcon: '',
    disableExpand: false,
    hasMarkers: false,
    showDelete: false,
    showReorder: false,
    showAddChild: false,
    isFirst: false,
    isLast: false,
  },
)

const emit = defineEmits<{
  'update:collapsed': [val: boolean]
  'edit-toggle': []
  'move-up': []
  'move-down': []
  delete: []
  'add-child': []
  change: []
  'update:field': [fieldName: string, value: unknown]
  'update:concept-name': [name: string]
  'navigate-to-node': [nodeId: string]
}>()

const modelStore = useModelStore()

// ── Tab state ───────────────────────────────────────────────────

const isConcept = computed(() => props.kind === 'concept')

const tabDefs = computed(() => {
  const tabs: { id: string; label: string }[] = []
  if (isConcept.value) {
    tabs.push({ id: 'table', label: 'Table' })
  }
  tabs.push({ id: 'view', label: 'View' })
  tabs.push({ id: 'code', label: 'Code' })
  return tabs
})

const activeTab = ref(isConcept.value ? 'table' : 'view')

// ── Palette ─────────────────────────────────────────────────────

const palette = computed(() => getColorClasses(props.conceptColor))

// ── Tree path breadcrumb ─────────────────────────────────────────

const treePath = computed(() => {
  if (!props.block.id) return []
  const segments: string[] = []
  let current = modelStore.getNode(props.block.id)
  while (current) {
    segments.unshift(current.name)
    if (!current.parentId) break
    current = modelStore.getNode(current.parentId)
  }
  return segments
})

const treeSiblings = computed(() => {
  if (!props.block.id) return []
  const node = modelStore.getNode(props.block.id)
  if (!node?.parentId) return []
  const parent = modelStore.getNode(node.parentId)
  if (!parent) return []
  return parent.childIds
    .map((id) => modelStore.getNode(id)?.name)
    .filter((n): n is string => !!n && n !== node.name)
})

// ── Markers ─────────────────────────────────────────────────────

const allMarkers = computed(() => {
  return [
    { name: 'completion', icon: 'check-circle', color: 'emerald' },
    { name: 'certainty', icon: 'help-circle', color: 'blue' },
    { name: 'priority', icon: 'flag', color: 'rose' },
    { name: 'rating', icon: 'star', color: 'amber' },
    { name: 'weight', icon: 'scale', color: 'indigo' },
  ]
})

const getMarkerScore = (markerName: string): number => {
  if (!props.block.id) return 0
  const node = modelStore.getNode(props.block.id)
  if (!node?.markers) return 0
  return (node.markers[markerName] as number) ?? 0
}

const cycleMarker = (markerName: string) => {
  const id = props.block.id
  if (!id) return
  const current = getMarkerScore(markerName)
  commitMarkerValue(modelStore, id, markerName, (current + 1) % MARKER_CYCLE_COUNT)
  emit('change')
}

const markerClassesFor = (markerName: string) =>
  getMarkerClasses(markerName, getMarkerScore(markerName))

// ── Name helpers ────────────────────────────────────────────────

const cleanConceptName = computed(() => {
  const name = props.conceptName
  return name.endsWith('s') ? name.slice(0, -1) : name
})

// ── Markdown rendering ──────────────────────────────────────────

/** Strip everything from the first _NN marker onwards. */
function stripBlockDefinitions(text: string): string {
  const blockPattern = /^[ \t]*(?:[-*+]|\d+\.)?[ \t]*_NN\s+[\w\s-]+?:/m
  const idx = text.search(blockPattern)
  if (idx === -1) return text
  return text.substring(0, idx).trim()
}

const renderedDescription = computed(() => {
  const text =
    props.kind === 'concept'
      ? stripBlockDefinitions(props.block.description)
      : props.block.description
  return renderMarkdown(text)
})

// ── Raw markdown source for Code tab ──────────────────────────

const rawMarkdown = computed(() => {
  if (!props.block.id) return ''
  const node = modelStore.getNode(props.block.id)
  return node?.rawContent || node?.rawSections?.description || ''
})

// ── Node from store (full model data) ───────────────────────────

const nodeFromStore = computed(() =>
  props.block.id ? modelStore.getNode(props.block.id) : undefined,
)

// ── Relationships ───────────────────────────────────────────────

const hasRelationships = computed(() => {
  if (!props.block.id) return false
  const node = modelStore.getNode(props.block.id)
  return node && node.relationships && node.relationships.length > 0
})

const relationshipsList = computed(() => {
  if (!props.block.id) return []
  const node = modelStore.getNode(props.block.id)
  return node?.relationships ?? []
})

// ── Matrix summaries ────────────────────────────────────────────

const rootNodeId = computed(() => {
  if (!props.block.id) return modelStore.rootIds[0] ?? ''
  let curr = modelStore.getNode(props.block.id)
  while (curr && curr.parentId) {
    curr = modelStore.getNode(curr.parentId)
  }
  return curr ? curr.id : (modelStore.rootIds[0] ?? '')
})

const hasMatrices = computed(() => {
  if (!rootNodeId.value) return false
  const root = modelStore.getNode(rootNodeId.value)
  if (!root?.rawContent) return false
  const fm = parseFrontmatter(root.rawContent)
  const matrices: unknown[] = (fm as any)?.matrices ?? []
  return matrices.length > 0
})

// ── Assets / Media ──────────────────────────────────────────────

const { scannedAssets, scan: scanMedia } = useNodeMediaScan()

// Trigger scan when the block is expanded and has an id
watch(
  () => props.block.id,
  (id) => {
    if (id && !props.collapsed && useWorkspaceStore().handle) {
      scanMedia(id)
    }
  },
  { immediate: false },
)

// Also scan when uncollapsed
watch(
  () => props.collapsed,
  (collapsed) => {
    if (!collapsed && props.block.id && useWorkspaceStore().handle) {
      scanMedia(props.block.id)
    }
  },
  { immediate: false },
)

// Blob URL cache for FS-resolved asset paths
const blobUrlCache = new Map<string, string>()

async function resolveAssetUrl(relativePath: string): Promise<string> {
  if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) {
    return relativePath
  }

  const cached = blobUrlCache.get(relativePath)
  if (cached) return cached

  const ws = useWorkspaceStore()
  const handle = ws.handle
  if (!handle) return relativePath

  try {
    const parts = relativePath.split('/').filter(Boolean)
    let current: any = handle
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i])
    }
    const fh = await current.getFileHandle(parts[parts.length - 1])
    const file = await fh.getFile()
    const url = URL.createObjectURL(file)
    blobUrlCache.set(relativePath, url)
    return url
  } catch {
    return relativePath
  }
}

// Merge declared assets (from parser) with scanned assets (from filesystem)
const assetItems = computed<Array<{ filename: string; url: string }>>(() => {
  const node = nodeFromStore.value
  const declared: Array<{ filename: string; url: string }> = node?.assets
    ? node.assets.map((path: string) => ({
        filename: path.split('/').pop() || path,
        url: path,
      }))
    : []

  const scanned: Array<{ filename: string; url: string }> = scannedAssets.value.map((a) => ({
    filename: a.filename,
    url: a.relativePath,
  }))

  // Merge: declared assets take precedence, scanned fill gaps
  const seen = new Set(declared.map((a) => a.filename))
  const merged = [...declared]
  for (const item of scanned) {
    if (!seen.has(item.filename)) {
      merged.push(item)
      seen.add(item.filename)
    }
  }

  return merged
})

// Resolve scanned asset paths to blob URLs for display
const resolvedAssetItems = ref<Array<{ filename: string; url: string }>>([])

watch(
  [assetItems, scannedAssets],
  async () => {
    const resolved = await Promise.all(
      assetItems.value.map(async (item) => ({
        filename: item.filename,
        url: await resolveAssetUrl(item.url),
      })),
    )
    resolvedAssetItems.value = resolved
  },
  { immediate: true, deep: true },
)

// ── Field viewer node ID ────────────────────────────────────────

const blockIdForFields = computed(() => props.block.id || '')

// ── Navigation ──────────────────────────────────────────────────

const navigateToNode = (targetId: string) => {
  emit('navigate-to-node', targetId)
}

const navigateToInstance = () => {
  if (!props.block.name || !props.conceptName) return
  emit('navigate-to-node', props.block.name)
  emit('update:collapsed', false)
}

const onConceptNameInput = (event: Event) => {
  const newName = (event.target as HTMLInputElement).value
  emit('update:concept-name', newName)
}

// ── Input handlers ──────────────────────────────────────────────

const onInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  const val = textarea.value
  props.block.description = val
  if (props.block.id) {
    const node = modelStore.getNode(props.block.id)
    if (node) {
      modelStore.upsertNode({
        ...node,
        rawSections: { ...node.rawSections, description: val },
      })
    }
  }
  modelStore.markDirty(props.block.id || '')
  emit('change')
}

const onNameInput = (event: Event) => {
  const newName = (event.target as HTMLInputElement).value
  props.block.name = newName
  if (props.block.id) {
    const existing = modelStore.getNode(props.block.id)
    if (existing) {
      modelStore.upsertNode({ ...existing, name: newName })
    }
  }
  modelStore.markDirty(props.block.id || '')
  emit('change')
}
</script>
