<template>
  <div v-if="shouldShow" class="select-none text-xs">
    <!-- Item Row -->
    <div
      class="group flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer border"
      :class="[
        item.kind === 'directory'
          ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-transparent font-semibold'
          : isModel
            ? 'bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-indigo-500/10 dark:from-primary-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 border-primary-300/50 dark:border-primary-600/50 hover:border-primary-500 shadow-xs'
            : isArtifact
              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-300/40 dark:border-amber-700/40 hover:bg-amber-500/10 text-slate-700 dark:text-slate-200'
              : isSource
                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-300/40 dark:border-emerald-700/40 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
      ]"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- Expand / Collapse chevron for Directory -->
      <button
        v-if="item.kind === 'directory'"
        @click.stop="isOpen = !isOpen"
        class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500 shrink-0"
      >
        <ChevronRight v-if="!isOpen" class="w-3.5 h-3.5" />
        <ChevronDown v-else class="w-3.5 h-3.5" />
      </button>
      <span v-else class="w-4 shrink-0"></span>

      <!-- Icon -->
      <div class="shrink-0 flex items-center">
        <!-- Directory Icon -->
        <Folder v-if="item.kind === 'directory'" class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        
        <!-- Innfo Model Icon (Glowing Sparkles) -->
        <Sparkles
          v-else-if="isModel"
          class="w-3.5 h-3.5 text-primary-500 animate-pulse drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]"
        />
        
        <!-- Artifact Icon -->
        <FileOutput v-else-if="isArtifact" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        
        <!-- Source File Icon -->
        <FileCode v-else-if="isSource" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        
        <!-- Default File Icon -->
        <FileText v-else class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
      </div>

      <!-- File / Folder Name -->
      <span
        class="truncate font-medium flex-1"
        :class="[
          isModel ? 'font-bold text-primary-700 dark:text-primary-300 tracking-tight' : '',
          item.kind === 'directory' ? 'font-semibold' : ''
        ]"
      >
        {{ item.name }}
      </span>

      <!-- Eye-Catching Badges -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Innfo Model Badge -->
        <span
          v-if="isModel"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-400/40 shadow-2xs"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></span>
          MODEL
        </span>

        <!-- Source Badge -->
        <span
          v-else-if="isSource"
          class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30"
        >
          SRC
        </span>

        <!-- Artifact Badge -->
        <span
          v-else-if="isArtifact"
          class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-400/30"
        >
          ART
        </span>
      </div>
    </div>

    <!-- Recursive Children for Directories -->
    <div v-if="item.kind === 'directory' && isOpen && item.children && item.children.length > 0">
      <FileTreeNode
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :depth="depth + 1"
        :filter-mode="filterMode"
        :search-query="searchQuery"
        @select-file="$emit('select-file', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Sparkles,
  FileOutput,
  FileCode,
} from 'lucide-vue-next'
import type { ExplorerFilterMode } from '../../stores/uiStore'

export interface FileItem {
  name: string
  kind: 'file' | 'directory'
  path: string
  children?: FileItem[]
}

const props = withDefaults(
  defineProps<{
    item: FileItem
    depth?: number
    filterMode?: ExplorerFilterMode
    searchQuery?: string
  }>(),
  {
    depth: 0,
    filterMode: 'all',
    searchQuery: '',
  },
)

const emit = defineEmits<{
  (e: 'select-file', item: FileItem): void
}>()

const isOpen = ref(true)

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').toLowerCase()
}

function pathHasDir(normPath: string, dirNames: string[]): boolean {
  const parts = normPath.split('/')
  return dirNames.some((d) => parts.includes(d))
}

function checkIsModel(item: FileItem): boolean {
  if (item.kind !== 'file') return false
  const name = item.name.toLowerCase()
  return (
    name.endsWith('_nn.md') ||
    name.endsWith('.innfo') ||
    name === 'model.md' ||
    name.endsWith('_model.md') ||
    (name.endsWith('.md') && (name.includes('_v_') || name.endsWith('_f.md') || name.endsWith('_p.md')))
  )
}

function checkIsArtifact(item: FileItem): boolean {
  if (item.kind !== 'file') return false
  if (checkIsModel(item)) return false

  const normPath = normalizePath(item.path)
  const name = item.name.toLowerCase()

  if (pathHasDir(normPath, ['artifacts', 'artifact', 'exports', 'export', 'outputs', 'output', 'dist', 'out'])) {
    return true
  }

  return (
    name.endsWith('.spec.json') ||
    name.endsWith('.spec.md') ||
    name.endsWith('.schema.json') ||
    name.endsWith('.report.md') ||
    name.endsWith('.svg') ||
    name.endsWith('.png') ||
    name.endsWith('.pdf')
  )
}

function checkIsSource(item: FileItem): boolean {
  if (item.kind !== 'file') return false
  if (checkIsModel(item) || checkIsArtifact(item)) return false

  const normPath = normalizePath(item.path)
  const name = item.name.toLowerCase()

  if (pathHasDir(normPath, ['sources', 'source', 'original', 'raw', 'inputs', 'input', 'src', 'data'])) {
    return true
  }

  return (
    name.endsWith('.md') ||
    name.endsWith('.json') ||
    name.endsWith('.yaml') ||
    name.endsWith('.yml') ||
    name.endsWith('.csv') ||
    name.endsWith('.tsv') ||
    name.endsWith('.txt') ||
    name.endsWith('.xml') ||
    name.endsWith('.html') ||
    name.endsWith('.doc') ||
    name.endsWith('.docx') ||
    name.endsWith('.pdf') ||
    name.endsWith('.py') ||
    name.endsWith('.js') ||
    name.endsWith('.ts')
  )
}

// Helper classification functions for reactive template
const isModel = computed(() => checkIsModel(props.item))
const isArtifact = computed(() => checkIsArtifact(props.item))
const isSource = computed(() => checkIsSource(props.item))

function matchesItemFilter(item: FileItem): boolean {
  if (item.kind === 'directory') return true
  if (props.filterMode === 'models') return checkIsModel(item)
  if (props.filterMode === 'sources') return checkIsSource(item)
  if (props.filterMode === 'artifacts') return checkIsArtifact(item)
  return true
}

function matchesSearch(item: FileItem): boolean {
  if (!props.searchQuery) return true
  return item.name.toLowerCase().includes(props.searchQuery.toLowerCase())
}

function hasMatchingSubtree(item: FileItem): boolean {
  if (item.kind === 'file') {
    return matchesItemFilter(item) && matchesSearch(item)
  }

  // For directory: if no search query and filterMode is 'all', it's visible
  if (!props.searchQuery && props.filterMode === 'all') return true

  // Otherwise, visible if any child recursively matches
  return (item.children ?? []).some((c) => hasMatchingSubtree(c))
}

const shouldShow = computed(() => {
  return hasMatchingSubtree(props.item)
})

function handleClick(): void {
  if (props.item.kind === 'directory') {
    isOpen.value = !isOpen.value
  } else {
    emit('select-file', props.item)
  }
}
</script>
