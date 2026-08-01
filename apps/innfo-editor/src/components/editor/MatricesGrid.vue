<template>
  <div data-testid="matrices-grid" class="flex-1 flex flex-col min-h-0">
    <!-- Matrix Dropdown Selector Header -->
    <div
      class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 shrink-0 mb-4 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Matrix:</span>
        <div v-if="matrixDefs.length" ref="dropdownRef" class="relative">
          <button
            @click="isOpen = !isOpen"
            class="min-w-[200px] flex items-center justify-between gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
            data-testid="matrix-selector"
          >
            <span class="truncate">{{ activeMatrix ? activeMatrix.name : 'Select Matrix' }}</span>
            <ChevronDown
              class="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isOpen"
            class="absolute left-0 z-20 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto"
          >
            <MatrixPill
              v-for="(matrix, idx) in matrixDefs"
              :key="matrix.name"
              :name="matrix.name"
              :source="matrix.source"
              :target="matrix.target"
              :label="matrix.label"
              :description="matrix.description"
              :value-count="getMatrixValueCount(matrix.name)"
              :selected="activeMatrixIndex === idx"
              :full-width="true"
              interactive
              show-source-target
              as="button"
              @click="selectMatrix(idx)"
            />
          </div>
        </div>
        <div v-else class="text-slate-400 dark:text-slate-500 text-xs italic">
          No relational matrices defined. Define them in Metamatrix Config.
        </div>
      </div>

      <div v-if="activeMatrix" class="text-slate-400 dark:text-slate-500 text-xs font-medium">
        Total: {{ matrixDefs.length }} matrices
      </div>
    </div>

    <!-- When no matrix is selected, show a prompt -->
    <div v-if="activeMatrixIndex < 0" class="flex-1 flex items-center justify-center">
      <div class="text-slate-400 dark:text-slate-500 text-xs italic text-center">
        Select a matrix from the sidebar or dropdown to begin.
      </div>
    </div>

    <!-- Active Matrix View -->
    <div v-else-if="activeMatrix" class="flex-1 flex flex-col min-h-0">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            >Matrix:</span
          >
          <BlockPill
            kind="concept"
            :concept-type="activeMatrix.source"
            :name="activeMatrix.source"
            :icon="getConceptMeta(activeMatrix.source).icon"
            :color="getConceptMeta(activeMatrix.source).color"
            hide-empty
          />
          <span class="text-slate-400 dark:text-slate-500">&rarr;</span>
          <BlockPill
            kind="concept"
            :concept-type="activeMatrix.target"
            :name="activeMatrix.target"
            :icon="getConceptMeta(activeMatrix.target).icon"
            :color="getConceptMeta(activeMatrix.target).color"
            hide-empty
          />
          <Badge class="text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">{{
            activeMatrix.widgetType
          }}</Badge>
        </div>
      </div>

      <!-- Matrix description -->
      <div
        v-if="activeMatrix.description"
        class="mb-3 px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400"
      >
        {{ activeMatrix.description }}
      </div>

      <!-- Value Distribution Card -->
      <div
        v-if="Object.keys(valueDistribution).length > 0"
        class="mb-3 flex items-center gap-1.5 flex-wrap text-xs"
      >
        <span
          class="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0"
          >Values:</span
        >
        <span
          v-for="(count, value) in valueDistribution"
          :key="value"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border"
          :class="getDistClasses(value)"
        >
          {{ value === '-' ? '\u2014' : value }}: {{ count }}
        </span>
      </div>

      <!-- Virtual Scrolling Grid -->
      <div
        class="border border-slate-200 dark:border-slate-700 rounded-lg flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <!-- ── Header Row (sticky column labels) ── -->
        <div
          class="flex shrink-0 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60"
        >
          <!-- Corner cell -->
          <div
            class="shrink-0 flex items-center gap-1 px-4 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs overflow-visible"
            :style="{ width: FIRST_COL_WIDTH + 'px', minWidth: FIRST_COL_WIDTH + 'px', height: HEADER_HEIGHT + 'px' }"
          >
            <BlockPill
              kind="concept"
              :concept-type="activeMatrix.source"
              :name="activeMatrix.source"
              :icon="getConceptMeta(activeMatrix.source).icon"
              :color="getConceptMeta(activeMatrix.source).color"
              hide-empty
            />
            <span class="text-slate-400 dark:text-slate-500 font-normal">\</span>
            <BlockPill
              kind="concept"
              :concept-type="activeMatrix.target"
              :name="activeMatrix.target"
              :icon="getConceptMeta(activeMatrix.target).icon"
              :color="getConceptMeta(activeMatrix.target).color"
              hide-empty
            />
          </div>
          <!-- Column header virtual scroll overlay -->
          <div class="overflow-visible flex-1 relative" style="scrollbar-width: none">
            <div
              v-if="columns.length"
              :style="{
                height: HEADER_HEIGHT + 'px',
                position: 'relative',
                width: colTotalSize + 'px',
              }"
            >
              <div
                v-for="vCol in colVirtualizer.getVirtualItems()"
                :key="'hc-' + String(vCol.key)"
                class="absolute top-0 overflow-visible border-r border-slate-100 dark:border-slate-800 text-xs"
                :style="{
                  left: 0,
                  width: colWidth + 'px',
                  height: HEADER_HEIGHT + 'px',
                  transform: 'translateX(' + (vCol.start - scrollLeft) + 'px)',
                }"
              >
                <div
                  class="absolute left-1 bottom-1 whitespace-nowrap"
                  :style="{
                    transform: 'rotate(' + HEADER_LABEL_ROTATION + 'deg)',
                    transformOrigin: '0 100%',
                  }"
                >
                  <BlockPill
                    kind="instance"
                    :concept-type="activeMatrix.target"
                    :name="columns[vCol.index]"
                    :interactive="true"
                    :block-id="resolveBlockId(columns[vCol.index], activeMatrix.target)"
                    :node-id="resolveBlockId(columns[vCol.index], activeMatrix.target)"
                    :description="getNodeDescription(columns[vCol.index])"
                    :fields="getNodeFields(columns[vCol.index])"
                    :concept-fields="getConceptFields(activeMatrix.target)"
                    hide-empty
                  />
                </div>
              </div>
            </div>
            <div
              v-else
              class="px-3 py-3 text-center font-bold text-slate-400 dark:text-slate-500 text-xs"
            >
              No items defined in {{ activeMatrix.target }}
            </div>
          </div>
        </div>

        <!-- ── Body (first column + scrollable grid) ── -->
        <div class="flex flex-1 min-h-0">
          <!-- First column (row labels, synced with vertical scroll) -->
          <div
            class="shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-700 relative"
            :style="{ width: FIRST_COL_WIDTH + 'px' }"
          >
            <div v-if="rows.length" :style="{ height: rowTotalSize + 'px', position: 'relative' }">
              <div
                v-for="vRow in rowVirtualizer.getVirtualItems()"
                :key="'row-' + String(vRow.key)"
                class="absolute left-0 right-0 flex items-center px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs text-xs"
                :style="{
                  top: 0,
                  height: ROW_HEIGHT + 'px',
                  transform: 'translateY(' + (vRow.start - scrollTop) + 'px)',
                }"
              >
                <BlockPill
                  kind="instance"
                  :concept-type="activeMatrix.source"
                  :name="rows[vRow.index]"
                  :interactive="true"
                  :block-id="resolveBlockId(rows[vRow.index], activeMatrix.source)"
                  :node-id="resolveBlockId(rows[vRow.index], activeMatrix.source)"
                  :description="getNodeDescription(rows[vRow.index])"
                  :fields="getNodeFields(rows[vRow.index])"
                  :concept-fields="getConceptFields(activeMatrix.source)"
                  hide-empty
                />
              </div>
            </div>
            <div v-else class="text-center text-slate-400 dark:text-slate-500 text-xs italic py-6">
              No items defined in {{ activeMatrix.source }}
            </div>
          </div>

          <!-- Scrollable grid (both axes) with sticky first row/col via layout sync -->
          <div ref="scrollRef" class="flex-1 overflow-auto" @scroll="onMatrixScroll">
            <div
              v-if="rows.length && columns.length"
              :style="{
                height: rowTotalSize + 'px',
                width: colTotalSize + 'px',
                position: 'relative',
              }"
            >
              <div
                v-for="vRow in rowVirtualizer.getVirtualItems()"
                :key="'br-' + String(vRow.key)"
                class="absolute"
                :style="{
                  top: 0,
                  height: ROW_HEIGHT + 'px',
                  transform: 'translateY(' + vRow.start + 'px)',
                }"
              >
                <div
                  v-for="vCol in colVirtualizer.getVirtualItems()"
                  :key="'bc-' + String(vRow.key) + '-' + String(vCol.key)"
                  class="absolute flex items-center justify-center px-2 py-2 border-r border-b border-slate-100 dark:border-slate-800"
                  :class="getHeatmapClasses(rows[vRow.index], columns[vCol.index])"
                  :style="{
                    left: 0,
                    width: colWidth + 'px',
                    height: ROW_HEIGHT + 'px',
                    transform: 'translateX(' + vCol.start + 'px)',
                  }"
                >
                  <!-- 1. Widget Boolean Checkbox -->
                  <div
                    v-if="activeMatrix.widgetType === 'boolean'"
                    class="flex items-center justify-center"
                  >
                    <input
                      type="checkbox"
                      :checked="
                        getVal(rows[vRow.index], columns[vCol.index]) === 'X' ||
                        getVal(rows[vRow.index], columns[vCol.index]) === true
                      "
                      @change="
                        setVal(
                          rows[vRow.index],
                          columns[vCol.index],
                          ($event.target as HTMLInputElement).checked ? 'X' : '-',
                        )
                      "
                      class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <!-- 2. Widget Cycle Buttons -->
                  <button
                    v-else-if="activeMatrix.widgetType === 'cycle'"
                    @click="rotateCycle(rows[vRow.index], columns[vCol.index])"
                    :class="[
                      getCycleBgColor(getVal(rows[vRow.index], columns[vCol.index])),
                      'px-2 py-1 rounded border text-xs font-bold w-full transition-all cursor-pointer',
                    ]"
                  >
                    {{
                      getVal(rows[vRow.index], columns[vCol.index]) === '-'
                        ? ''
                        : getVal(rows[vRow.index], columns[vCol.index])
                    }}
                  </button>

                  <!-- 3. Widget Rating Scale -->
                  <select
                    v-else-if="activeMatrix.widgetType === 'scale'"
                    :value="
                      getVal(rows[vRow.index], columns[vCol.index]) === '-'
                        ? ''
                        : getVal(rows[vRow.index], columns[vCol.index])
                    "
                    @change="
                      setVal(
                        rows[vRow.index],
                        columns[vCol.index],
                        ($event.target as HTMLSelectElement).value || '-',
                      )
                    "
                    class="border rounded px-1.5 py-1 text-xs w-full text-center outline-none focus:ring-1 focus:ring-primary border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="">-</option>
                    <option
                      v-if="isOutOfSetValue(getVal(rows[vRow.index], columns[vCol.index]))"
                      :value="String(getVal(rows[vRow.index], columns[vCol.index]))"
                    >
                      {{ getVal(rows[vRow.index], columns[vCol.index]) }}
                    </option>
                    <option v-for="num in scaleRange" :key="num" :value="num">{{ num }}</option>
                  </select>

                  <!-- 4. Widget Custom Set Options -->
                  <select
                    v-else-if="activeMatrix.widgetType === 'set'"
                    :value="
                      getVal(rows[vRow.index], columns[vCol.index]) === '-'
                        ? ''
                        : getVal(rows[vRow.index], columns[vCol.index])
                    "
                    @change="
                      setVal(
                        rows[vRow.index],
                        columns[vCol.index],
                        ($event.target as HTMLSelectElement).value || '-',
                      )
                    "
                    class="border rounded px-1.5 py-1 text-xs w-full outline-none focus:ring-1 focus:ring-primary border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="">-</option>
                    <option
                      v-if="isOutOfSetValue(getVal(rows[vRow.index], columns[vCol.index]))"
                      :value="String(getVal(rows[vRow.index], columns[vCol.index]))"
                    >
                      {{ getVal(rows[vRow.index], columns[vCol.index]) }}
                    </option>
                    <option v-for="opt in getSetOptionsList()" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>

                  <!-- 5. Widget Free Text -->
                  <input
                    v-else-if="activeMatrix.widgetType === 'text'"
                    type="text"
                    :value="
                      getVal(rows[vRow.index], columns[vCol.index]) === '-'
                        ? ''
                        : getVal(rows[vRow.index], columns[vCol.index])
                    "
                    @input="
                      setVal(
                        rows[vRow.index],
                        columns[vCol.index],
                        ($event.target as HTMLInputElement).value || '-',
                      )
                    "
                    placeholder="-"
                    class="border rounded px-1.5 py-1 text-xs w-full outline-none focus:ring-1 focus:ring-primary border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
            <div
              v-else-if="!rows.length"
              class="text-center text-slate-400 dark:text-slate-500 text-xs italic py-6"
            >
              No items defined in {{ activeMatrix.source }}. Make sure to add items to the hierarchy
              tree.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { ChevronDown } from 'lucide-vue-next'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import BlockPill from './BlockPill.vue'
