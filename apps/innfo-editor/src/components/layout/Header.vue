<template>
  <header
    class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-6 py-3 shrink-0"
  >
    <!-- Left Section: Logo and Versions (Spec, Template, Model) -->
    <div class="flex items-center gap-4 flex-1 min-w-0 mr-4">
      <!-- Home Button -->
      <button
        @click="$emit('close-workspace')"
        class="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer mr-1 shrink-0"
        title="Close Workspace and return Home"
        data-testid="header-home-button"
      >
        <Home class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-2 shrink-0">
        <span class="font-mono text-lg font-black text-primary select-none leading-none">_NN</span>
        <h1 class="text-sm font-semibold tracking-tight">iNNfo Modeler</h1>
      </div>

      <!-- Versions Section (Now styled as unified gray badges with info icon trigger) -->
      <div
        v-if="hasRootNode"
        class="flex items-center gap-2 text-2xs text-slate-500 dark:text-slate-400 shrink-0 mr-auto"
      >
        <!-- Spec Badge -->
        <div
          class="font-mono bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1 select-none"
        >
          <span
            class="font-sans font-bold text-slate-400 dark:text-slate-505 text-3xs uppercase tracking-wider"
            >Spec</span
          >
          <span class="text-slate-750 dark:text-slate-250 text-2xs font-semibold">{{
            specFileName
          }}</span>
        </div>

        <!-- Template Badge -->
        <div
          class="font-mono bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1 select-none"
        >
          <span
            class="font-sans font-bold text-slate-400 dark:text-slate-505 text-3xs uppercase tracking-wider"
            >Template</span
          >
          <span class="text-slate-750 dark:text-slate-250 text-2xs font-semibold">{{
            fullTemplateName
          }}</span>
        </div>

        <!-- Model Badge -->
        <div
          class="font-mono bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1 select-none"
        >
          <span
            class="font-sans font-bold text-slate-400 dark:text-slate-505 text-3xs uppercase tracking-wider"
            >Model</span
          >
          <span class="text-slate-750 dark:text-slate-250 text-2xs font-semibold">{{
            modelFileName
          }}</span>
        </div>

        <!-- Reload from Disk Button -->
        <button
          @click="handleReload"
          :disabled="workspaceStore.isParsing"
          class="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :class="workspaceStore.isParsing ? 'text-primary bg-primary/5' : ''"
          :title="workspaceStore.isParsing ? 'Reloading…' : 'Reload model from disk'"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': workspaceStore.isParsing }" />
        </button>

        <!-- Details Info Trigger Button -->
        <button
          @click="uiStore.setActiveView('info')"
          class="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          :class="uiStore.activeView === 'info' ? 'text-primary bg-primary/5' : ''"
          title="View Model Info"
        >
          <Info class="w-4 h-4" />
        </button>

        <!-- Validation Status Badge/Link -->
        <button
          v-if="hasRootNode"
          @click="openValidationReport"
          class="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-bold transition-all cursor-pointer"
          :class="statusClass"
          :title="statusTitle"
        >
          <component :is="statusIcon" class="w-4 h-4" />
          <span v-if="statusText" class="font-mono text-2xs font-bold">{{ statusText }}</span>
        </button>
      </div>
    </div>

    <!-- Right Section Actions -->
    <div class="flex items-center gap-2.5 shrink-0">
      <!-- Use AI Button -->
      <button
        @click="uiStore.setActiveView('ai-guide')"
        class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all cursor-pointer"
        :class="
          uiStore.activeView === 'ai-guide'
            ? 'bg-purple-600 text-white ring-purple-500/30 hover:bg-purple-700'
            : 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 ring-purple-300 dark:ring-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-950/30'
        "
        title="Use AI to edit models"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>Use AI</span>
      </button>

      <!-- Save Button with integrated Saved status -->
      <div class="relative" ref="saveDropdownRef">
        <div class="relative inline-flex rounded-md shadow-xs">
          <button
            @click="handleSave"
            :disabled="!shouldShowSave"
            class="inline-flex items-center gap-1.5 rounded-l-md px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all cursor-pointer"
            :class="
              shouldShowSave
                ? 'bg-primary text-primary-foreground ring-primary/20 hover:bg-primary/90'
                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 cursor-default'
            "
          >
            <component :is="shouldShowSave ? Save : CheckCircle" class="w-3.5 h-3.5" />
            <span>{{ shouldShowSave ? 'Save' : 'Saved' }}</span>
          </button>
          <button
            @click="toggleSaveDropdown"
            class="inline-flex items-center rounded-r-md px-2 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all cursor-pointer border-l"
            :class="
              shouldShowSave
                ? 'bg-primary text-primary-foreground ring-primary/20 border-primary-foreground/10 hover:bg-primary/90'
                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 border-emerald-250 dark:border-emerald-850 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40'
            "
          >
            <ChevronDown class="w-3.5 h-3.5" />
          </button>

          <!-- Save Dropdown -->
          <div
            v-if="saveDropdownOpen"
            class="absolute right-0 top-full mt-1.5 w-72 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 py-2 z-50"
          >
            <div class="px-3 pt-1">
              <div class="flex items-center justify-between mb-1.5">
                <span
                  class="flex items-center gap-1 text-2xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider"
                >
                  Model Version
                </span>
                <span class="font-mono text-xs font-semibold text-primary">{{ modelVersion }}</span>
              </div>
              <p
                v-if="bumpError"
                class="text-2xs text-red-650 dark:text-red-400 mb-1.5 leading-tight"
              >
                {{ bumpError }}
              </p>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  v-for="lvl in ['major', 'minor', 'patch'] as const"
                  :key="lvl"
                  @click="bumpVersion(lvl)"
                  class="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1.5 text-2xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer capitalize"
                >
                  {{ lvl }}
                </button>
              </div>
              <p class="text-2xs text-slate-400 dark:text-slate-505 mt-1.5 leading-tight">
                Saves a new versioned file, keeping the current one.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- External links -->
      <div class="flex items-center gap-0.5 pl-1.5">
        <a
          href="https://format.innv0.com"
          target="_blank"
          rel="noopener noreferrer"
          class="px-2 py-1 rounded text-xs font-medium text-slate-400 dark:text-slate-505 hover:text-primary hover:bg-primary/5 transition-colors"
          >Web</a
        >
        <a
          href="https://format.innv0.com/documentation/"
          target="_blank"
          rel="noopener noreferrer"
          class="px-2 py-1 rounded text-xs font-medium text-slate-400 dark:text-slate-505 hover:text-primary hover:bg-primary/5 transition-colors"
          >Docs</a
        >
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Home,
  Save,
  ChevronDown,
  Info,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-vue-next'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import { useToast } from '../../shared/useToast'
