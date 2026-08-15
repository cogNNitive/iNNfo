<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      @click.self="close"
    >
      <div
        class="relative flex flex-col w-[92vw] max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Source Traceability Viewer"
        @keydown.escape="close"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Link class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-300/60 dark:border-violet-700">
                  Fuente
                </span>
                <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {{ parsed.fileName }}
                </h2>
                <span v-if="parsed.slug" class="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {{ resolvedSection ? resolvedSection.heading.text : parsed.slug }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate max-w-xl">
                {{ parsed.filePath }}
              </p>
            </div>

            <!-- Toggle Mode (only if Markdown) -->
            <div v-if="isMarkdown" class="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-2xs ml-4 shrink-0">
              <button
                @click="viewMode = 'preview'"
                class="px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer"
                :class="viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
              >
                Vista Previa
              </button>
              <button
                @click="viewMode = 'code'"
                class="px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer"
                :class="viewMode === 'code' ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
              >
                Código
              </button>
            </div>
          </div>
          <button
            @click="close"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Metadata Panel -->
        <div class="px-6 py-3 bg-slate-100/60 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <FileText class="w-4 h-4 text-violet-500 shrink-0" />
              <div class="min-w-0 flex-1">
                <span class="text-[10px] uppercase font-bold text-slate-400 block leading-none">Archivo Original</span>
                <span class="font-mono text-xs truncate block font-medium" :title="metadata.source_file || parsed.filePath">
                  {{ metadata.source_file || 'N/A' }}
                </span>
              </div>
              <button
                v-if="metadata.source_file"
                type="button"
                class="p-1 rounded-md text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer shrink-0"
                title="Abrir archivo original en una pestaña nueva"
                @click="openOriginalFile"
              >
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <Hash class="w-4 h-4 text-indigo-500 shrink-0" />
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold text-slate-400 block leading-none">SHA-256 Hash</span>
                <span class="font-mono text-[11px] truncate block font-medium" :title="metadata.sha256 || 'N/A'">
                  {{ metadata.sha256 ? metadata.sha256.substring(0, 14) + '...' : 'Trazable' }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <HardDrive class="w-4 h-4 text-emerald-500 shrink-0" />
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold text-slate-400 block leading-none">Tamaño / Estado</span>
                <span class="font-mono text-xs truncate block font-medium">
                  {{ metadata.size_bytes ? formatBytes(metadata.size_bytes) : 'Normalizado' }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
              <Clock class="w-4 h-4 text-amber-500 shrink-0" />
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold text-slate-400 block leading-none">Normalizado At</span>
                <span class="font-mono text-[11px] truncate block font-medium">
                  {{ metadata.normalized_at ? formatDate(metadata.normalized_at) : 'Reciente' }}
                </span>
              </div>
            </div>
          </div>
          <p v-if="openOriginalError" class="mt-2 text-[11px] text-red-500 dark:text-red-400">
            No se pudo abrir el archivo original: {{ openOriginalError }}
          </p>
        </div>

        <!-- File Content Display Area -->
        <div
          class="flex-1 overflow-y-auto p-6 transition-all"
          :class="[
            viewMode === 'preview' && isMarkdown
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-8 max-w-none'
              : 'font-mono text-xs leading-relaxed bg-slate-900 text-slate-100 dark:bg-slate-950'
          ]"
        >
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <div class="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando contenido de la fuente...</span>
          </div>

          <div v-else-if="error" class="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
            <p class="font-bold flex items-center gap-2">
              <X class="w-4 h-4 text-red-400" />
              No se pudo cargar el archivo de fuente
            </p>
            <p class="mt-1 font-mono text-slate-400">{{ error }}</p>
          </div>

          <!-- Preview Mode for Images -->
          <div v-else-if="viewMode === 'preview' && isImage" class="flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl h-[60vh] overflow-auto">
            <img :src="objectUrl" class="max-w-full max-h-full object-contain rounded-lg shadow-md border border-slate-200 dark:border-slate-800" :alt="parsed.fileName" />
          </div>

          <!-- Preview Mode for PDFs -->
          <div v-else-if="viewMode === 'preview' && isPdf" class="w-full h-[60vh] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
            <iframe :src="objectUrl" class="w-full h-full border-0 rounded-xl"></iframe>
          </div>

          <!-- Preview Mode for Markdown -->
          <div v-else-if="viewMode === 'preview' && isMarkdown" class="markdown-body" v-html="formattedHtml"></div>

          <!-- Code / Text Line-by-Line Mode -->
          <div v-else class="space-y-1">
            <div
              v-for="(line, idx) in lines"
              :key="idx"
              :id="`line-${idx + 1}`"
              class="flex items-start gap-4 px-2 py-0.5 rounded transition-colors"
              :class="{
                'bg-violet-900/60 text-violet-100 font-bold border-l-4 border-violet-500 pl-3': isLineTargeted(idx + 1)
              }"
            >
              <span class="w-8 shrink-0 text-right select-none text-slate-600 text-[11px] font-mono">
                {{ idx + 1 }}
              </span>
              <span class="whitespace-pre-wrap break-words flex-1 font-mono">
                {{ line }}
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            Trazabilidad verificada con especificación iNNfo V_0-3-0
          </span>
          <button
            @click="close"
            class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Link, X, FileText, Hash, HardDrive, Clock, CheckCircle2, ExternalLink } from 'lucide-vue-next'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { resolveHeadingSection, type ParsedSourceRef } from '../../utils/sourceRef'
