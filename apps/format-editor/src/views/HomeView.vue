<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { DirectoryHandleLike } from '../model/fs-types'

const router = useRouter()
const workspace = useWorkspaceStore()
const error = ref<string | null>(null)
const busy = ref(false)

/**
 * Entry point: prompts the user for a workspace directory via the File System
 * Access API, runs the single parse pass through workspaceStore.open(), and
 * navigates to the workspace view. Only available in Chromium browsers over a
 * secure context (localhost qualifies).
 */
async function openWorkspace(): Promise<void> {
  error.value = null
  const picker = (window as unknown as {
    showDirectoryPicker?: () => Promise<DirectoryHandleLike>
  }).showDirectoryPicker
  if (!picker) {
    error.value = 'This browser does not support the File System Access API. Use Chrome or Edge.'
    return
  }
  try {
    busy.value = true
    const handle = await picker.call(window)
    await workspace.open(handle)
    router.push('/workspace')
  } catch (err) {
    // AbortError = the user dismissed the picker; not a failure.
    if (err instanceof DOMException && err.name === 'AbortError') return
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="home">
    <h1 class="home__title">format-editor</h1>
    <p class="home__hint">Open a workspace folder to begin.</p>
    <button class="home__open" :disabled="busy" @click="openWorkspace">
      {{ busy ? 'Opening…' : 'Open folder…' }}
    </button>
    <p v-if="error" class="home__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  font-family: system-ui, sans-serif;
}
.home__title {
  margin: 0;
  font-size: 1.5rem;
}
.home__hint {
  margin: 0;
  color: #555;
}
.home__open {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #333;
  border-radius: 6px;
  background: #fff;
}
.home__open:disabled {
  opacity: 0.6;
  cursor: default;
}
.home__error {
  color: #b00020;
  max-width: 32rem;
  text-align: center;
}
</style>