import {
  DEFAULT_INNFO_VERSION,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_TEMPLATE_VERSION,
} from '../../utils/constants'

const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()
const uiStore = useUiStore()
const { show } = useToast()

const hasErrors = computed(() => (modelStore.validationReport?.summary.errors ?? 0) > 0)
const hasWarnings = computed(
  () =>
    (modelStore.validationReport?.summary.warnings ?? 0) > 0 || modelStore.parseIssues.length > 0,
)
const totalErrors = computed(() => modelStore.validationReport?.summary.errors ?? 0)
const totalWarnings = computed(
  () => (modelStore.validationReport?.summary.warnings ?? 0) + modelStore.parseIssues.length,
)

const statusClass = computed(() => {
  if (hasErrors.value) {
    return 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
  }
  if (hasWarnings.value) {
    return 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
  }
  return 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
})

const statusIcon = computed(() => {
  if (hasErrors.value) return XCircle
  if (hasWarnings.value) return AlertTriangle
  return CheckCircle
})

const statusText = computed(() => {
  if (hasErrors.value) return `${totalErrors.value}`
  if (hasWarnings.value) return `${totalWarnings.value}`
  return ''
})

const statusTitle = computed(() => {
  if (hasErrors.value) return 'Model is incorrect: click to view validation errors'
  if (hasWarnings.value) return 'Model loaded with warnings: click to view details'
  return 'Model is valid: click to view full report'
})

function openValidationReport(): void {
  uiStore.setActiveView('editor')
  uiStore.setShowValidationReport(true)
}

const saveDropdownOpen = ref(false)
const saveDropdownRef = ref<HTMLElement | null>(null)
const bumpError = ref('')

