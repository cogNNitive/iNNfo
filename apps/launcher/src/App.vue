<script setup lang="ts">
import { ref } from 'vue'
import DropZone from './components/DropZone.vue'
import ResultCard from './components/ResultCard.vue'
import { detectFileMode, detectFolderMode, collectFiles } from './utils/detector'
import type { DetectionResult } from './types'

const result = ref<DetectionResult | null>(null)
const detecting = ref(false)

async function onFilePick(file: File) {
  detecting.value = true
  result.value = null
  try {
    result.value = await detectFileMode(file)
  } finally {
    detecting.value = false
  }
}

async function onFolderPick(files: File[]) {
  detecting.value = true
  result.value = null
  try {
    result.value = await detectFolderMode(files)
  } finally {
    detecting.value = false
  }
}

async function onFilesDrop(files: File[]) {
  if (files.length === 1 && files[0].name.endsWith('.md')) {
    await onFilePick(files[0])
  } else {
    await onFolderPick(files)
  }
}

function reset() {
  result.value = null
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
      <div class="container">
        <div v-if="!result" class="intro">
          <p class="intro__text">
            Open any FORMAT model — detect whether it's FILE or FOLDER mode
            and launch the right editor.
          </p>
        </div>

        <DropZone
          v-if="!result"
          @file-pick="onFilePick"
          @folder-pick="onFolderPick"
          @files-drop="onFilesDrop"
        />

        <div v-if="detecting" class="spinner">
          <div class="spinner__dot" />
          <p>Detecting mode…</p>
        </div>

        <ResultCard v-if="result && !detecting" :result="result" />

        <div v-if="result && !detecting" class="back">
          <button class="btn btn--ghost" @click="reset">Load another</button>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer__text">
          <a href="https://github.com/innV0/cogNNitive" target="_blank">cogNNitive</a>
          &mdash; iNNv0 FORMAT ecosystem
        </p>
      </div>
    </footer>
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
  text-align: center;
  margin-top: var(--space-lg);
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
