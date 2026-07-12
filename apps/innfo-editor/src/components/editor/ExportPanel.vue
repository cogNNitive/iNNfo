<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm"
        >
          <FileUp class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">Export Model</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Generate an HTML visualizer for your model using an AI agent
          </p>
        </div>
      </div>

      <!-- No models available -->
      <div
        v-if="models.length === 0"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              No models to export
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Open a model in the editor first, then come back here to generate an export.
            </p>
          </div>
        </div>
      </div>

      <!-- Export content -->
      <template v-else>
        <!-- Model selector -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
        >
          <label
            class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2"
          >
            Select Model
          </label>
          <select
            v-model="selectedModelId"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ displayName(model) }}
            </option>
          </select>
        </div>

        <!-- Agent prompt -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <div
            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-b border-slate-200 dark:border-slate-700"
          >
            <Terminal class="w-4 h-4 text-emerald-500" />
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >Agent Prompt</span
            >
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-950">
            <code
              class="block text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono"
              >{{ exportPrompt }}</code
            >
          </div>
          <div
            class="flex items-center justify-end gap-2 px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
          >
            <button
              @click="copyPrompt"
              class="inline-flex items-center gap-1.5 text-2xs font-medium px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              <Check v-if="copied" class="w-3 h-3" />
              <Copy v-else class="w-3 h-3" />
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Previous exports -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700"
          >
            <h2
              class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"
            >
              <FileOutput class="w-4 h-4 text-emerald-500" />
              traNNsform/output/
              <span
                v-if="outputFiles.length > 0"
                class="text-2xs font-medium text-slate-400 dark:text-slate-500 normal-case tracking-normal"
              >
                {{ outputFiles.length }} {{ outputFiles.length === 1 ? 'file' : 'files' }}
              </span>
            </h2>
            <button
              @click="scanOutputDir"
              :disabled="scanningOutput"
              class="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': scanningOutput }" />
              Refresh
            </button>
          </div>

          <div v-if="outputFiles.length === 0" class="p-6 text-center">
            <p class="text-sm text-slate-400 dark:text-slate-500">No previous exports found</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Generated visualizers will appear in
              <code class="text-2xs bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono"
                >traNNsform/output/</code
              >
            </p>
          </div>

          <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800">
            <li
              v-for="file in outputFiles"
              :key="file.name"
              class="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              <FileText class="w-4 h-4 text-slate-400 shrink-0" />
              <span
                class="font-mono text-xs text-slate-700 dark:text-slate-300 flex-1 min-w-0 truncate"
              >
                {{ file.name }}
              </span>
              <span class="text-2xs text-slate-400 dark:text-slate-500 shrink-0">
                {{ formatDate(file.lastModified) }}
              </span>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  FileUp,
  FileOutput,
  FileText,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
} from 'lucide-vue-next'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useModelStore } from '../../stores/modelStore'
import { innfoPrompt } from '../../ai-guide/prompt'
import type { ModelNode } from '../../model/types'

const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()

const selectedModelId = ref<string | null>(null)
const copied = ref(false)
const scanningOutput = ref(false)
const outputFiles = ref<Array<{ name: string; lastModified: number }>>([])

interface ModelOption {
  id: string
  node: ModelNode
}

const models = computed<ModelOption[]>(() => {
  return modelStore.rootIds
    .filter((id) => !id.startsWith('spec:'))
    .map((id) => {
      const node = modelStore.getNode(id)
      return node ? { id, node } : null
    })
    .filter((m): m is ModelOption => m !== null)
})

const selectedModel = computed(() => {
  if (!selectedModelId.value) return null
  return modelStore.getNode(selectedModelId.value)
})

function displayName(model: ModelOption): string {
  const path = model.node.source?.path ?? ''
  return path.split(/[/\\]/).pop() || model.node.name || model.id
}

const modelFilename = computed(() => {
  if (!selectedModel.value) return ''
  const path = selectedModel.value.source?.path ?? ''
  return path.split(/[/\\]/).pop() || selectedModel.value.name || ''
})

const modelSourcePath = computed(() => {
  if (!selectedModel.value) return ''
  return selectedModel.value.source?.path ?? ''
})

const exportPrompt = computed(() => {
  const path = modelSourcePath.value || modelFilename.value || 'selected model'
  return innfoPrompt(`I need to generate an HTML visualizer for the model at "${path}".

Open traNNsform/workflows/export.workflow.md and follow the export pipeline step by step.`)
})

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

async function scanOutputDir(): Promise<void> {
  const handle = workspaceStore.handle
  if (!handle) {
    outputFiles.value = []
    scanningOutput.value = false
    return
  }

  try {
    const transformDir = await handle.getDirectoryHandle('traNNsform')
    const outputDir = await transformDir.getDirectoryHandle('output')
    const detected: Array<{ name: string; lastModified: number }> = []

    for await (const [name, entry] of outputDir.entries()) {
      if (entry.kind === 'file') {
        const fileObj = await entry.getFile()
        detected.push({
          name,
          lastModified: (fileObj as any).lastModified ?? 0,
        })
      }
    }

    detected.sort((a, b) => a.name.localeCompare(b.name))
    outputFiles.value = detected
  } catch {
    outputFiles.value = []
  } finally {
    scanningOutput.value = false
  }
}

function copyPrompt(): void {
  const text = exportPrompt.value
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  // Auto-select first model if only one
  if (models.value.length === 1) {
    selectedModelId.value = models.value[0].id
  } else if (models.value.length > 0) {
    selectedModelId.value = models.value[0].id
  }
  scanOutputDir()
})
</script>
