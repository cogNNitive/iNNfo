<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-3xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <span class="text-white font-bold text-sm">EX</span>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">Export Navigator</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            HTML visualizers generated from your iNNfo models
          </p>
        </div>
      </div>

      <!-- Workflow explanation -->
      <div v-if="hasWorkspace" class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl p-5 space-y-3">
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Export Navigator shows HTML visualizers created by an <strong>AI agent</strong>
          using the <strong>traNNsform</strong> templates in this workspace.
        </p>
        <div class="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-2xs font-bold shrink-0 mt-0.5">1</div>
          <span>Open the <button @click="goToAiGuide" class="underline font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer">AI Guide</button> to set up your agent and learn the workflow.</span>
        </div>
        <div class="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-2xs font-bold shrink-0 mt-0.5">2</div>
          <span>Tell your agent: <code class="text-2xs bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded font-mono">{{ step2Prompt }}</code></span>
        </div>
        <div class="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-2xs font-bold shrink-0 mt-0.5">3</div>
          <span>After the agent finishes, refresh this view or switch tabs to see your export here.</span>
        </div>
        <p class="text-2xs text-slate-400 dark:text-slate-500 pt-1 border-t border-emerald-200/40 dark:border-emerald-800/20">
          Each export shows its source model version. If the model has changed, the export is marked <span class="text-amber-600 dark:text-amber-400 font-medium">outdated</span> — regenerate it with the same trigger phrase.
        </p>
      </div>

      <!-- No workspace -->
      <div v-if="!hasWorkspace" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
        <p class="text-sm text-slate-500 dark:text-slate-400">Open a workspace to browse exports.</p>
      </div>

      <!-- No traNNsform directory -->
      <div v-else-if="state === 'missing-transform'"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">No traNNsform directory</p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              The <code class="text-2xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">traNNsform/</code> directory
              is required for exports. Open the
              <button @click="goToAiGuide" class="underline font-medium hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer">AI Guide</button>
              to set up export templates.
            </p>
          </div>
        </div>
      </div>

      <!-- Empty outputs -->
      <div v-else-if="state === 'empty'"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">No exports found.</p>
        <button @click="goToAiGuide"
          class="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer">
          <FileOutput class="w-3.5 h-3.5" />
          Generate one via AI Guide
        </button>
      </div>

      <!-- Loading -->
      <div v-else-if="state === 'loading'"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-center gap-2">
        <Loader class="w-4 h-4 text-emerald-500 animate-spin" />
        <p class="text-xs text-slate-500 dark:text-slate-400">Scanning exports...</p>
      </div>

      <!-- Export list -->
      <div v-else class="space-y-3">
        <p v-if="exports.length === 1" class="text-xs text-slate-500 dark:text-slate-400">
          1 export file found
        </p>
        <p v-else class="text-xs text-slate-500 dark:text-slate-400">
          {{ exports.length }} export files found
        </p>

        <div v-for="xf in exports" :key="xf.name"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">

          <!-- Main row -->
          <div class="flex items-center gap-3 p-4">
            <FileOutput class="w-5 h-5 text-slate-400 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ xf.name }}</p>
              <p v-if="xf.meta" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Model: {{ xf.meta.modelName }} · Version: {{ xf.meta.modelVersion }}
              </p>
            </div>

            <!-- Status badge -->
            <span v-if="xf.status === 'current'"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              <Check class="w-3 h-3" />
              Current
            </span>
            <span v-else-if="xf.status === 'outdated'"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <AlertTriangle class="w-3 h-3" />
              Outdated
            </span>
            <span v-else-if="xf.status === 'unknown'"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              ?
            </span>
            <span v-else
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              No model
            </span>
          </div>

          <!-- Actions row -->
          <div class="flex items-center justify-end gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700">
            <button @click="openExport(xf)"
              class="inline-flex items-center gap-1.5 text-2xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <ExternalLink class="w-3 h-3" />
              Open
            </button>

            <button v-if="xf.status === 'outdated' || xf.status === 'unknown'" @click="regenerate(xf)"
              class="inline-flex items-center gap-1.5 text-2xs font-medium px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer">
              <RefreshCw class="w-3 h-3" />
              Regenerate via AI Guide
            </button>
          </div>

          <!-- Outdated banner -->
          <div v-if="xf.status === 'outdated' && xf.meta"
            class="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200/60 dark:border-amber-800/30 text-2xs text-amber-700 dark:text-amber-400">
            This export was generated from <strong>{{ xf.meta.modelVersion }}</strong>.
            The current model version is <strong>{{ currentModelVersion }}</strong>.
            Regenerate it to include the latest changes.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import { innfoPrompt } from '../../ai-guide/prompt'
