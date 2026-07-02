<template>
  <aside
    class="relative border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col overflow-y-auto shrink-0"
    :style="{ width: width + 'px' }"
  >
    <!-- Resize handle (right edge) -->
    <div
      @pointerdown="startResize"
      class="absolute top-0 right-0 z-30 h-full w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors"
      title="Drag to resize"
    ></div>

    <div class="px-3 py-4 space-y-4">
      <!-- Graph View button -->
      <button
        class="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all text-left cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent"
        @click="uiStore.setActiveView('graph')"
      >
        <LayoutDashboard class="w-4 h-4" />
        <span>Graph View</span>
      </button>

      <!-- Header with expand/collapse all -->
      <div class="flex items-center justify-between px-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Model</h2>
        <div class="flex items-center gap-2">
          <button
            @click="expandAll"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-2xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center"
            title="Expand All"
          >
            <ChevronsDown class="w-3.5 h-3.5" />
          </button>
          <button
            @click="collapseAll"
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-2xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center"
            title="Collapse All"
          >
            <ChevronsUp class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Model tree -->
      <div class="space-y-0.5">
        <ConceptTreeNode
          v-for="root in roots"
          :key="root.id"
          :node-id="root.id"
          :selected-id="selectedId"
          :depth="0"
          :expanded-generation="expandedGeneration"
          @select="(id: string) => $emit('select-node', id)"
          @move-up="(id: string) => $emit('move-up', id)"
          @move-down="(id: string) => $emit('move-down', id)"
        />

        <p v-if="roots.length === 0" class="px-2 py-4 text-xs text-slate-400 dark:text-slate-500 italic text-center">
          No nodes loaded
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronsDown, ChevronsUp, LayoutDashboard } from 'lucide-vue-next';
import { useModelStore } from '../../stores/modelStore';
import { useUiStore } from '../../stores/uiStore';
import { useResizablePanel } from '../../composables/useResizablePanel';
import ConceptTreeNode from './ConceptTreeNode.vue';

defineEmits<{
  'select-node': [nodeId: string];
  'move-up': [nodeId: string];
  'move-down': [nodeId: string];
}>();

const modelStore = useModelStore();
const uiStore = useUiStore();

const { width, startResize } = useResizablePanel({
  storageKey: 'format.leftSidebarWidth',
  defaultWidth: 384,
  minWidth: 240,
  maxWidth: 640,
  side: 'right',
});

const roots = computed(() => modelStore.getRoots());

// Expand/collapse all via generation counter
const expandedGeneration = ref(-1);

function expandAll(): void {
  expandedGeneration.value = Math.max(0, expandedGeneration.value) + 1;
}

function collapseAll(): void {
  expandedGeneration.value = Math.min(-1, expandedGeneration.value) - 1;
}

// Selected node for highlighting — driven by uiStore in Phase 6
const selectedId = computed(() => uiStore.selectedNodeId);
</script>
