<template>
  <div class="select-none">
    <!-- Node row -->
    <div
      class="flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs group cursor-pointer"
      :class="rowClasses"
      @click="onSelect"
    >
      <!-- Expand/collapse chevron or spacer -->
      <button
        v-if="hasChildren"
        @click.stop="toggleCollapse"
        class="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center shrink-0"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
      >
        <ChevronDown
          class="transition-transform duration-200 w-3.5 h-3.5"
          :class="{ '-rotate-90': isCollapsed }"
        />
      </button>
      <span v-else class="w-5 shrink-0"></span>

      <!-- Icon -->
      <IconRenderer
        v-if="node?.type"
        :icon="node.type"
        fallback="file-text"
        custom-class="shrink-0 w-3.5 h-3.5 text-slate-500 dark:text-slate-400"
      />

      <!-- Name -->
      <span class="flex-1 min-w-0 truncate font-medium" :class="nameClasses">
        {{ node?.name ?? '(unknown)' }}
      </span>

      <!-- Storage mode badge -->
      <span
        v-if="node?.storageMode"
        class="text-2xs font-bold uppercase tracking-wider px-1 py-0.5 rounded shrink-0"
        :class="modeBadgeClasses"
      >
        {{ node.storageMode }}
      </span>

      <!-- Kind badge -->
      <span
        v-if="node?.kind && node.kind !== 'root'"
        class="text-2xs px-1 py-0.5 rounded shrink-0 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600"
      >
        {{ node.kind }}
      </span>

      <!-- Move up -->
      <button
        v-if="depth !== undefined && depth > 0"
        @click.stop="$emit('move-up', nodeId)"
        class="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all shrink-0"
        title="Move up"
      >
        <ChevronUp class="w-3 h-3" />
      </button>

      <!-- Move down -->
      <button
        v-if="depth !== undefined"
        @click.stop="$emit('move-down', nodeId)"
        class="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all shrink-0"
        title="Move down"
      >
        <ChevronDown class="w-3 h-3" />
      </button>
    </div>

    <!-- Children (recursive) -->
    <div v-if="hasChildren && !isCollapsed" class="ml-3 pl-2 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
      <ConceptTreeNode
        v-for="child in children"
        :key="child.id"
        :node-id="child.id"
        :selected-id="selectedId"
        :depth="(depth ?? 0) + 1"
        :expanded-generation="expandedGeneration"
        @select="(id: string) => $emit('select', id)"
        @move-up="(id: string) => $emit('move-up', id)"
        @move-down="(id: string) => $emit('move-down', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { useModelStore } from '../../stores/modelStore';
import IconRenderer from '../editor/IconRenderer.vue';
import type { ModelNode } from '../../model/types';

const props = withDefaults(defineProps<{
  nodeId: string;
  selectedId: string | null;
  depth?: number;
  expandedGeneration?: number;
}>(), {
  depth: 0,
  expandedGeneration: undefined,
});

const emit = defineEmits<{
  select: [nodeId: string];
  'move-up': [nodeId: string];
  'move-down': [nodeId: string];
}>();

const modelStore = useModelStore();
const isCollapsed = ref(false);

// Follow expandedGeneration signals from parent
watch(() => props.expandedGeneration, (gen) => {
  if (gen !== undefined) {
    isCollapsed.value = gen < 0;
  }
}, { immediate: true });

const node = computed<ModelNode | undefined>(() => modelStore.getNode(props.nodeId));

const children = computed<ModelNode[]>(() => {
  return modelStore.getChildren(props.nodeId);
});

const hasChildren = computed(() => children.value.length > 0);

const isSelected = computed(() => props.nodeId === props.selectedId);

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value;
}

function onSelect(): void {
  emit('select', props.nodeId);
}

// ── Dynamic classes ─────────────────────────────────────────────

const rowClasses = computed(() => {
  if (isSelected.value) {
    return 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-semibold border border-primary/30';
  }
  return 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent';
});

const nameClasses = computed(() => {
  if (isSelected.value) {
    return 'text-primary dark:text-primary-foreground';
  }
  return 'text-slate-700 dark:text-slate-300';
});

const modeBadgeClasses = computed(() => {
  if (node.value?.storageMode === 'FOLDER') {
    return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }
  return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
});
</script>
