<template>
  <div
    class="relative flex shrink-0"
    :class="[isCollapsed ? 'w-0 transition-all duration-300 ease-in-out' : '']"
    :style="isCollapsed ? {} : { width: width + 'px' }"
  >
    <!-- Resize handle (left edge) -->
    <div
      v-if="!isCollapsed"
      @pointerdown="startResize"
      class="absolute top-0 left-0 z-30 h-full w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors"
      title="Drag to resize"
    ></div>

    <!-- Collapse Button Trigger when Collapsed -->
    <button
      v-if="isCollapsed"
      @click="isCollapsed = false"
      class="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary transition-all duration-200 cursor-pointer hover:scale-105"
      title="Show Guidance Panel"
    >
      <BookOpen class="w-4 h-4" />
    </button>

    <!-- Sidebar Container -->
    <aside
      :class="[
        isCollapsed ? 'w-0 opacity-0 border-l-0 p-0 pointer-events-none' : 'w-full opacity-100 border-l border-slate-200 dark:border-slate-700 p-6',
        'bg-slate-50 dark:bg-slate-900/40 flex flex-col overflow-y-auto shrink-0 transition-all duration-300 ease-in-out relative h-full'
      ]"
    >
      <!-- Collapse Button Inside Sidebar (top right when open) -->
      <button
        v-if="!isCollapsed"
        @click="isCollapsed = true"
        class="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        title="Hide Guidance Panel"
      >
        <ChevronRight class="w-4 h-4" />
      </button>

      <!-- Guidance Content -->
      <div class="space-y-6 mt-8">
        <!-- Title -->
        <div>
          <div class="flex items-center gap-2">
            <IconRenderer icon="info" fallback="info" custom-class="w-6 h-6 text-primary shrink-0" />
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              {{ conceptName || 'No concept' }} Guidance
            </h2>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Methodology and instructions to fill this section.</p>
        </div>

        <!-- Summary -->
        <div class="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-primary font-medium leading-relaxed">
          Phase 2 guidance placeholder. Full metamodel-driven guidance will be wired in Phase 6.
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Methodology Description</h3>
          <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Select a concept node in the model tree to see its guidance content here.
            The guidance panel reads from the resolved metamodel documentation.
          </div>
        </div>
      </div>

      <!-- Fallback -->
      <div v-if="!conceptName" class="text-slate-400 dark:text-slate-500 text-xs italic text-center my-auto">
        Select a node to view guidance.
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronRight, BookOpen } from 'lucide-vue-next';
import IconRenderer from '../editor/IconRenderer.vue';
import { useResizablePanel } from '../../composables/useResizablePanel';

defineProps<{
  conceptName?: string | null;
}>();

const isCollapsed = ref(false);

const { width, startResize } = useResizablePanel({
  storageKey: 'format.rightSidebarWidth',
  defaultWidth: 320,
  minWidth: 240,
  maxWidth: 640,
  side: 'left',
});
</script>
