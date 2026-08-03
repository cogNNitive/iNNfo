<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  FileText,
  Sparkles,
  Check,
  HelpCircle,
} from 'lucide-vue-next'
import type { ValidationReport, ValidationCheck } from '../shared/validation-types'
import { useModelStore } from '../stores/modelStore'

const props = defineProps<{
  report: ValidationReport
}>()

const modelStore = useModelStore()

const logFeedback = ref('')
const aiPromptFeedback = ref('')
let logTimer: ReturnType<typeof setTimeout> | undefined
let aiTimer: ReturnType<typeof setTimeout> | undefined

// ── Root Node Metadata Extraction ────────────────────────────────

const rootNode = computed(() => {
  const rootId = modelStore.rootIds[0]
  return rootId ? modelStore.getNode(rootId) : null
})

const fileName = computed(() => {
  const path = rootNode.value?.source?.path ?? ''
  return path.split('/').pop()?.split('\\').pop() || path || '(unsaved)'
})

const filePath = computed(() => rootNode.value?.source?.path ?? '(unknown path)')

const modelName = computed(() => rootNode.value?.name ?? '(unknown model)')

const modelVersion = computed(() => {
  const node = rootNode.value
  return (node?.fields?.version?.value ?? node?.fields?.model_version?.value ?? '—') as string
})

const formatVersion = computed(() => {
  const node = rootNode.value
  return (node?.fields?.format_version?.value ??
    node?.fields?.spec_version?.value ??
    '0.1.0') as string
})

const templateName = computed(() => {
  const node = rootNode.value
  return (node?.fields?.template_name?.value ??
    (node?.fields?.parent_spec?.value as any)?.name ??
    '—') as string
})

const templateVersion = computed(() => {
  const node = rootNode.value
  return (node?.fields?.template_version?.value ??
    (node?.fields?.parent?.value as any)?.version ??
    '—') as string
})

// ── Checks & Categories ──────────────────────────────────────────

const categories = [
  { key: 'parser', label: 'Model Load & Parser' },
  { key: 'frontmatter', label: 'Frontmatter' },
  { key: 'body', label: 'Body Syntax' },
  { key: 'convention', label: 'Conventions' },
] as const

const collapsed = ref<Record<string, boolean>>({
  parser: false,
  frontmatter: false,
  body: false,
  convention: false,
})

function toggle(cat: string) {
  collapsed.value[cat] = !collapsed.value[cat]
}

const allChecks = computed(() => {
  const list = [...props.report.checks]

  // Add virtual parser checks
  if (modelStore.parseIssues.length === 0) {
    list.push({
      id: 'parser-load-ok',
      label: 'Model Structure & Load',
      description: 'No duplicates or structural parsing errors detected during model file load.',
      category: 'parser' as any,
      severity: 'info',
      passed: true,
    })
  } else {
    modelStore.parseIssues.forEach((issue, idx) => {
      list.push({
        id: `parser-issue-${idx}`,
        label: `Structure warning in ${issue.path.split('/').pop() || issue.path}`,
        description: issue.message,
        category: 'parser' as any,
        severity: 'warning',
        passed: false,
        message: issue.message,
      })
    })
  }

  return list
})

const checksByCategory = computed(() => {
  const grouped: Record<string, ValidationCheck[]> = {}
  for (const check of allChecks.value) {
    if (!grouped[check.category]) grouped[check.category] = []
    grouped[check.category].push(check)
  }
  return grouped
})

const passedCountByCategory = computed(() => {
  const counts: Record<string, number> = {}
  for (const check of allChecks.value) {
    if (check.passed) {
      counts[check.category] = (counts[check.category] || 0) + 1
    }
  }
  return counts
})

const categoriesWithIssues = computed(() => {
  const withIssues = new Set<string>()
  for (const check of allChecks.value) {
    if (!check.passed) withIssues.add(check.category)
  }
  return withIssues
})

const totalChecks = computed(() => allChecks.value.length)
const totalPassed = computed(() => allChecks.value.filter((c) => c.passed).length)
const totalErrors = computed(
  () => allChecks.value.filter((c) => !c.passed && c.severity === 'error').length,
)
const totalWarnings = computed(
  () => allChecks.value.filter((c) => !c.passed && c.severity === 'warning').length,
)

// ── Log Formatting ──────────────────────────────────────────────