import MatrixPill from './MatrixPill.vue'
import Badge from '../ui/Badge.vue'
import { commitFieldValue } from '../../shared/provenance'
import { normalizeMatrixDecl } from '@cognnitive/innfo-core'
import type { MatrixWidgetType } from '@cognnitive/innfo-core'

// ── Constants ──
const ROW_HEIGHT = 48
const HEADER_HEIGHT = 96
const HEADER_LABEL_ROTATION = -45
const FIRST_COL_WIDTH = 180
const MIN_COL_WIDTH = 48
const OVERSCAN = 3

const props = defineProps<{
  matrixIndex: number
}>()

const emit = defineEmits<{
  'cell-change': [cellKey: string, value: unknown]
}>()

const modelStore = useModelStore()

// ── Matrix definitions stored on root node fields ──
const MATRIX_DEFS_KEY = '__matrix_defs'

interface MatrixDef {
  name: string
  source: string
  target: string
  widgetType: MatrixWidgetType
  params: string
  values?: string[]
  description?: string
  min_color?: string
  max_color?: string
  label?: string
}

const rootNode = computed(() => {
  if (modelStore.rootIds.length === 0) return null
  if (activeMatrix.value) {
    const matrixName = activeMatrix.value.name
    for (const id of modelStore.rootIds) {
      const r = modelStore.getNode(id)
      if (!r) continue
      const defs = r.fields?.[MATRIX_DEFS_KEY]?.value || r.fields?.matrices?.value
      if (Array.isArray(defs) && defs.some((d: any) => d.name === matrixName)) {
        return r
      }
    }
  }
  const nonSpecId = modelStore.rootIds.find((id) => !id.startsWith('spec:'))
  return modelStore.getNode(nonSpecId || modelStore.rootIds[0])
})

