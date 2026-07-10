<template>
  <div class="flex flex-col gap-3">
    <!-- Action Bar -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ conceptType || 'Elements' }} List
      </h3>
      <button
        @click="addElement"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        data-testid="add-element-btn"
      >
        <Plus class="w-3.5 h-3.5" />
        Add {{ conceptType || 'Element' }}
      </button>
    </div>

    <!-- Table Container -->
    <div
      class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    >
      <table class="w-full caption-bottom text-sm border-separate border-spacing-0 min-w-[600px]">
        <thead class="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/95">
          <tr>
            <th
              class="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/95 text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 min-w-[200px]"
            >
              Element
            </th>
            <th
              v-for="field in conceptFields"
              :key="field.name"
              class="text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 min-w-[140px]"
            >
              {{ field.name.replace(/_/g, ' ') }}
            </th>
            <th
              class="text-center px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 min-w-[100px] w-[100px]"
            >
              Order
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(child, idx) in children"
            :key="child.id"
            @click="navigateTo(child.id)"
            class="group transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
            :class="idx === children.length - 1 ? 'border-b-0' : ''"
          >
            <td
              class="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/30 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-700/50"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500 shrink-0"
                >
                  {{ child.name.charAt(0).toUpperCase() }}
                </span>
                <span class="truncate">{{ child.name }}</span>
              </div>
            </td>
            <td
              v-for="field in conceptFields"
              :key="field.name"
              @click.stop
              class="px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <WidgetField
                :node-id="child.id"
                :field-key="field.name"
                :widget-type="field.type || 'string'"
                :field-definition="field"
              />
            </td>
            <td class="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 text-center">
              <div class="flex items-center justify-center gap-1">
                <button
                  :disabled="idx === 0"
                  @click.stop="moveUp(child.id)"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer flex items-center justify-center"
                  title="Move up"
                >
                  <ChevronUp class="w-3.5 h-3.5" />
                </button>
                <button
                  :disabled="idx === children.length - 1"
                  @click.stop="moveDown(child.id)"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer flex items-center justify-center"
                  title="Move down"
                >
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="children.length === 0">
            <td
              :colspan="2 + (conceptFields?.length || 0)"
              class="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic"
            >
              No elements for this concept.
              <button
                @click="addElement"
                class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Add the first one.
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronUp, ChevronDown, Plus } from 'lucide-vue-next'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import WidgetField from '../../shared/widgets/WidgetField.vue'

const props = defineProps<{
  nodeId: string
  conceptType?: string
  conceptFields?: any[]
}>()

const modelStore = useModelStore()
const uiStore = useUiStore()

const children = computed(() => {
  const id = props.nodeId
  if (id.startsWith('virtual:')) {
    const parts = id.split(':')
    const parentId = parts[1]
    const conceptName = parts[2]
    const parentNode = modelStore.getNode(parentId)
    if (!parentNode) return []
    return parentNode.childIds
      .map((cid) => modelStore.getNode(cid))
      .filter(
        (child): child is any => !!child && child.type === conceptName && child.kind === 'element',
      )
  }
  return modelStore.getChildren(id)
})

function navigateTo(nodeId: string): void {
  uiStore.selectNode(nodeId)
}

function moveUp(childId: string): void {
  const id = props.nodeId
  if (id.startsWith('virtual:')) {
    const parentId = id.split(':')[1]
    modelStore.reorderChild(parentId, childId, -1)
  } else {
    modelStore.reorderChild(id, childId, -1)
  }
}

function moveDown(childId: string): void {
  const id = props.nodeId
  if (id.startsWith('virtual:')) {
    const parentId = id.split(':')[1]
    modelStore.reorderChild(parentId, childId, 1)
  } else {
    modelStore.reorderChild(id, childId, 1)
  }
}

function addElement(): void {
  const type = props.conceptType
  if (!type) return

  let parentId = props.nodeId
  if (props.nodeId.startsWith('virtual:')) {
    parentId = props.nodeId.split(':')[1]
  }

  let index = 1
  let elementName = `New ${type}`
  let targetId = `${parentId}/${elementName}`
  while (modelStore.getNode(targetId)) {
    index++
    elementName = `New ${type} ${index}`
    targetId = `${parentId}/${elementName}`
  }

  const newId = modelStore.createChild(parentId, elementName, type, 'element')
  if (newId) {
    uiStore.selectNode(newId)
  }
}
</script>
