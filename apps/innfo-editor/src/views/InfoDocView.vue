<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { normalizeSingleModel } from '@cognnitive/innfo-core'
import { useModelStore } from '../stores/modelStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useUrlDocLoader } from '../composables/useUrlDocLoader'

const router = useRouter()
const modelStore = useModelStore()
const workspace = useWorkspaceStore()

const busy = ref(false)
const error = ref<string | null>(null)
const dragOver = ref(false)
const urlInput = ref('')
const urlBusy = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

async function loadFile(file: File): Promise<void> {
  error.value = null
  busy.value = true
  try {
    const content = await file.text()
    const rootId = file.name.replace(/\.md$/i, '')

    workspace.reset()
    workspace.isSampleSession = false

    const { nodes } = normalizeSingleModel(content, file.name, rootId)

    await modelStore._resolveParentSpecs(nodes, [rootId])
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

async function loadFromUrl(): Promise<void> {
  error.value = null
  const url = urlInput.value.trim()
  if (!url) {
    error.value = 'Please enter a valid URL.'
    return
  }
  try { new URL(url) } catch {
    error.value = 'Invalid URL format.'
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
</script>

<template>
  <div class="info-doc">
    <section class="info-doc__card">
      <h1 class="info-doc__title">cogNNitive — iNNfo Editor</h1>
      <p class="info-doc__desc">
        To open your iNNfo document in the cogNNitive editor,
        drop the file here or click to browse:
      </p>

      <div
        class="info-doc__dropzone"
        :class="{ 'info-doc__dropzone--over': dragOver, 'info-doc__dropzone--busy': busy }"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
        @click="fileInputRef?.click()"
      >
        <svg class="info-doc__drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span v-if="busy" class="info-doc__drop-text">Loading&hellip;</span>
        <span v-else class="info-doc__drop-text">
          Drop your <strong>_NN.md</strong> file here<br />
          <span class="info-doc__drop-sub">or click to select one</span>
        </span>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept=".md"
        class="info-doc__hidden-input"
        @change="onFileSelected"
      />

      <p v-if="error" class="info-doc__error" role="alert">{{ error }}</p>

      <div class="info-doc__divider">
        <span class="info-doc__divider-line"></span>
        <span class="info-doc__divider-text">or paste a URL</span>
        <span class="info-doc__divider-line"></span>
      </div>

      <div class="info-doc__url-row">
        <input
          v-model="urlInput"
          type="url"
          placeholder="https://example.com/model_V_1-0-0_business_NN.md"
          class="info-doc__url-input"
          @keydown.enter="loadFromUrl"
        />
        <button class="info-doc__url-btn" :disabled="urlBusy || !urlInput.trim()" @click="loadFromUrl">
          {{ urlBusy ? 'Loading' : 'Load' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.info-doc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem 1rem;
  font-family: system-ui, sans-serif;
}

.info-doc__card {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  border: 2px solid #4d0e4e;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8f0f8 0%, #fff 100%);
  text-align: center;
  box-shadow: 0 4px 24px rgba(77, 14, 78, 0.10);
}

.info-doc__title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #4d0e4e;
  letter-spacing: -0.01em;
}

.info-doc__desc {
  margin: 0;
  max-width: 380px;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.info-doc__dropzone {
  width: 100%;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 2px dashed #c8a8c8;
  border-radius: 14px;
  background: #fdfafd;
  cursor: pointer;
  transition: all 0.15s;
  padding: 1.5rem;
}

.info-doc__dropzone:hover {
  border-color: #4d0e4e;
  background: #f8f0f8;
}

.info-doc__dropzone--over {
  border-color: #4d0e4e;
  background: #f3e5f5;
  border-style: solid;
}

.info-doc__dropzone--busy {
  opacity: 0.6;
  cursor: default;
}

.info-doc__drop-icon {
  color: #4d0e4e;
}

.info-doc__drop-text {
  font-size: 15px;
  color: #444;
  line-height: 1.5;
}

.info-doc__drop-sub {
  font-size: 12px;
  color: #999;
}

.info-doc__hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.info-doc__error {
  margin: 0;
  font-size: 13px;
  color: #b00020;
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  background: #fff0f0;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
}

.info-doc__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin: 0.25rem 0;
}

.info-doc__divider-line {
  flex: 1;
  height: 1px;
  background: #e0d0e0;
}

.info-doc__divider-text {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-doc__url-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.info-doc__url-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #fff;
  color: #333;
  outline: none;
  transition: border-color 0.15s;
}

.info-doc__url-input:focus {
  border-color: #4d0e4e;
  box-shadow: 0 0 0 2px rgba(77, 14, 78, 0.1);
}

.info-doc__url-btn {
  padding: 0.5rem 1rem;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  background: #4d0e4e;
  color: #fff;
  border: 1px solid #4d0e4e;
  transition: all 0.15s;
  font-family: system-ui, sans-serif;
  white-space: nowrap;
}

.info-doc__url-btn:hover:not(:disabled) {
  background: #3a0b3b;
}

.info-doc__url-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