const matrixDefs = computed<MatrixDef[]>(() => {
  const ids = modelStore.rootIds
  const defs: MatrixDef[] = []
  const seen = new Set<string>()

  for (const id of ids) {
    const r = modelStore.getNode(id)
    if (!r) continue
    const defsField = r.fields[MATRIX_DEFS_KEY]
    if (defsField?.value && Array.isArray(defsField.value)) {
      for (const m of defsField.value as any[]) {
        if (!seen.has(m.name)) {
          seen.add(m.name)
          defs.push(normalizeMatrixDecl(m))
        }
      }
    }
    const rawMatrices = r.fields?.matrices?.value
    if (Array.isArray(rawMatrices)) {
      for (const m of rawMatrices) {
        if (!seen.has(m.name)) {
          seen.add(m.name)
          defs.push(normalizeMatrixDecl(m))
        }
      }
    }
  }
  return defs
})

const activeMatrixIndex = ref(props.matrixIndex)
watch(
  () => props.matrixIndex,
  (idx) => {
    activeMatrixIndex.value = idx
  },
)

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectMatrix = (idx: number) => {
  activeMatrixIndex.value = idx
  isOpen.value = false
  useUiStore().setActiveMatrixIndex(idx)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const activeMatrix = computed(() => {
  if (matrixDefs.value.length === 0) return null
  if (activeMatrixIndex.value < 0) return null
  return matrixDefs.value[activeMatrixIndex.value]
})

// ── Derive rows/cols from modelStore nodes by concept type ──
const rows = computed(() => {
  if (!activeMatrix.value) return []
  const source = activeMatrix.value.source
  return Object.values(modelStore.nodes)
    .filter((n) => n.type === source)
    .map((n) => n.name)
})

const columns = computed(() => {
  if (!activeMatrix.value) return []
  const target = activeMatrix.value.target
  return Object.values(modelStore.nodes)
    .filter((n) => n.type === target)
    .map((n) => n.name)
})

// ── Column width from params (default 120px) ──
const colWidth = computed(() => {
  if (!activeMatrix.value) return MIN_COL_WIDTH
  const params = activeMatrix.value.params
  const match = params?.match(/colWidth:(\d+)/)
  const w = match ? parseInt(match[1]) : 120
  return Math.max(w, MIN_COL_WIDTH)
})

const scaleRange = computed(() => {
  if (!activeMatrix.value) return []
  const values = activeMatrix.value.values
  if (Array.isArray(values) && values.length > 0) {
    const numeric = values.map(Number).filter((n) => !Number.isNaN(n))
    if (numeric.length === values.length) return numeric
  }
  const params = activeMatrix.value.params
  const minMatch = params.match(/min:(\d+)/)
  const maxMatch = params.match(/max:(\d+)/)
  const min = minMatch ? parseInt(minMatch[1]) : 1
  const max = maxMatch ? parseInt(maxMatch[1]) : 5
  const range: number[] = []
  for (let i = min; i <= max; i++) range.push(i)
  return range
})

// ── Virtual Scroller Setup ──
const scrollRef = ref<HTMLElement | null>(null)
const scrollLeft = ref(0)
const scrollTop = ref(0)

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: rows.value.length,
    getScrollElement: () => scrollRef.value,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  })),
)

