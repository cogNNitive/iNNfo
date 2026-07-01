<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  folderPicked: [files: File[]]
}>()

const isDragging = ref(false)
const folderInput = ref<HTMLInputElement>()

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files.length) {
    emit('folderPicked', Array.from(e.dataTransfer.files))
  }
}

function pickFolder() {
  folderInput.value?.click()
}

function onFolderChange(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files?.length) {
    emit('folderPicked', Array.from(files))
  }
  target.value = ''
}
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'drop-zone--active': isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="drop-zone__icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
      </svg>
    </div>
    <p class="drop-zone__text">
      Drop a folder or <strong>.md</strong> file here
    </p>
    <div class="drop-zone__actions">
      <button class="btn btn--outline" @click="pickFolder">Abrir carpeta</button>
    </div>

    <input
      ref="folderInput"
      type="file"
      style="display:none"
      webkitdirectory
      @change="onFolderChange"
    />
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--border-soft);
  border-radius: var(--radius);
  padding: var(--space-xxl) var(--space-lg);
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: default;
}

.drop-zone--active {
  border-color: var(--brand-primary);
  background: var(--canvas-inert);
}

.drop-zone__icon {
  color: var(--ink-muted);
  margin-bottom: var(--space-md);
}

.drop-zone__text {
  color: var(--ink-muted);
  margin-bottom: var(--space-lg);
}

.drop-zone__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.btn {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--brand-primary);
  background: transparent;
  color: var(--brand-primary);
}

.btn--outline:hover {
  background: var(--brand-primary);
  color: white;
}
</style>
