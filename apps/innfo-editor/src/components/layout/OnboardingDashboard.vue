<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import { useMetamodelStore } from '../../stores/metamodelStore'
import { Sparkles, Layout, Info, ArrowRight } from 'lucide-vue-next'
import { getHexColor, getHexColorLight } from '../../composables/useConceptVisuals'
import IconRenderer from '../editor/IconRenderer.vue'

const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()
const uiStore = useUiStore()
const metamodelStore = useMetamodelStore()

const modelTitle = computed(() => {
  const rootId = modelStore.rootIds[0]
  if (!rootId) return 'Untitled Model'
  const rootNode = modelStore.getNode(rootId)
  return rootNode?.fields?.title?.value || rootNode?.name || 'iNNfo Model'
})

const concepts = computed(() => metamodelStore.concepts)

const conceptCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const node of Object.values(modelStore.nodes)) {
    if (node.type && node.kind === 'element') {
      counts[node.type] = (counts[node.type] || 0) + 1
    }
  }
  return counts
})

function selectConcept(conceptName: string): void {
  const rootId = modelStore.rootIds[0] || 'Root'
  const virtualId = `virtual:${rootId}:${conceptName}`
  uiStore.selectNode(virtualId)
}

function selectAIGuide(): void {
  uiStore.setActiveAiTab('guide')
  uiStore.setShowAiModal(true)
}
</script>

<template>
  <div class="flex-1 p-6 md:p-10 max-w-5xl mx-auto space-y-10">
    <!-- Header -->
    <div class="text-center space-y-3">
      <div class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/30">
        ✨ Model loaded successfully!
      </div>
      <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 font-sans tracking-tight">
        {{ modelTitle }}
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
        Your model is ready to be modified. You can edit its content through two complementary paths.
      </p>
    </div>

    <!-- Onboarding choices -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Option A: AI Agent -->
      <div class="group bg-gradient-to-br from-purple-500/5 to-violet-500/5 hover:from-purple-500/10 hover:to-violet-500/10 dark:from-purple-950/15 dark:to-violet-950/15 border border-purple-200/60 dark:border-purple-800/30 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles class="w-6 h-6 text-white" />
          </div>
          <div class="space-y-2">
            <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Option A: Edit using an AI Agent
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              The model is stored as a structured Markdown text file. You can use conversational CLI/TUI agents (like <span class="font-mono text-purple-600 dark:text-purple-400">anti-gravity</span> or <span class="font-mono text-purple-600 dark:text-purple-400">Claude Code</span>) to modify it using natural language.
            </p>
          </div>
        </div>
        <div>
          <button
            @click="selectAIGuide"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/10 hover:shadow-lg transition-all cursor-pointer"
          >
            View AI guide
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Option B: Visual UI -->
      <div class="group bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 dark:from-blue-950/15 dark:to-cyan-950/15 border border-blue-200/60 dark:border-blue-800/30 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Layout class="w-6 h-6 text-white" />
          </div>
          <div class="space-y-2">
            <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans">
              Option B: cogNNitive Visual Editor
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Explore and visually edit the concepts, matrices, and relationships of your model from this very screen. You can click any node in the left sidebar to access its structured editing view in real-time.
            </p>
          </div>
        </div>
        <div class="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 flex gap-2.5 items-start">
          <Info class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p class="text-2xs text-blue-800 dark:text-blue-300 leading-relaxed font-sans">
            <strong>Quick tip:</strong> Click any of the concepts in the list below to go directly to its editing sheet.
          </p>
        </div>
      </div>
    </div>

    <!-- Concept Cards Grid -->
    <div class="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
          Model Structure
        </h3>
        <span class="text-2xs text-slate-500 dark:text-slate-400 font-sans">
          {{ concepts.length }} concepts defined by the template
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="concept in concepts"
          :key="concept.name"
          @click="selectConcept(concept.name)"
          class="group/card flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/card:scale-105"
              :style="{ backgroundColor: getHexColorLight(getHexColor(concept.color)) }"
            >
              <IconRenderer
                :icon="concept.icon"
                fallback="folder"
                :style="{ color: getHexColor(concept.color), width: '16px', height: '16px' }"
              />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/card:text-slate-900 dark:group-hover/card:text-slate-50 truncate transition-colors font-sans">
                {{ concept.name }}
              </p>
              <p class="text-2xs text-slate-500 dark:text-slate-400 truncate font-sans">
                {{ concept.type }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-2xs px-2 py-0.5 rounded-full font-medium tabular-nums font-sans"
              :style="{
                backgroundColor: getHexColor(concept.color) + '12',
                color: getHexColor(concept.color)
              }"
            >
              {{ conceptCounts[concept.name] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
