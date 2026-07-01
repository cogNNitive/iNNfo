<script setup lang="ts">
import { ref } from 'vue'
import DropZone from './components/DropZone.vue'
import FolderExplorer from './components/FolderExplorer.vue'
import ToastMessage from './components/ToastMessage.vue'
import RecentFolders from './components/RecentFolders.vue'
import SampleFolders from './components/SampleFolders.vue'
import { scanFolderContents, collectFiles } from './utils/detector'
import { addToHistory } from './utils/history'
import { useToast } from './composables/useToast'
import type { ScannedFolder, SampleFolder } from './types'

const folder = ref<ScannedFolder | null>(null)
const scanning = ref(false)
const recentFoldersRef = ref<InstanceType<typeof RecentFolders> | null>(null)
const folderInput = ref<HTMLInputElement>()
const { show: showToast } = useToast()

async function onFolderPicked(files: File[]) {
  scanning.value = true
  folder.value = null
  try {
    const result = await scanFolderContents(files)
    folder.value = result
    addToHistory(result.name, '')
    recentFoldersRef.value?.refresh()

    const itemsWithErrors = result.items.filter(
      i => i.validation && i.validation.summary.errors > 0
    )
    const itemsWithWarnings = result.items.filter(
      i => i.validation && i.validation.summary.errors === 0 && i.validation.summary.warnings > 0
    )
    const rootIssues = result.rootValidation
      && (result.rootValidation.summary.errors > 0 || result.rootValidation.summary.warnings > 0)

    if (itemsWithErrors.length > 0) {
      const names = itemsWithErrors.slice(0, 3).map(i => i.name).join(', ')
      const rest = itemsWithErrors.length > 3 ? ` and ${itemsWithErrors.length - 3} more` : ''
      showToast(`Validation errors in ${itemsWithErrors.length} file(s): ${names}${rest}`, 'error')
    } else if (itemsWithWarnings.length > 0 || rootIssues) {
      showToast('Validation completed with warnings', 'warning')
    } else {
      showToast('All files passed validation', 'success')
    }
  } finally {
    scanning.value = false
  }
}

async function onFilesDropped(e: DragEvent) {
  if (!e.dataTransfer) return
  const files = collectFiles(e.dataTransfer.items)
  if (files.length) {
    await onFolderPicked(files)
  }
}

function reset() {
  folder.value = null
}

function handleReopen(name: string) {
  folderInput.value?.click()
}

function handleOpenExample(sample: SampleFolder) {
  folderInput.value?.click()
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header__inner">
        <h1 class="header__title" @click="reset">cogNNitive</h1>
        <span class="header__tag">launcher</span>
      </div>
    </header>

    <main class="main">
      <template v-if="!folder">
        <div class="container">
          <div class="intro">
            <p class="intro__text">
              Open a folder to explore its FORMAT models and documents.
            </p>
          </div>

          <DropZone @folder-picked="onFolderPicked" />

          <RecentFolders ref="recentFoldersRef" @reopen="handleReopen" />

          <SampleFolders @open-example="handleOpenExample" />
        </div>
      </template>

      <template v-else>
        <div class="back">
          <button class="btn btn--ghost" @click="reset">&larr; Open another folder</button>
        </div>

        <div v-if="scanning" class="spinner">
          <div class="spinner__dot" />
          <p>Scanning folder…</p>
        </div>

        <FolderExplorer v-else :folder="folder" />
      </template>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer__text">
          <a href="https://github.com/innV0/cogNNitive" target="_blank">cogNNitive</a>
          &mdash; iNNv0 FORMAT ecosystem
        </p>
      </div>
    </footer>

    <input
      ref="folderInput"
      type="file"
      style="display:none"
      webkitdirectory
      @change="(e: Event) => {
        const target = e.target as HTMLInputElement
        const files = target.files
        if (files?.length) {
          onFolderPicked(Array.from(files))
        }
        target.value = ''
      }"
    />

    <ToastMessage />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  border-bottom: 1px solid var(--border-soft);
  padding: var(--space-md) 0;
}

.header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.header__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--brand-primary);
  cursor: pointer;
  user-select: none;
}

.header__tag {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.main {
  flex: 1;
  padding: var(--space-xxl) 0;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.intro {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.intro__text {
  font-size: 16px;
  color: var(--ink-muted);
  max-width: 480px;
  margin: 0 auto;
}

.spinner {
  text-align: center;
  padding: var(--space-xl) 0;
  color: var(--ink-muted);
}

.spinner__dot {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-soft);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-lg);
}

.btn {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.btn--ghost {
  border: none;
  background: transparent;
  color: var(--ink-muted);
}

.btn--ghost:hover {
  color: var(--brand-primary);
}

.footer {
  border-top: 1px solid var(--border-soft);
  padding: var(--space-md) 0;
}

.footer__text {
  font-size: 12px;
  color: var(--ink-muted);
  text-align: center;
}

.footer__text a {
  color: var(--brand-primary);
  text-decoration: none;
}
</style>