const colVirtualizer = useVirtualizer(
  computed(() => ({
    horizontal: true,
    count: columns.value.length,
    getScrollElement: () => scrollRef.value,
    estimateSize: () => colWidth.value,
    overscan: OVERSCAN,
  })),
)

const colTotalSize = computed(() => colVirtualizer.value.getTotalSize())
const rowTotalSize = computed(() => rowVirtualizer.value.getTotalSize())

// ── Scroll position tracking per matrix ──
const scrollPositions = new Map<string, { scrollTop: number; scrollLeft: number }>()

function onMatrixScroll() {
  const el = scrollRef.value
  if (!el) return
  scrollLeft.value = el.scrollLeft
  scrollTop.value = el.scrollTop

  if (activeMatrixIndex.value < 0) return
  const name = matrixDefs.value[activeMatrixIndex.value]?.name
  if (name) {
    scrollPositions.set(name, { scrollTop: el.scrollTop, scrollLeft: el.scrollLeft })
  }
}

// Save/restore scroll position on matrix switch
watch(activeMatrixIndex, (newIdx, oldIdx) => {
  const el = scrollRef.value
  if (!el) return

  const defs = matrixDefs.value

  // Save old position
  if (oldIdx >= 0 && oldIdx < defs.length) {
    scrollPositions.set(defs[oldIdx].name, {
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft,
    })
  }

  // Restore or reset new position
  if (newIdx >= 0 && newIdx < defs.length) {
    const pos = scrollPositions.get(defs[newIdx].name)
    nextTick(() => {
      if (scrollRef.value) {
        scrollRef.value.scrollTop = pos?.scrollTop ?? 0
        scrollRef.value.scrollLeft = pos?.scrollLeft ?? 0
      }
    })
  }
})