// ── Root node frontmatter extraction ────────────────────────────

const rootNode = computed(() => {
  const ids = modelStore.rootIds
  if (ids.length === 0) return null
  return modelStore.getNode(ids[0])
})

const hasRootNode = computed(() => rootNode.value !== null)

const filePath = computed(() => {
  const node = rootNode.value
  if (!node?.source?.path) return ''
  return node.source.path
})

const formatVersion = computed(() => {
  const node = rootNode.value
  return (node?.fields?.format_version?.value ??
    node?.fields?.spec_version?.value ??
    DEFAULT_INNFO_VERSION) as string
})

const templateName = computed(() => {
  const node = rootNode.value
  return (node?.fields?.template_name?.value ??
    (node?.fields?.parent_spec?.value as any)?.name ??
    (node?.fields?.parent?.value as any)?.name ??
    DEFAULT_TEMPLATE_NAME) as string
})

const templateVersion = computed(() => {
  const node = rootNode.value
  const tVal =
    node?.fields?.template_version?.value ??
    (node?.fields?.parent?.value as any)?.version ??
    DEFAULT_TEMPLATE_VERSION
  return ((node?.fields?.template?.value as any)?.version ?? tVal) as string
})

const fullTemplateName = computed(() => {
  const name = templateName.value || ''
  if (!name || name.toLowerCase() === 'template') {
    return templateVersion.value || DEFAULT_TEMPLATE_VERSION
  }
  const hasVersion = /_V_?\d+/i.test(name)
  if (hasVersion || !templateVersion.value) {
    return name
  }
  return `${name}_${templateVersion.value}`
})

const modelFileName = computed(() => {
  const path = filePath.value || ''
  if (!path) return 'model.md'
  return path.split('/').pop()?.split('\\').pop() || path
})

const specFileName = computed(() => {
  return `iNNfo_${formatVersion.value}_NN.md`
})

const modelVersion = computed(() => {
  const node = rootNode.value
  return (node?.fields?.version?.value ?? node?.fields?.model_version?.value ?? '—') as string
})

const unsavedChanges = computed(() => modelStore.dirtyIds.size > 0)
const shouldShowSave = computed(() => unsavedChanges.value || !workspaceStore.hasHandle)

// ── Save flow ───────────────────────────────────────────────────

async function handleSave(): Promise<void> {
  if (!hasRootNode.value) return
  if (!workspaceStore.hasHandle) {
    uiStore.setShowSaveWorkspaceModal(true)
    saveDropdownOpen.value = false
    return
  }
  try {
    await workspaceStore.saveActiveFile()
    saveDropdownOpen.value = false
  } catch (err) {
    bumpError.value = err instanceof Error ? err.message : 'Save failed'
  }
}

async function handleReload(): Promise<void> {
  if (workspaceStore.isParsing) return
  if (modelStore.dirtyIds.size > 0) {
    const ok = confirm(
      'Tenés cambios sin guardar. Al recargar desde el archivo se van a perder.\n¿Estás seguro?',
    )
    if (!ok) return
  }
  try {
    await workspaceStore.reloadWorkspace()
    show('Modelo recargado desde el archivo.', 'success')
  } catch (err) {
    show(err instanceof Error ? err.message : 'Error al recargar', 'error')
  }
}

async function bumpVersion(level: 'major' | 'minor' | 'patch'): Promise<void> {
  bumpError.value = ''
  if (!hasRootNode.value) return
  if (!workspaceStore.hasHandle) {
    uiStore.setShowSaveWorkspaceModal(true)
    saveDropdownOpen.value = false
    return
  }
  try {
    await workspaceStore.saveActiveFileWithVersionBump(level)
    saveDropdownOpen.value = false
  } catch (err) {
    bumpError.value = err instanceof Error ? err.message : 'Version bump failed'
  }
}

// ── Dropdown ────────────────────────────────────────────────────

function toggleSaveDropdown(): void {
  bumpError.value = ''
  saveDropdownOpen.value = !saveDropdownOpen.value
}

function closeDropdown(e: MouseEvent): void {
  if (saveDropdownRef.value && !saveDropdownRef.value.contains(e.target as Node)) {
    saveDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