import { parseFrontmatter } from '@cognnitive/innfo-core'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps<{
  isOpen: boolean
  parsed: ParsedSourceRef
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const error = ref<string | null>(null)
const rawContent = ref('')
const metadata = ref<{
  source_file?: string
  sha256?: string
  size_bytes?: number
  normalized_at?: string
}>({})
const openOriginalError = ref<string | null>(null)

const viewMode = ref<'preview' | 'code'>('preview')
const objectUrl = ref('')

const extension = computed(() => {
  const parts = props.parsed.fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
})

const isMarkdown = computed(() => extension.value === 'md')
const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension.value))
const isPdf = computed(() => extension.value === 'pdf')
const formattedHtml = computed(() => renderMarkdown(rawContent.value))

const lines = computed(() => rawContent.value.split('\n'))

const resolvedSection = computed(() => {
  if (!props.parsed.slug || !rawContent.value) return null
  return resolveHeadingSection(rawContent.value, props.parsed.slug)
})

function isLineTargeted(lineNum: number): boolean {
  const section = resolvedSection.value
  if (!section) return false
  // lineNum is 1-based; section.startLine/endLine are 0-based (endLine exclusive).
  return lineNum >= section.startLine + 1 && lineNum <= section.endLine
}

function close(): void {
  emit('close')
}

function formatBytes(bytes?: number): string {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function cleanupObjectUrl(): void {
  if (objectUrl.value && objectUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

async function loadSourceContent(): Promise<void> {
  if (!props.parsed.filePath) return
  loading.value = true
  error.value = null
  rawContent.value = ''
  metadata.value = {}
  cleanupObjectUrl()

  try {
    const handle = workspaceStore.handle

    if (isImage.value || isPdf.value) {
      if (handle) {
        const parts = props.parsed.filePath.split(/[/\\]/).filter(Boolean)
        let current: any = handle
        for (let i = 0; i < parts.length - 1; i++) {
          current = await current.getDirectoryHandle(parts[i])
        }
        const fileHandle = await current.getFileHandle(parts[parts.length - 1])
        const file = await fileHandle.getFile()
        objectUrl.value = URL.createObjectURL(file)
      } else {
        // Fallback: use filePath directly
        objectUrl.value = props.parsed.filePath
      }
      loading.value = false
      return
    }

    let textContent = ''

    if (handle) {
      const parts = props.parsed.filePath.split(/[/\\]/).filter(Boolean)
      let current: any = handle
      for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i])
      }
      const fileHandle = await current.getFileHandle(parts[parts.length - 1])
      const file = await fileHandle.getFile()
      textContent = await file.text()
    } else {
      // Virtual workspace / preview fallback: construct URL or fetch
      const resp = await fetch(props.parsed.filePath)
      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status} - ${resp.statusText}`)
      }
      textContent = await resp.text()
    }

    rawContent.value = textContent

    // Extract frontmatter metadata if present
    const fm = parseFrontmatter(textContent) as any
    if (fm) {
      metadata.value = {
        source_file: fm.source_file,
        sha256: fm.sha256,
        size_bytes: fm.size_bytes,
        normalized_at: fm.normalized_at,
      }
    }

    // Auto-scroll to the target section's heading line
    if (props.parsed.slug) {
      const section = resolveHeadingSection(textContent, props.parsed.slug)
      if (section) {
        await nextTick()
        const targetEl = document.getElementById(`line-${section.startLine + 1}`)
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function openOriginalFile(): Promise<void> {
  if (!metadata.value.source_file) return
  openOriginalError.value = null

  try {
    const handle = workspaceStore.handle
    const sourceFile = metadata.value.source_file

    if (handle) {
      const parts = sourceFile.split(/[/\\]/).filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = handle
      for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i])
      }
      const fileHandle = await current.getFileHandle(parts[parts.length - 1])
      const file = await fileHandle.getFile()
      const objectUrl = URL.createObjectURL(file)
      window.open(objectUrl, '_blank')
    } else {
      // Virtual workspace / preview fallback: same resolution style as loadSourceContent's fetch fallback.
      window.open(sourceFile, '_blank')
    }
  } catch (err) {
    openOriginalError.value = err instanceof Error ? err.message : String(err)
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.parsed.slug) {
        viewMode.value = 'code'
      } else {
        viewMode.value = (isMarkdown.value || isImage.value || isPdf.value) ? 'preview' : 'code'
      }
      loadSourceContent()
    } else {
      cleanupObjectUrl()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scale-in {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-fade-in { animation: fade-in 0.15s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

/* Sleek minimal styles for markdown preview inside modal */
.markdown-body :deep(h1) { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
.markdown-body :deep(h2) { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
.markdown-body :deep(h3) { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.markdown-body :deep(p) { margin-bottom: 0.75rem; line-height: 1.6; }
.markdown-body :deep(ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.markdown-body :deep(ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.markdown-body :deep(li) { margin-bottom: 0.25rem; }
.markdown-body :deep(code) { font-family: monospace; font-size: 0.85em; background-color: #f1f5f9; padding: 0.15rem 0.3rem; border-radius: 0.25rem; }
.dark .markdown-body :deep(code) { background-color: #1e293b; color: #f1f5f9; }
.markdown-body :deep(pre) { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
.dark .markdown-body :deep(pre) { background-color: #0f172a; }
.markdown-body :deep(pre code) { background-color: transparent; padding: 0; }
.markdown-body :deep(a) { color: #6366f1; text-decoration: underline; }
.markdown-body :deep(blockquote) { border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #64748b; font-style: italic; margin-bottom: 1rem; }
.dark .markdown-body :deep(blockquote) { border-left-color: #334155; color: #94a3b8; }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
.markdown-body :deep(th), .markdown-body :deep(td) { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
.dark .markdown-body :deep(th), .dark .markdown-body :deep(td) { border-color: #334155; }
.markdown-body :deep(th) { background-color: #f8fafc; }
.dark .markdown-body :deep(th) { background-color: #1e293b; }
</style>