function formatLog(): string {
  const lines: string[] = []
  const now = new Date()
  lines.push('VALIDATION REPORT')
  lines.push('='.repeat(60))
  lines.push(`Date:     ${now.toISOString().slice(0, 19).replace('T', ' ')}`)
  lines.push(`File:     ${fileName.value}`)
  lines.push(`Path:     ${filePath.value}`)
  lines.push(`Model:    ${modelName.value} (v${modelVersion.value})`)
  lines.push(`Spec:     iNNfo v${formatVersion.value}`)
  lines.push(`Template: ${templateName.value} (v${templateVersion.value})`)
  lines.push('')
  lines.push(
    `Summary: ${totalPassed.value}/${totalChecks.value} passed — ${totalErrors.value} error${totalErrors.value !== 1 ? 's' : ''}, ${totalWarnings.value} warning${totalWarnings.value !== 1 ? 's' : ''}`,
  )
  lines.push('')

  const grouped = checksByCategory.value
  for (const cat of categories) {
    const checks = grouped[cat.key]
    if (!checks || checks.length === 0) continue
    lines.push(`── ${cat.label} ──`)
    for (const check of checks) {
      const status = check.passed ? 'PASS' : check.severity === 'error' ? 'ERROR' : 'WARN'
      const icon = check.passed ? '[✓]' : check.severity === 'error' ? '[✗]' : '[!]'
      lines.push(`  ${icon} [${status}] ${check.label}`)
      if (check.description) lines.push(`       ${check.description}`)
      if (!check.passed && check.message) lines.push(`       > ${check.message}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function copyLog(): void {
  logFeedback.value = 'Log Copied!'
  clearTimeout(logTimer)
  logTimer = setTimeout(() => {
    logFeedback.value = ''
  }, 2500)

  const text = formatLog()
  copyToClipboard(text)
}

// ── AI Prompt Formatting ─────────────────────────────────────────

function formatAiPrompt(): string {
  const lines: string[] = []
  lines.push('# iNNfo Model Validation & Fix Request')
  lines.push('')
  lines.push('## Workspace Metadata')
  lines.push(`- **File Name:** \`${fileName.value}\``)
  lines.push(`- **File Path:** \`${filePath.value}\``)
  lines.push(`- **Model Name:** \`${modelName.value}\``)
  lines.push(`- **Model Version:** \`${modelVersion.value}\``)
  lines.push(`- **Format Version (spec_version):** \`${formatVersion.value}\``)
  lines.push(`- **Template:** \`${templateName.value}\` (v${templateVersion.value})`)
  lines.push(`- **Report Timestamp:** ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Validation Summary')
  lines.push(`- **Total Checks Executed:** ${totalChecks.value}`)
  lines.push(`- **Passed Checks:** ${totalPassed.value}`)
  lines.push(`- **Errors:** ${totalErrors.value}`)
  lines.push(`- **Warnings:** ${totalWarnings.value}`)
  lines.push('')

  const failedChecks = allChecks.value.filter((c) => !c.passed)
  if (failedChecks.length > 0) {
    lines.push('## Detected Defects & Warnings')
    lines.push('')
    failedChecks.forEach((check, i) => {
      const type = check.severity === 'error' ? 'ERROR ❌' : 'WARNING ⚠️'
      lines.push(`### ${i + 1}. [${type}] ${check.label} (Category: \`${check.category}\`)`)
      if (check.description) lines.push(`- **Description:** ${check.description}`)
      if (check.message) lines.push(`- **Details / Message:** \`${check.message}\``)
      lines.push('')
    })
  } else {
    lines.push('## Status')
    lines.push('No errors or warnings detected. Model is compliant with iNNfo specifications.')
    lines.push('')
  }

  lines.push('## AI Task & Instructions')
  lines.push(
    'Please analyze the workspace metadata and the detected defects above. Provide exact file updates or step-by-step code/frontmatter fixes to resolve all errors and warnings in this iNNfo Markdown model file, adhering strictly to the iNNfo format specification.',
  )

  return lines.join('\n')
}

function copyAiPrompt(): void {
  aiPromptFeedback.value = 'AI Prompt Copied!'
  clearTimeout(aiTimer)
  aiTimer = setTimeout(() => {
    aiPromptFeedback.value = ''
  }, 2500)

  const text = formatAiPrompt()
  copyToClipboard(text)
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}
</script>

