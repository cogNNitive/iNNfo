<template>
  <component
    :is="as"
    :data-testid="'matrix-pill-' + name"
    :class="pillClasses"
    :title="tooltipText"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <!-- Source → Target rendered like tree concept headers (icon + colored uppercase name + element count) -->
    <template v-if="showSourceTarget && source && target">
      <span class="truncate min-w-0 leading-tight flex items-center gap-1.5 flex-1">
        <span class="flex items-center gap-1 min-w-0">
          <span class="relative shrink-0 flex items-center justify-center w-4 h-4">
            <IconRenderer
              :icon="getConceptMeta(source).icon"
              fallback="folder"
              custom-class="shrink-0"
              :style="{ color: getConceptHex(source), width: '14px', height: '14px' }"
            />
          </span>
          <span
            class="truncate text-[11px] font-bold uppercase tracking-wider"
            :style="{ color: getConceptHex(source) }"
          >
            {{ source }}
          </span>
          <span
            class="text-2xs px-1.5 py-0.5 rounded-full shrink-0 font-medium tabular-nums"
            :style="{
              backgroundColor: getConceptHex(source) + '18',
              color: getConceptHex(source),
            }"
            :data-testid="'matrix-pill-source-count-' + name"
          >
            {{ getConceptElementCount(source) }}
          </span>
        </span>
        <span v-if="label" class="text-xs text-slate-400 dark:text-slate-500 font-normal italic">{{
          label
        }}</span>
        <span class="text-slate-300 dark:text-slate-600 font-normal shrink-0">&rarr;</span>
        <span class="flex items-center gap-1 min-w-0">
          <span class="relative shrink-0 flex items-center justify-center w-4 h-4">
            <IconRenderer
              :icon="getConceptMeta(target).icon"
              fallback="folder"
              custom-class="shrink-0"
              :style="{ color: getConceptHex(target), width: '14px', height: '14px' }"
            />
          </span>
          <span
            class="truncate text-[11px] font-bold uppercase tracking-wider"
            :style="{ color: getConceptHex(target) }"
          >
            {{ target }}
          </span>
          <span
            class="text-2xs px-1.5 py-0.5 rounded-full shrink-0 font-medium tabular-nums"
            :style="{
              backgroundColor: getConceptHex(target) + '18',
              color: getConceptHex(target),
            }"
            :data-testid="'matrix-pill-target-count-' + name"
          >
            {{ getConceptElementCount(target) }}
          </span>
        </span>
      </span>
    </template>

    <!-- Legacy: leading icon + matrix name -->
    <template v-else>
      <IconRenderer
        :icon="resolvedSourceIcon"
        custom-class="shrink-0 w-3.5 h-3.5"
        :class="[sourceAccent, isGhost ? 'opacity-60' : '']"
      />
      <span
        class="truncate min-w-0 leading-tight flex-1"
        :class="isGhost ? 'italic opacity-70' : ''"
      >
        {{ name }}
      </span>
    </template>

    <span
      v-if="valueCount !== undefined"
      class="text-2xs px-1.5 py-0.5 rounded-full shrink-0 font-medium tabular-nums ml-auto"
      :class="countBadgeClasses"
      :data-testid="'matrix-pill-count-' + name"
    >
      {{ valueCount }}
    </span>

    <ChevronRight
      v-if="interactive"
      class="shrink-0 w-3.5 h-3.5 transition-colors"
      :class="chevronClasses"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useModelStore } from '../../stores/modelStore'
import { useMetamodelStore } from '../../stores/metamodelStore'
import { getColorClasses } from '../../utils/colors'
import { getHexColor, COLOR_HEX } from '../../composables/useConceptVisuals'
import IconRenderer from './IconRenderer.vue'

const modelStore = useModelStore()
const metamodelStore = useMetamodelStore()