import { parseFormatFilename, formatVersionString } from '../../utils/version'
import type { DirectoryHandleLike, FileHandleLike } from '../../model/fs-types'
import { FileOutput, ExternalLink, RefreshCw, AlertTriangle, Loader, Check } from 'lucide-vue-next'

interface ExportMeta {
  modelName: string
  modelVersion: string
  templateName: string
  exportedAt: string
}

interface ExportFile {
  name: string
  handle: FileHandleLike
  meta: ExportMeta | null
  status: 'current' | 'outdated' | 'unknown' | 'no-model'
}

type ViewState = 'loading' | 'empty' | 'missing-transform' | 'no-workspace' | 'ready'

const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()
const uiStore = useUiStore()

const hasWorkspace = computed(() => workspaceStore.hasHandle)
const state = ref<ViewState>('loading')
const exports = ref<ExportFile[]>([])

const modelFilename = computed(() => {
  const rootId = modelStore.rootIds[0]
  if (!rootId) return 'your model'
  const rootNode = modelStore.getNode(rootId)
  const path = rootNode?.source?.path
  return path?.split(/[/\\]/).pop() ?? 'your model'
})

const step2Prompt = computed(() => {
  return innfoPrompt(`I need to generate an HTML visualizer for ${modelFilename.value}. Load the innv0-innfo skill — it handles model operations and visualizer generation. Follow traNNsform/AGENT.md for the export procedure.`)
})

const currentModelVersion = computed(() => {
  const rootId = modelStore.rootIds[0]
  if (!rootId) return null
  const rootNode = modelStore.getNode(rootId)
  if (!rootNode?.source?.path) return null
  const parsed = parseFormatFilename(rootNode.source.path)
  return parsed ? formatVersionString(parsed.version) : null
})

function getExportStatus(meta: ExportMeta | null, currentVer: string | null): ExportFile['status'] {
  if (!currentVer) return 'no-model'
  if (!meta) return 'unknown'
  return meta.modelVersion === currentVer ? 'current' : 'outdated'
}

async function scanExports(): Promise<void> {
  if (!workspaceStore.handle) {
    state.value = 'no-workspace'
    return
  }

  try {
    const transformDir = await workspaceStore.handle.getDirectoryHandle('traNNsform')
    let outputsDir: DirectoryHandleLike
    try {
      outputsDir = await transformDir.getDirectoryHandle('output')
    } catch {
      state.value = 'empty'
      return
    }

    state.value = 'loading'
    const results: ExportFile[] = []

    for await (const [name, entry] of outputsDir.entries()) {
      if (entry.kind !== 'file') continue
      if (!name.endsWith('.html')) continue

      const file = await (entry as any).getFile()
      const text = await file.text()
      const meta = extractMeta(text)
      const status = getExportStatus(meta, currentModelVersion.value)

      results.push({ name, handle: entry as any, meta, status })
    }

    results.sort((a, b) => a.name.localeCompare(b.name))
    exports.value = results
    state.value = results.length === 0 ? 'empty' : 'ready'
  } catch {
    state.value = 'missing-transform'
  }
}

function extractMeta(text: string): ExportMeta | null {
  try {
    const match = text.match(/<script id="export-meta"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/)
    if (!match) return null
    return JSON.parse(match[1]) as ExportMeta
  } catch {
    return null
  }
}

async function openExport(xf: ExportFile): Promise<void> {
  const file = await xf.handle.getFile()
  const text = await file.text()
  const blob = new Blob([text], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function regenerate(_xf: ExportFile): void {
  uiStore.setActiveView('ai-guide')
}

function goToAiGuide(): void {
  uiStore.setActiveView('ai-guide')
}

onMounted(() => {
  scanExports()
})
</script>