// ── Matrix values stored as fields on root node ──
function matrixCellKey(row: string, col: string): string {
  if (!activeMatrix.value) return ''
  return `${activeMatrix.value.name}||${row}||${col}`
}

const getVal = (row: string, col: string): string | number | boolean => {
  if (!activeMatrix.value) return ''
  const key = matrixCellKey(row, col)
  for (const id of modelStore.rootIds) {
    const r = modelStore.getNode(id)
    if (!r) continue
    const field = r.fields[key]
    if (field && field.value !== undefined && field.value !== null) {
      return field.value as string | number | boolean
    }
  }
  return '-'
}

const setVal = (row: string, col: string, value: string | number | boolean) => {
  if (!activeMatrix.value) return
  const root = rootNode.value
  if (!root) return
  const key = matrixCellKey(row, col)
  commitFieldValue(modelStore, root.id, key, value, { kind: 'user', id: 'anonymous' })
  emit('cell-change', key, value)
}

// ── Value distribution iterates ALL cells, not just visible ──
const valueDistribution = computed(() => {
  if (!activeMatrix.value || !rows.value.length || !columns.value.length)
    return {} as Record<string, number>
  const counts: Record<string, number> = {}
  const prefix = activeMatrix.value.name + '||'
  for (const row of rows.value) {
    for (const col of columns.value) {
      const key = `${prefix}${row}||${col}`
      let val: any = undefined
      for (const id of modelStore.rootIds) {
        const r = modelStore.getNode(id)
        const field = r?.fields?.[key]
        if (field && field.value !== undefined && field.value !== null) {
          val = field.value
          break
        }
      }
      const strVal = val === undefined || val === null || val === '-' ? '-' : String(val)
      counts[strVal] = (counts[strVal] || 0) + 1
    }
  }
  return counts
})

