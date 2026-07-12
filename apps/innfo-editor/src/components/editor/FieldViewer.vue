<template>
  <div
    data-testid="field-viewer"
    class="field-viewer grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
  >
    <div v-for="entry in fieldEntries" :key="entry.def.name" class="flex flex-col gap-1">
      <label
        class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
      >
        {{ entry.def.name.replace(/_/g, ' ').toUpperCase() }}
      </label>

      <!-- Edit mode: use WidgetField for interactive editing -->
      <WidgetField
        v-if="!readonly"
        :node-id="nodeId"
        :field-key="entry.def.name"
        :widget-type="entry.def.type"
        :field-definition="entry.def"
      />

      <!-- Read mode: display formatted value -->
      <div
        v-else
        class="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center min-h-[24px]"
      >
        <!-- Markdown field types: render via WidgetField for proper markdown rendering -->
        <WidgetField
          v-if="entry.isMarkdownType"
          :node-id="nodeId"
          :field-key="entry.def.name"
          :widget-type="entry.def.type"
          :field-definition="entry.def"
        />
        <template v-else-if="entry.hasValue && entry.displayValue !== ''">
          <template v-if="entry.def.type === 'select' && entry.def.options">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
            >
              {{ entry.displayValue }}
            </span>
          </template>
          <template v-else-if="entry.def.type === 'reference'">
            <BlockPill
              v-if="entry.refNode"
              :node-id="entry.refNode.id"
              :name="entry.refNode.name"
              :kind="entry.refNode.conceptBinding?.name ? 'instance' : 'concept'"
              :concept-type="entry.refNode.type"
              :block-id="entry.refNode.id"
              :description="entry.refNode.rawContent || entry.refNode.rawSections?.description || ''"
              :fields="entry.refNode.fields"
              :concept-fields="getConceptFields(entry.refNode.type)"
              interactive
              class="cursor-pointer"
              @click="uiStore.selectNode(entry.refNode.id)"
            />
            <span
              v-else
              class="text-slate-400 dark:text-slate-500 italic underline decoration-dotted cursor-help"
              title="Referenced node not found in this model"
            >
              [[{{ entry.displayValue }}]]
            </span>
          </template>
          <template v-else-if="entry.def.type === 'boolean'">
            <span
              :class="
                entry.displayValue
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              "
            >
              {{ entry.displayValue ? 'Yes' : 'No' }}
            </span>
          </template>
          <template v-else>
            {{ entry.displayValue }}
          </template>
        </template>
        <span v-else class="text-slate-300 dark:text-slate-600 italic">—</span>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-if="fieldDefinitions.length === 0"
      class="col-span-full text-xs text-slate-400 dark:text-slate-500 italic"
    >
      No fields defined for this concept.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WidgetField from '../../shared/widgets/WidgetField.vue'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import type { ModelNode } from '../../model/types'
import BlockPill from './BlockPill.vue'

const MARKDOWN_FIELD_TYPES = new Set(['markdown_inline', 'markdown_file', 'markdown'])

interface FieldEntry {
  def: {
    name: string
    type: string
    options?: string[]
    target_concepts?: string[]
  }
  hasValue: boolean
  displayValue: unknown
  isMarkdownType: boolean
  refNode?: ModelNode | null
}

/**
 * FieldViewer renders node fields using the widget registry.
 *
 * In read mode, fields display as formatted labels/values.
 * In edit mode, fields render as interactive WidgetField instances
 * backed by the widget registry.
 */
const props = withDefaults(
  defineProps<{
    nodeId: string
    fieldDefinitions: Array<{
      name: string
      type: string
      options?: string[]
      target_concepts?: string[]
    }>
    readonly?: boolean
  }>(),
  {
    readonly: true,
  },
)

const modelStore = useModelStore()
const uiStore = useUiStore()

const getConceptFields = (typeName: string | undefined) => {
  if (!typeName) return []
  const rootId = modelStore.rootIds[0]
  if (!rootId) return []
  const root = modelStore.getNode(rootId)
  return root?.localMetamodel?.concepts?.find(
    (c) => c.name.toLowerCase() === typeName.toLowerCase(),
  )?.fields ?? []
}

/**
 * Computes an array of field entries pairing each field definition
 * with its current value from the store.
 */
const fieldEntries = computed<FieldEntry[]>(() => {
  const node = modelStore.getNode(props.nodeId)

  return props.fieldDefinitions.map((def) => {
    const fv = node?.fields?.[def.name]
    const rawValue = fv?.value ?? fv ?? undefined
    const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== ''

    let refNode = null
    if (def.type === 'reference' && hasValue && typeof rawValue === 'string') {
      const cleanName = rawValue.trim()
      if (modelStore.nodes[cleanName]) {
        refNode = modelStore.nodes[cleanName]
      } else {
        refNode = Object.values(modelStore.nodes).find(
          (n) => n.name.toLowerCase() === cleanName.toLowerCase()
        ) || null
      }
    }

    return {
      def,
      hasValue,
      displayValue: rawValue ?? '',
      isMarkdownType: MARKDOWN_FIELD_TYPES.has(def.type),
      refNode,
    }
  })
})
</script>
