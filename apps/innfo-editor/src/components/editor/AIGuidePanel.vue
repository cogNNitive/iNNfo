<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm"
        >
          <span class="text-white font-bold text-sm">AI</span>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">
            {{ title }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-center gap-2"
      >
        <Loader class="w-4 h-4 text-purple-500 animate-spin" />
        <p class="text-xs text-slate-500 dark:text-slate-400">Loading procedure...</p>
      </div>

      <!-- No workspace -->
      <div
        v-else-if="!hasWorkspace"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Open a model to see the AI guide
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              The AI guide is generated from the procedure model in your workspace. Create or open a
              workspace first.
            </p>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div
        v-else-if="notFound"
        class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Procedure model not found
            </p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              The file
              <code class="text-2xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded"
                >models/UseCogNNitiveWithAI_V_1-0-0_procedures_NN.md</code
              >
              was not found in your workspace. Create a new workspace or download it from
              <a
                :href="repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="underline font-medium hover:text-amber-800 dark:hover:text-amber-200"
              >
                the repository
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <!-- Workspace step -->
      <div
        v-else
        class="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/60 dark:border-purple-800/30 rounded-xl p-5"
      >
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          This guide is generated from
          <code
            class="text-2xs bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded font-mono"
          >
            models/UseCogNNitiveWithAI_V_1-0-0_procedures_NN.md
          </code>
          — the single source of truth for AI workflow instructions in this project.
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Workspace:
          <code class="text-2xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{{
            workspaceName
          }}</code>
        </p>
      </div>

      <!-- Tools (download links) -->
      <section v-if="tools.length > 0">
        <h2
          class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <Download class="w-4 h-4 text-purple-500" />
          Tools
        </h2>

        <div class="space-y-2">
          <a
            v-for="tool in tools"
            :key="tool.name"
            :href="tool.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all group"
          >
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0"
            >
              {{ tool.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
              >
                {{ tool.name }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ tool.description }}
              </p>
            </div>
            <ExternalLink
              class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors shrink-0"
            />
          </a>
        </div>
      </section>

      <!-- Work steps -->
      <section v-if="steps.length > 0">
        <h2
          class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <ListOrdered class="w-4 h-4 text-purple-500" />
          Steps
        </h2>

        <div class="space-y-2">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <!-- Header -->
            <div
              class="flex items-center gap-3 p-4 cursor-pointer select-none"
              @click="toggleStep(index)"
            >
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                :class="openStep === index
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
              >
                {{ index + 1 }}
              </div>

              <h3
                class="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                {{ step.title }}
              </h3>

              <ChevronDown
                class="w-4 h-4 text-slate-400 shrink-0 transition-transform"
                :class="openStep === index ? 'rotate-180' : ''"
              />
            </div>

            <!-- Body -->
            <div v-if="openStep === index" class="px-4 pb-4 pl-[3.25rem]">
              <div
                class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2"
                v-html="step.descriptionHtml"
              ></div>

              <!-- Copyable prompt -->
              <div
                v-if="step.prompt"
                class="mt-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
              >
                <div class="p-3">
                  <code
                    class="block text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap"
                    >{{ step.prompt }}</code
                  >
                </div>
                <div
                  class="flex items-center justify-end px-3 py-2 border-t border-slate-200 dark:border-slate-700"
                >
                  <button
                    @click="copyText(step.prompt)"
                    class="inline-flex items-center gap-1.5 text-2xs font-medium px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                  >
                    <Check v-if="copiedIndex === index" class="w-3 h-3" />
                    <Copy v-else class="w-3 h-3" />
                    {{ copiedIndex === index ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Roles matrix -->
      <section v-if="matrixHeaders.length > 0">
        <h2
          class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <Users class="w-4 h-4 text-purple-500" />
          Roles
        </h2>

        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
                <th
                  v-for="h in matrixHeaders"
                  :key="h"
                  class="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400"
                >
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, ri) in matrixRows"
                :key="ri"
                class="border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <td
                  v-for="(cell, ci) in row"
                  :key="ci"
                  class="px-4 py-2 text-slate-700 dark:text-slate-300"
                  :class="ci === 0 ? 'font-medium' : ''"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ExternalLink,
  Download,
  ListOrdered,
  Users,
  Copy,
  Check,
  ChevronDown,
  Loader,
  AlertTriangle,
} from 'lucide-vue-next'
import { useWorkspaceStore } from '../../stores/workspaceStore'

const workspaceStore = useWorkspaceStore()

const MODEL_PATH = 'models/UseCogNNitiveWithAI_V_1-0-0_procedures_NN.md'
const repoUrl =
  'https://github.com/innV0/cogNNitive/blob/main/models/UseCogNNitiveWithAI_V_1-0-0_procedures_NN.md'

const hasWorkspace = computed(() => workspaceStore.hasHandle)
const workspaceName = computed(() => workspaceStore.handle?.name ?? '')

interface ToolEntry {
  name: string
  initials: string
  description: string
  url: string
}

interface WorkStep {
  title: string
  descriptionHtml: string
  prompt: string | null
}

const loading = ref(true)
const notFound = ref(false)
const title = ref('Use cogNNitive with AI')
const subtitle = ref('Edit your iNNfo models using OpenCode')
const tools = ref<ToolEntry[]>([])
const steps = ref<WorkStep[]>([])
const matrixHeaders = ref<string[]>([])
const matrixRows = ref<string[][]>([])
const openStep = ref<number | null>(0)
const copiedIndex = ref<number | null>(null)

function parseModel(content: string): void {
  const lines = content.split('\n')
  let currentSection: string | null = null
  let currentTool: Partial<ToolEntry> | null = null
  let currentStep: Partial<WorkStep> | null = null
  let inYaml = false
  let yamlLines: string[] = []
  let descLines: string[] = []
  let inMatrix = false
  let matrixLines: string[] = []

  function flushStep(): void {
    if (currentStep?.title) {
      const desc = descLines.join('\n').trim()
      const prompt = extractPrompt(currentStep.title, desc, yamlLines)
      currentStep.descriptionHtml = desc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
      currentStep.prompt = prompt
      steps.value.push(currentStep as WorkStep)
    }
    currentStep = null
    yamlLines = []
    descLines = []
    inYaml = false
  }

  function extractPrompt(title: string, desc: string, yaml: string[]): string | null {
    const all = `${title} ${desc} ${yaml.join(' ')}`.toLowerCase()
    if (all.includes('edit model') || all.includes('configure mcp')) {
      return 'Load the innv0-innfo skill — I need to edit a model'
    }
    if (all.includes('import')) {
      return 'Load the innv0-trannsform skill — I need to import documents from traNNsform/input/ and convert them to iNNfo models'
    }
    if (all.includes('export') || all.includes('visualizer') || all.includes('visual')) {
      return 'Load the innv0-innfo skill — I need to generate an HTML visualizer for the current model following traNNsform/AGENT.md'
    }
    return null
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Matrix section
    if (line.startsWith('* _NN matrices:')) {
      flushStep()
      inMatrix = true
      matrixLines = []
      continue
    }

    if (inMatrix) {
      if (line.startsWith('|')) {
        matrixLines.push(line)
      } else if (line.trim() === '' && matrixLines.length > 0) {
        // End of matrix — but keep collecting during parsing
      } else if (!line.startsWith('|') && !line.startsWith(':---') && matrixLines.length > 0) {
        inMatrix = false
      }
      if (inMatrix) continue
    }

    // Tool section
    const toolMatch = line.match(/^\* _NN Tools: (.+)$/)
    if (toolMatch) {
      flushStep()
      currentSection = 'tools'
      currentTool = { name: toolMatch[1].trim() }
      continue
    }

    if (currentTool) {
      const urlMatch = line.match(/Download:\s*(.+)/)
      if (urlMatch) {
        currentTool.url = urlMatch[1].trim()
        currentTool.initials = (currentTool.name || '').split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        currentTool.description = line.replace(/Download:\s*\S+\s*/, '').trim() || currentTool.name || ''
        if (currentTool.name && currentTool.url) {
          tools.value.push(currentTool as ToolEntry)
        }
        currentTool = null
      }
      continue
    }

    // Role section
    if (line.startsWith('* _NN Roles:')) {
      flushStep()
      currentSection = 'roles'
      continue
    }

    // Work section
    const workMatch = line.match(/^\* _NN Work: (.+)$/)
    if (workMatch) {
      flushStep()
      currentSection = 'work'
      currentStep = { title: workMatch[1].trim(), descriptionHtml: '', prompt: null }
      continue
    }

    // YAML block
    if (currentStep) {
      if (line.trim() === '```yaml') {
        inYaml = true
        continue
      }
      if (inYaml && line.trim() === '```') {
        inYaml = false
        continue
      }
      if (inYaml) {
        yamlLines.push(line.trim())
        continue
      }

      // Description text
      if (line.startsWith('  ') && line.trim()) {
        descLines.push(line.trim())
      }
    }

    // Title/subtitle from frontmatter or first heading
    if (line.startsWith('# _NN index')) {
      currentSection = 'index'
    }
  }

  flushStep()

  // Parse matrix
  if (matrixLines.length > 0) {
    const headerLine = matrixLines.find((l) => l.startsWith('|') && !l.includes('---'))
    const separatorLine = matrixLines.find((l) => l.includes('---'))
    const dataLines = matrixLines.filter(
      (l) => l !== headerLine && l !== separatorLine && l.startsWith('|')
    )
    if (headerLine) {
      matrixHeaders.value = headerLine
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
    }
    matrixRows.value = dataLines.map((l) =>
      l
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
    )
  }
}

async function loadProcedure(): Promise<void> {
  const handle = workspaceStore.handle
  if (!handle) {
    loading.value = false
    return
  }

  try {
    const modelsDir = await handle.getDirectoryHandle('models')
    const fileHandle = await modelsDir.getFileHandle('UseCogNNitiveWithAI_V_1-0-0_procedures_NN.md')
    const file = await fileHandle.getFile()
    const text = await file.text()
    parseModel(text)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

function toggleStep(index: number): void {
  openStep.value = openStep.value === index ? null : index
}

function copyText(text: string): void {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

onMounted(() => {
  loadProcedure()
})
</script>