const props = withDefaults(
  defineProps<{
    name: string
    source?: string
    target?: string
    label?: string
    description?: string
    interactive?: boolean
    selected?: boolean
    fullWidth?: boolean
    showSourceTarget?: boolean
    as?: string
    valueCount?: number
    ghost?: boolean
  }>(),
  {
    interactive: false,
    selected: false,
    fullWidth: false,
    showSourceTarget: false,
    label: '',
    as: 'div',
    valueCount: undefined,
    ghost: undefined,
  },
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isGhost = computed(() => {
  if (props.ghost !== undefined) return props.ghost
  if (props.valueCount !== undefined) return props.valueCount === 0
  return false
})

// Resolve concept icon + color from the effective metamodel (same mechanism as the tree)
function getConceptMeta(typeName: string | undefined): { icon?: string; color?: string } {
  if (!typeName) return {}
  const concept = metamodelStore.getConceptByName(typeName)
  if (concept) return { icon: concept.icon, color: concept.color }
  return {}
}

/** Hex color for a concept type (for the colored name / icon / count badge). */
function getConceptHex(typeName: string | undefined): string {
  const color = getConceptMeta(typeName).color
  return color ? getHexColor(color) : COLOR_HEX.slate
}

/** Number of element instances of a given concept type across the model. */
function getConceptElementCount(typeName: string | undefined): number {
  if (!typeName) return 0
  const lowerType = typeName.toLowerCase()
  let count = 0
  for (const node of Object.values(modelStore.nodes)) {
    if (node.kind === 'element' && node.type?.toLowerCase() === lowerType) count++
  }
  return count
}

const resolvedSourceIcon = computed(() => getConceptMeta(props.source).icon || 'table-2')

const sourceAccent = computed(() => {
  const color = getConceptMeta(props.source).color
  const palette = color ? getColorClasses(color) : null
  return palette?.accent || 'text-slate-400 dark:text-slate-500'
})

const chevronClasses = computed(() => {
  if (!props.interactive) return 'hidden'
  const color = getConceptMeta(props.source).color
  const palette = color ? getColorClasses(color) : null
  return palette?.accent
    ? `${palette.accent} opacity-0 group-hover:opacity-100`
    : 'text-slate-300 dark:text-slate-600 group-hover:text-primary'
})

const tooltipText = computed(() => {
  let countStr = ''
  if (props.valueCount !== undefined) {
    countStr = props.valueCount === 1 ? ' (1 value)' : ` (${props.valueCount} values)`
  }
  if (props.showSourceTarget && props.source && props.target) {
    let t = `${props.name} \u2014 ${props.source} \u2192 ${props.target}`
    if (props.label) t += ` (${props.label})`
    if (props.description) t += ` \u2014 ${props.description}`
    return t + countStr
  }
  if (props.description) return `${props.name} \u2014 ${props.description}` + countStr
  return props.name + countStr
})

const countBadgeClasses = computed(() => {
  if (isGhost.value) {
    return 'text-slate-400 dark:text-slate-500 italic bg-slate-100/80 dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700'
  }
  if (props.selected) {
    return 'bg-primary/20 text-primary dark:text-primary-300 font-semibold'
  }
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold'
})

const pillClasses = computed(() => {
  const base = [
    'inline-flex items-center gap-2',
    'px-3 py-1.5 text-xs rounded-lg',
    'transition-all duration-200 select-none min-w-0',
    props.fullWidth ? 'w-full' : 'max-w-full',
  ]

  if (props.selected) {
    return [
      ...base,
      'bg-primary/10 text-primary border',
      isGhost.value ? 'border-dashed border-primary/40' : 'border-primary/30',
    ]
  }

  if (props.interactive) {
    if (isGhost.value) {
      return [
        ...base,
        'bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700/80',
        'hover:bg-primary/5 hover:text-primary hover:border-primary/30',
        'cursor-pointer active:scale-[0.99] group opacity-80',
      ]
    }
    return [
      ...base,
      'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      'hover:bg-primary/5 hover:text-primary hover:border-primary/30',
      'cursor-pointer active:scale-[0.99] group',
    ]
  }

  if (isGhost.value) {
    return [
      ...base,
      'text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 opacity-75',
    ]
  }

  return [...base, 'text-slate-500 dark:text-slate-400']
})
</script>
