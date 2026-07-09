<template>
  <div data-testid="virtual-group-node" class="select-none">
    <!-- ── Non-ghost: header + children ── -->
    <template v-if="!ghost">
      <div
        class="flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs group cursor-pointer"
        :style="headerStyle"
        :class="headerClasses"
        @click="toggleCollapsed"
      >
        <!-- Expand/collapse -->
        <button
          v-if="children.length > 0"
          @click.stop="toggleCollapsed"
          class="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center shrink-0"
        >
          <ChevronDown
            class="transition-transform duration-200 w-3.5 h-3.5"
            :class="{ '-rotate-90': isCollapsed }"
          />
        </button>
        <span v-else class="w-5 shrink-0"></span>

        <!-- Icon from concept definition -->
        <div class="relative shrink-0 flex items-center justify-center w-4 h-4">
          <IconRenderer
            :icon="conceptIcon"
            fallback="folder"
            custom-class="shrink-0"
            :style="{ color: conceptColorHex, width: '14px', height: '14px' }"
          />
        </div>

        <!-- Concept name (uppercase, subtle) -->
        <span
          class="flex-1 min-w-0 truncate text-[11px] font-bold uppercase tracking-wider"
          :style="{ color: conceptColorHex }"
        >
          {{ conceptName }}
        </span>

        <!-- Count badge -->
        <span
          class="text-2xs px-1.5 py-0.5 rounded-full shrink-0 font-medium tabular-nums"
          :style="{
            backgroundColor: conceptColorHex + '18',
            color: conceptColorHex,
          }"
        >
          {{ children.length }}
        </span>
      </div>

      <!-- ── Child elements (non-ghost, collapsed) ── -->
      <div
        v-if="children.length > 0 && !isCollapsed"
        class="ml-2 pl-1 border-l border-slate-200 dark:border-slate-700 space-y-0.5"
      >
        <ConceptTreeNode
          v-for="child in children"
          :key="child.id"
          :node-id="child.id"
          :selected-id="selectedId"
          :depth="depth + 1"
          :expanded-generation="expandedGeneration"
          @select="(id: string) => $emit('select', id)"
          @move-up="(id: string) => $emit('move-up', id)"
          @move-down="(id: string) => $emit('move-down', id)"
        />
      </div>
    </template>

    <!-- ── Ghost concept group header (click to convert) ── -->
    <template v-else>
      <div
        class="flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
        :style="ghostHeaderStyle"
        :class="ghostHeaderClasses"
        @click="$emit('click-ghost', conceptName)"
        data-testid="ghost-group-header"
      >
        <div class="pointer-events-none flex items-center gap-1 flex-1 min-w-0" style="opacity: 0.55">
          <div class="relative shrink-0 flex items-center justify-center w-4 h-4">
            <IconRenderer
              :icon="conceptIcon"
              fallback="folder"
              custom-class="shrink-0"
              :style="{ color: conceptColorHex, width: '14px', height: '14px' }"
            />
          </div>
          <span
            class="flex-1 min-w-0 truncate text-[11px] font-bold uppercase tracking-wider italic"
            :style="{ color: conceptColorHex }"
          >
            {{ conceptName }}
          </span>
          <span class="text-2xs text-slate-400 dark:text-slate-500 italic tabular-nums">0</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import {
  useConceptVisuals,
  getHexColor,
  getHexColorLight,
} from '../../composables/useConceptVisuals'
import { useMetamodelStore } from '../../stores/metamodelStore'
import IconRenderer from '../editor/IconRenderer.vue'
import ConceptTreeNode from './ConceptTreeNode.vue'
import type { ModelNode } from '../../model/types'

const props = withDefaults(
  defineProps<{
    conceptName: string
    children: ModelNode[]
    selectedId: string | null
    depth?: number
    expandedGeneration?: number
    /** When true, renders as a ghost placeholder (no instances exist). */
    ghost?: boolean
  }>(),
  {
    depth: 0,
    expandedGeneration: undefined,
    ghost: false,
  },
)

const _emit = defineEmits<{
  select: [nodeId: string]
  'move-up': [nodeId: string]
  'move-down': [nodeId: string]
  'click-ghost': [conceptName: string]
}>()

const visuals = useConceptVisuals()
const metamodelStore = useMetamodelStore()
const isCollapsed = ref(false)

watch(
  () => props.expandedGeneration,
  (gen) => {
    if (gen !== undefined) {
      isCollapsed.value = gen < 0
    }
  },
  { immediate: true },
)

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
}

// Resolve icon and color for this concept group
const conceptColorHex = computed(() => {
  if (props.ghost) {
    // For ghost concepts, resolve from metamodel directly (no children)
    const concept = metamodelStore.getConceptByName(props.conceptName)
    if (concept?.color) return getHexColor(concept.color)
    return '#94a3b8'
  }
  const firstChild = props.children[0]
  if (firstChild) {
    const mc = visuals.getConceptForNode(firstChild)
    if (mc?.color) return getHexColor(mc.color)
  }
  return '#94a3b8'
})

const conceptIcon = computed(() => {
  if (props.ghost) {
    const concept = metamodelStore.getConceptByName(props.conceptName)
    return concept?.icon ?? 'folder'
  }
  const firstChild = props.children[0]
  if (firstChild) {
    return visuals.resolveIcon(firstChild)
  }
  return 'folder'
})

const headerStyle = computed(() => {
  const color = conceptColorHex.value
  return {
    borderLeft: `3px solid ${color}`,
    paddingLeft: 'calc(0.5rem - 2px)',
    backgroundColor: getHexColorLight(color),
  }
})

const headerClasses = computed(() => {
  return 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
})

// ── Ghost styling ───────────────────────────────────────────────
const ghostHeaderStyle = computed(() => {
  const color = conceptColorHex.value
  return {
    borderLeft: `2px dashed ${color}66`,
    paddingLeft: 'calc(0.5rem - 1px)',
    backgroundColor: getHexColorLight(color),
  }
})

const ghostHeaderClasses = computed(() => {
  return 'text-slate-500 dark:text-slate-400'
})
</script>
