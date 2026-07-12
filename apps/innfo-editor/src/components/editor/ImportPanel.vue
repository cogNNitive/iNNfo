<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm"
        >
          <FileDown class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">Import Documents</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Transform documents into iNNfo models using an AI agent
          </p>
        </div>
      </div>

      <!-- No workspace handle -->
      <div
        v-if="!hasHandle"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Open a model to see import options
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Create or open a workspace first, then come back here to import documents from
              <code class="text-2xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded"
                >traNNsform/input/</code
              >.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-else-if="loading"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
      >
        <div class="flex items-center gap-2">
          <Loader class="w-4 h-4 text-blue-500 animate-spin" />
          <p class="text-sm text-slate-500 dark:text-slate-400">Scanning traNNsform/input/...</p>
        </div>
      </div>

      <!-- Directory not available -->
      <div
        v-else-if="dirError"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              traNNsform directory not available
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              The
              <code class="text-2xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded"
                >traNNsform/</code
              >
              folder was not found in your workspace. Create a new workspace or re-init to set it
              up.
            </p>
          </div>
        </div>
      </div>

      <!-- Input directory content -->
      <template v-else>
        <!-- File list -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700"
          >
            <h2
              class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"
            >
              <FileOutput class="w-4 h-4 text-blue-500" />
              traNNsform/input/
              <span
                class="text-2xs font-medium text-slate-400 dark:text-slate-500 normal-case tracking-normal"
              >
                {{ files.length }} {{ files.length === 1 ? 'file' : 'files' }}
              </span>
            </h2>
            <button
              @click="scanInputDir"
              :disabled="refreshing"
              class="inline-flex items-center gap-1 text-2xs font-medium px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': refreshing }" />
              Refresh
            </button>
          </div>

          <div v-if="files.length === 0" class="p-6 text-center">
            <p class="text-sm text-slate-400 dark:text-slate-500">No files found in input/</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Place documents in the
              <code class="text-2xs bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono"
                >traNNsform/input/</code
              >
              folder, then click Refresh.
            </p>
          </div>

          <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800">
            <li
              v-for="file in files"
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
                {{ formatSize(file.size) }}
              </span>
              <span class="text-2xs text-slate-400 dark:text-slate-500 shrink-0">
                {{ formatDate(file.lastModified) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Agent prompt -->
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <div
            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-b border-slate-200 dark:border-slate-700"
          >
            <Terminal class="w-4 h-4 text-blue-500" />
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >Agent Prompt</span
            >
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-950">
            <code
              class="block text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono"
              >{{ agentPrompt }}</code
            >
          </div>
          <div
            class="flex items-center justify-end gap-2 px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
          >
            <button
              @click="copyPrompt"
              class="inline-flex items-center gap-1.5 text-2xs font-medium px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              <Check v-if="copied" class="w-3 h-3" />
              <Copy v-else class="w-3 h-3" />
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  FileDown,
  FileOutput,
  FileText,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Loader,
  AlertTriangle,
} from 'lucide-vue-next'
import { useWorkspaceStore } from '../../stores/workspaceStore'

const workspaceStore = useWorkspaceStore()

const hasHandle = computed(() => workspaceStore.hasHandle && workspaceStore.handle !== null)

const loading = ref(true)
const refreshing = ref(false)
const dirError = ref(false)
const copied = ref(false)
const files = ref<Array<{ name: string; size: number; lastModified: number }>>([])

async function scanInputDir(): Promise<void> {
  const handle = workspaceStore.handle
  if (!handle) {
    loading.value = false
    dirError.value = true
    return
  }

  try {
    const transformDir = await handle.getDirectoryHandle('traNNsform')
    const inputDir = await transformDir.getDirectoryHandle('input')
    const detected: Array<{ name: string; size: number; lastModified: number }> = []

    for await (const [name, entry] of inputDir.entries()) {
      if (entry.kind === 'file') {
        const fileObj = await entry.getFile()
        detected.push({
          name,
          size: (fileObj as any).size ?? 0,
          lastModified: (fileObj as any).lastModified ?? 0,
        })
      }
    }

    // Sort by name for consistent display
    detected.sort((a, b) => a.name.localeCompare(b.name))
    files.value = detected
    dirError.value = false
  } catch {
    dirError.value = true
    files.value = []
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function refresh(): Promise<void> {
  refreshing.value = true
  await scanInputDir()
}

const fileListText = computed(() => {
  if (files.value.length === 0) return ''
  return files.value.map((f) => `  - ${f.name}`).join('\n')
})

const agentPrompt = computed(() => {
  let prompt = 'I need to import the documents listed below and transform them into iNNfo models.\n\nLoad the **innv0-trannsform** skill — it handles document ingestion, normalization, and conversion. Follow traNNsform/AGENT.md for the exact procedure.\n\nAfter the skill loads, verify the innfo-mcp MCP server is active (the skill includes this check). Then process each file from traNNsform/input/ and write the resulting iNNfo models into the appropriate location.'
  if (fileListText.value) {
    prompt += `\n\nFiles to import:\n${fileListText.value}`
  }
  return prompt
})

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function copyPrompt(): void {
  const text = agentPrompt.value
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
  scanInputDir()
})
</script>