// ── Color helpers ──
const getCycleBgColor = (val: string | number | boolean): string => {
  if (val === '-' || val === '' || val === undefined)
    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400'
  const colorScale: Record<string, string> = {
    '1': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
    '2': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
    '3': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
    '4': 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300',
    '5': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  }
  return colorScale[String(val)] || 'bg-primary/10 text-primary border-primary/30'
}

const getDistClasses = (value: string): string => {
  if (value === '-')
    return 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600'
  return getCycleBgColor(value)
}

const getHeatmapClasses = (row: string, col: string): string => {
  const val = getVal(row, col)
  if (val === '-' || val === '' || val === undefined || val === null) return ''
  return getCycleBgColor(val)
}

// ── Utility functions ──
const getSetOptionsList = (): string[] => {
  if (!activeMatrix.value) return []
  const values = activeMatrix.value.values
  if (Array.isArray(values) && values.length > 0) return values
  const params = activeMatrix.value.params
  return params
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** True when a cell holds a non-empty value that is not part of the widget's options. */
const isOutOfSetValue = (value: string | number | boolean): boolean => {
  if (value === '-' || value === '' || value === undefined || value === null) return false
  if (activeMatrix.value?.widgetType === 'scale') {
    return !scaleRange.value.includes(Number(value))
  }
  if (activeMatrix.value?.widgetType === 'set') {
    return !getSetOptionsList().includes(String(value))
  }
  return false
}

const rotateCycle = (row: string, col: string) => {
  if (!activeMatrix.value) return
  const current = getVal(row, col)
  const options = getSetOptionsList()
  if (options.length === 0) {
    // Default cycle: 1-2-3-4-5
    const defaultCycle = ['1', '2', '3', '4', '5']
    const idx = current === '-' ? -1 : defaultCycle.indexOf(String(current))
    const next = idx >= defaultCycle.length - 1 ? '-' : defaultCycle[idx + 1]
    setVal(row, col, next)
  } else {
    const idx = current === '-' ? -1 : options.indexOf(String(current))
    const next = idx >= options.length - 1 ? '-' : options[idx + 1]
    setVal(row, col, next)
  }
}

const resolveBlockId = (name: string, _conceptType: string): string | undefined => {
  const node = Object.values(modelStore.nodes).find((n) => n.name === name)
  return node?.id
}

// ── Node + concept metadata for header pills ───────────────────

const getNodeByName = (name: string) => Object.values(modelStore.nodes).find((n) => n.name === name)

const getNodeDescription = (name: string): string => {
  return getNodeByName(name)?.rawSections?.description ?? ''
}

/** Unwraps FieldValue entries into plain values for the BlockPill popup. */
const getNodeFields = (name: string): Record<string, any> => {
  const node = getNodeByName(name)
  const out: Record<string, any> = {}
  if (node?.fields) {
    for (const [k, v] of Object.entries(node.fields)) {
      const val = (v as any)?.value
      if (val !== undefined && val !== null && val !== '' && val !== false) out[k] = val
    }
  }
  return out
}

const getConceptFields = (conceptType: string): any[] => {
  const lower = conceptType?.toLowerCase()
  for (const id of modelStore.rootIds) {
    const r = modelStore.getNode(id)
    const concepts = r?.localMetamodel?.concepts
    if (Array.isArray(concepts)) {
      const c = concepts.find((x) => x.name.toLowerCase() === lower)
      if (c?.fields) return c.fields
    }
  }
  return []
}

/** Resolves the concept icon/color from the effective (template) metamodel. */
const getConceptMeta = (conceptType: string): { icon?: string; color?: string } => {
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

const getMatrixValueCount = (matrixName: string): number => {
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
</script>
