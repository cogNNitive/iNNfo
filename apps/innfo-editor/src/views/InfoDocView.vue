<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { normalizeSingleModel } from '@cognnitive/innfo-core'
import { useModelStore } from '../stores/modelStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { resolveParentSpecs } from '../services/SpecResolverService'
import { useUrlDocLoader } from '../composables/useUrlDocLoader'
import { SAMPLE_BASE } from '../config/samples'
import { Play, Layout, ExternalLink, FileText, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const modelStore = useModelStore()
const workspace = useWorkspaceStore()

const busy = ref(false)
const error = ref<string | null>(null)
const dragOver = ref(false)
const urlInput = ref('')
const urlBusy = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const targetMode = ref<'workspace' | 'standalone'>('workspace')

interface SampleOption {
  name: string
  template: string
  description: string
  url: string
  supportsStandalone?: boolean
}

const sampleModels: SampleOption[] = [
  {
    name: 'Code Review Process',
    template: 'procedures',
    description: 'Hierarchical workflow with FSM step sequence, RACI matrix, and tools.',
    url: `${SAMPLE_BASE}/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md`,
    supportsStandalone: true,
  },
  {
    name: 'Ghostbusters',
    template: 'business',
    description: 'Fictional ghost-catching franchise business model with SWOT & risks.',
    url: `${SAMPLE_BASE}/business/samples/Ghostbusters_V_0-1-2_business_NN.md`,
  },
  {
    name: 'Engineering Team',
    template: 'organization',
    description: 'Organizational chart: reporting lines, roles, and skills matrix.',
    url: `${SAMPLE_BASE}/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md`,
  },
]

async function loadFile(file: File): Promise<void> {
  error.value = null
  busy.value = true
  try {
    const content = await file.text()
    const rootId = file.name.replace(/\.md$/i, '')

    if (targetMode.value === 'standalone' && file.name.includes('procedures')) {
      // Navigate to standalone procedure view
      router.push({ name: 'view-procedure' })
      return
    }

    workspace.reset()
    workspace.isSampleSession = false

    const { nodes } = normalizeSingleModel(content, file.name, rootId)

    await resolveParentSpecs(nodes, [rootId])
    modelStore.setGraph(nodes, [rootId])

    workspace.hasParsed = true
    workspace.parseCount += 1
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

function onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  loadFile(file)
  input.value = ''
}

function onDrop(event: DragEvent): void {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}

async function loadFromUrl(overrideUrl?: string, mode?: 'workspace' | 'standalone'): Promise<void> {
  error.value = null
  const url = (overrideUrl || urlInput.value).trim()
  const effectiveMode = mode || targetMode.value

  if (!url) {
    error.value = 'Please enter a valid URL.'
    return
  }
  try {
    new URL(url)
  } catch {
    error.value = 'Invalid URL format.'
    return
  }

  if (effectiveMode === 'standalone') {
    router.push({ name: 'view-procedure', query: { url } })
    return
  }

  urlBusy.value = true
  try {
    workspace.reset()
    workspace.isSampleSession = false

    const { loadIntoStore } = useUrlDocLoader()
    const result = await loadIntoStore(url)
    if (result.error) throw new Error(result.error)

    workspace.hasParsed = true
    workspace.parseCount += 1
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    urlBusy.value = false
  }
}

function openStandaloneSample(sample: SampleOption) {
  router.push({ name: 'view-procedure', query: { url: sample.url } })
}
</script>

<template>
  <div class="info-doc min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 flex flex-col items-center">
    <div class="max-w-2xl w-full space-y-6">
      <!-- Main Card -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-5">
        <div>
          <span class="px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-3 inline-block">
            cogNNitive &bull; iNNfo Document Hub
          </span>
          <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">
            Open iNNfo Model Document
          </h1>
          <p class="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Open your <code>_NN.md</code> document in the full <strong>Workspace Editor</strong> or launch it directly in the <strong>Standalone Procedure Viewer</strong>.
          </p>
        </div>

        <!-- Mode Toggle Selector -->
        <div class="flex items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl max-w-sm mx-auto">
          <button
            @click="targetMode = 'workspace'"
            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="targetMode === 'workspace' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            <Layout class="w-3.5 h-3.5 text-blue-500" />
            <span>Workspace Editor</span>
          </button>
          <button
            @click="targetMode = 'standalone'"
            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="targetMode === 'standalone' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            <Play class="w-3.5 h-3.5 text-emerald-500" />
            <span>Standalone Viewer</span>
          </button>
        </div>

        <!-- File Dropzone -->
        <div
          class="border-2 border-dashed border-purple-200 dark:border-purple-900/60 rounded-xl p-8 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500 transition-all cursor-pointer flex flex-col items-center gap-2 group"
          :class="{ 'border-purple-600 bg-purple-100/50': dragOver, 'opacity-50 pointer-events-none': busy }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
          @click="fileInputRef?.click()"
        >
          <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <span v-if="busy" class="text-xs font-bold text-slate-700 dark:text-slate-300">Loading document&hellip;</span>
            <span v-else class="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Drop your <code class="text-purple-600 dark:text-purple-400">_NN.md</code> file here
            </span>
            <span class="text-2xs text-slate-500 dark:text-slate-400">or click to browse your local filesystem</span>
          </div>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept=".md"
          class="hidden"
          @change="onFileSelected"
        />

        <p v-if="error" class="p-2.5 rounded-lg text-xs bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60" role="alert">
          {{ error }}
        </p>

        <!-- Divider -->
        <div class="flex items-center gap-3 text-2xs text-slate-400 uppercase font-bold tracking-wider">
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span>Or load from URL</span>
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <!-- URL Input Row -->
        <div class="flex gap-2">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://example.com/CodeReviewProcess_V_1-0-0_procedures_NN.md"
            class="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200"
            @keydown.enter="loadFromUrl()"
          />
          <button
            class="px-4 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            :disabled="urlBusy || !urlInput.trim()"
            @click="loadFromUrl()"
          >
            <span>{{ urlBusy ? 'Loading' : 'Load' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      <!-- Samples & Direct Quick Launch Cards -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Play class="w-4 h-4 text-purple-600" />
            <span>Sample Models &amp; Interactive Extension Viewers</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="sample in sampleModels"
            :key="sample.name"
            class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {{ sample.name }}
                </span>
                <span class="px-1.5 py-0.5 rounded text-3xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  {{ sample.template }}
                </span>
              </div>
              <p class="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ sample.description }}
              </p>
            </div>

            <div class="flex flex-col gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                @click="loadFromUrl(sample.url, 'workspace')"
                class="w-full py-1.5 px-2.5 rounded text-2xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Layout class="w-3 h-3 text-blue-500" />
                <span>Open in Workspace</span>
              </button>

              <button
                v-if="sample.supportsStandalone"
                @click="openStandaloneSample(sample)"
                class="w-full py-1.5 px-2.5 rounded text-2xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play class="w-3 h-3" />
                <span>Open Standalone Viewer</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
