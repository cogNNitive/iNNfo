<template>
  <Teleport to="body">
    <div
      v-if="uiStore.showAiModal"
      ref="modalBackdrop"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

      <!-- Modal Panel -->
      <div
        ref="modalPanel"
        class="relative flex flex-col w-[90vw] max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="AI Workflow"
        @keydown.escape="close"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xs">
              <Sparkles class="w-4 h-4 text-white" />
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">AI Workflow</h2>
          </div>
          <button
            @click="close"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <X class="w-4 h-4" />
          </button>
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
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Sparkles, BookOpen, FileDown, FileUp, X } from 'lucide-vue-next'
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

const modalBackdrop = ref<HTMLElement | null>(null)
const modalPanel = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

function close(): void {
  uiStore.setShowAiModal(false)
}

function switchTab(tab: AiTab): void {
  uiStore.setActiveAiTab(tab)
}

// ── Focus trap ───────────────────────────────────────────────

function getFocusableElements(): HTMLElement[] {
  if (!modalPanel.value) return []
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]
  return Array.from(modalPanel.value.querySelectorAll<HTMLElement>(selectors.join(',')))
}

function trapFocus(e: KeyboardEvent): void {
  if (e.key !== 'Tab') return
  const focusable = getFocusableElements()
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close()
    return
  }
  trapFocus(e)
}

watch(
  () => uiStore.showAiModal,
  (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      // Focus first focusable element after next tick
      requestAnimationFrame(() => {
        const focusable = getFocusableElements()
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      })
    } else if (previousFocus) {
      previousFocus.focus()
      previousFocus = null
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (previousFocus) {
    previousFocus.focus()
    previousFocus = null
  }
})
</script>

<style scoped>
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