<template>
  <div class="space-y-6 pt-2">
    <!-- ── Summary Bar & Actions ── -->
    <div
      class="rounded-xl border p-4 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      :class="{
        'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200':
          totalErrors === 0 && totalWarnings === 0,
        'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200':
          totalErrors === 0 && totalWarnings > 0,
        'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200':
          totalErrors > 0,
      }"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 backdrop-blur-xs">
          <CheckCircle2 v-if="totalErrors === 0 && totalWarnings === 0" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <AlertTriangle v-else-if="totalErrors === 0 && totalWarnings > 0" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <XCircle v-else class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 class="font-semibold text-sm leading-snug">
            Validation Summary:
            <span class="font-mono">{{ totalPassed }}/{{ totalChecks }}</span> passed
          </h4>
          <p class="text-xs opacity-90 mt-0.5">
            <template v-if="totalErrors === 0 && totalWarnings === 0">
              Model fully satisfies format specifications.
            </template>
            <template v-else>
              Found
              <span v-if="totalErrors" class="font-bold underline">{{ totalErrors }} error{{ totalErrors !== 1 ? 's' : '' }}</span>
              <template v-if="totalErrors && totalWarnings"> and </template>
              <span v-if="totalWarnings" class="font-bold underline">{{ totalWarnings }} warning{{ totalWarnings !== 1 ? 's' : '' }}</span>.
            </template>
          </p>
        </div>
      </div>

      <!-- Action Buttons (Copy Log & Copy Prompt for AI) -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
        <!-- Copy Log Button -->
        <button
          @click="copyLog"
          class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 flex-1 sm:flex-none"
          title="Copy raw validation report log to clipboard"
          data-testid="copy-log-button"
        >
          <template v-if="logFeedback">
            <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ logFeedback }}</span>
          </template>
          <template v-else>
            <FileText class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Copy Log</span>
          </template>
        </button>

        <!-- Copy Prompt for AI Button -->
        <button
          @click="copyAiPrompt"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-purple-300 dark:border-purple-700/60 bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 dark:hover:bg-purple-500 transition-all cursor-pointer shadow-xs active:scale-95 flex-1 sm:flex-none"
          title="Copy markdown prompt with workspace metadata & defects formatted for AI"
          data-testid="copy-ai-prompt-button"
        >
          <template v-if="aiPromptFeedback">
            <Check class="w-3.5 h-3.5 text-emerald-200" />
            <span class="font-bold text-emerald-100">{{ aiPromptFeedback }}</span>
          </template>
          <template v-else>
            <Sparkles class="w-3.5 h-3.5 text-purple-200" />
            <span>Copy Prompt for AI</span>
          </template>
        </button>
      </div>
    </div>

    <!-- ── Category Breakdown ── -->
    <div class="space-y-3">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
      >
        <!-- Category Header -->
        <button
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer select-none"
          :class="{
            'border-b border-slate-200 dark:border-slate-800': !collapsed[cat.key],
          }"
          @click="toggle(cat.key)"
        >
          <div class="flex items-center gap-2.5">
            <ChevronRight
              class="w-4 h-4 text-slate-400 dark:text-slate-505 transition-transform duration-200"
              :class="{ 'rotate-90': !collapsed[cat.key] }"
            />
            <span class="font-semibold text-sm text-slate-800 dark:text-slate-100">{{ cat.label }}</span>
            <span
              v-if="categoriesWithIssues.has(cat.key)"
              class="px-2 py-0.5 text-2xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
            >
              Issues found
            </span>
          </div>
          <span class="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
            {{ passedCountByCategory[cat.key] ?? 0 }}/{{ checksByCategory[cat.key]?.length ?? 0 }} passed
          </span>
        </button>

        <!-- Category Body -->
        <div v-if="!collapsed[cat.key]" class="p-3 space-y-2.5 bg-white dark:bg-slate-900">
          <div
            v-for="check in checksByCategory[cat.key] || []"
            :key="check.id"
            class="flex items-start gap-3 p-3 rounded-lg border text-xs transition-colors"
            :class="{
              'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300':
                check.passed,
              'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-800/50 text-amber-950 dark:text-amber-200':
                !check.passed && check.severity === 'warning',
              'bg-red-50/70 dark:bg-red-950/20 border-red-300/70 dark:border-red-800/50 text-red-950 dark:text-red-200':
                !check.passed && check.severity === 'error',
            }"
          >
            <div class="shrink-0 mt-0.5">
              <CheckCircle2 v-if="check.passed" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTriangle v-else-if="check.severity === 'warning'" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <XCircle v-else class="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{{ check.label }}</span>
              </div>
              <p v-if="check.description" class="text-slate-600 dark:text-slate-400 mt-0.5 text-xs leading-relaxed">
                {{ check.description }}
              </p>
              <div
                v-if="!check.passed && check.message"
                class="mt-2 p-2.5 rounded-md font-mono text-xs bg-slate-900 dark:bg-slate-950 text-red-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all"
              >
                {{ check.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Educational & Guide Panel ── -->
    <div
      class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3"
    >
      <div class="flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <HelpCircle class="w-4 h-4 text-primary" />
        <h4 class="font-semibold text-sm">How to understand iNNfo Models & Validation</h4>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        iNNfo models are defined using Markdown files with a YAML frontmatter. This validation
        report checks if your model conforms to the iNNfo format specifications:
      </p>
      <ul class="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-5">
        <li>
          <strong class="text-slate-800 dark:text-slate-200">Model Load & Parser:</strong> Ensures files are read correctly and elements have unique names. Duplicated elements in different files are flagged as warnings to prevent collision.
        </li>
        <li>
          <strong class="text-slate-800 dark:text-slate-200">Frontmatter:</strong> Checks basic metadata like <code>level</code>, <code>version</code>, and <code>parent_spec</code> links.
        </li>
        <li>
          <strong class="text-slate-800 dark:text-slate-200">Body Syntax:</strong> Validates elements and relationships against the declared template.
        </li>
        <li>
          <strong class="text-slate-800 dark:text-slate-200">Conventions:</strong> Checks naming conventions and clean file structure.
        </li>
      </ul>
      <div
        class="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed"
      >
        <strong>Tip:</strong> If a warning is displayed, your model will still load, but you should resolve it to avoid unexpected behaviors or naming collisions. If an error is shown, you must fix it, as it indicates a critical format violation. You can use <strong>Copy Prompt for AI</strong> to generate a complete contextual prompt to paste directly into an AI assistant.
      </div>
    </div>
  </div>
</template>
