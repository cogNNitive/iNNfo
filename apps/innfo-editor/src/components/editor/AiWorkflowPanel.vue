<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xs">
          <Sparkles class="w-4 h-4 text-white" />
        </div>
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">AI Workflow</h2>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-slate-200 dark:border-slate-700 px-6 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        class="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer -mb-px"
        :class="
          uiStore.activeAiTab === tab.id
            ? 'border-purple-500 text-purple-700 dark:text-purple-300'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
        "
      >
        <component :is="tab.icon" class="w-3.5 h-3.5" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <AIGuidePanel v-if="uiStore.activeAiTab === 'guide'" />
      <ImportPanel v-else-if="uiStore.activeAiTab === 'import'" />
      <ExportPanel v-else-if="uiStore.activeAiTab === 'export'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, BookOpen, FileDown, FileUp } from 'lucide-vue-next'
import { useUiStore, type AiTab } from '../../stores/uiStore'
import AIGuidePanel from './AIGuidePanel.vue'
import ImportPanel from './ImportPanel.vue'
import ExportPanel from './ExportPanel.vue'

const uiStore = useUiStore()

const tabs = computed<Array<{ id: AiTab; label: string; icon: any }>>(() => [
  { id: 'guide', label: 'Guide', icon: BookOpen },
  { id: 'import', label: 'Import', icon: FileDown },
  { id: 'export', label: 'Export', icon: FileUp },
])

function switchTab(tab: AiTab): void {
  uiStore.setActiveAiTab(tab)
}
</script>
