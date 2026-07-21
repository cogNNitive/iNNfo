<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Component } from 'vue'
import { Building2, ClipboardList, Users, FlaskConical, BookOpen } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { DirectoryHandleLike } from '../model/fs-types'
import type { FolderHistoryEntry } from '../shared/validation-types'
import {
  loadHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  getStoredHandle,
  formatTimestamp,
} from '../stores/historyStore'
import { useUrlDocLoader } from '../composables/useUrlDocLoader'
import { normalizeSingleModel } from '@cognnitive/innfo-core'
import { useModelStore } from '../stores/modelStore'
import { useToast } from '../shared/useToast'
import SetupWizard from '../components/layout/SetupWizard.vue'

const router = useRouter()
const route = useRoute()
const workspace = useWorkspaceStore()
const { show: showToast } = useToast()
const error = ref<string | null>(null)
const busy = ref(false)
const urlInput = ref('')
const urlBusy = ref(false)
const history = ref<FolderHistoryEntry[]>([])
const reopenBusy = ref<string | null>(null)
interface ExampleModel {
  id: string
  name: string
  description: string
  templateName: string
  url: string
}

const SAMPLE_BASE = 'https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/latest/level2'

const samples: ExampleModel[] = [
  {
    id: 'sample-ghostbusters',
    name: 'Ghostbusters',
    description:
      'Business model for a fictional ghost-catching franchise: SWOT, risks, market segments, finance, legal, and operations.',
    templateName: 'business',
    url: `${SAMPLE_BASE}/business/samples/Ghostbusters_V_0-1-2_business_NN.md`,
  },
  {
    id: 'sample-code-review',
    name: 'Code Review Process',
    description:
      'Procedure for PR-based code reviews: roles, step-by-step workflow, tool bindings, and hotfix path.',
    templateName: 'procedures',
    url: `${SAMPLE_BASE}/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md`,
  },
  {
    id: 'sample-engineering-team',
    name: 'Engineering Team',
    description:
      'Organization structure: positions, roles, members, reporting lines, and a skills matrix.',
    templateName: 'organization',
    url: `${SAMPLE_BASE}/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md`,
  },
]

interface StarterTemplate {
  id: string
  name: string
  description: string
  icon: Component
  url: string
  templateName: string
  sampleUrl?: string
  sampleName?: string
}

const starterBase = `${import.meta.env.BASE_URL}starter/`

const starters: StarterTemplate[] = [
  {
    id: 'starter-business',
    name: 'Business',
    description: 'Model your business idea: market, team, finance, operations, and strategy.',
    icon: Building2,
    url: `${starterBase}Business_V_1-0-0_starter_NN.md`,
    templateName: 'business',
    sampleUrl:
      'https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/latest/level2/business/samples/Ghostbusters_V_0-1-2_business_NN.md',
    sampleName: 'Ghostbusters',
  },
  {
    id: 'starter-procedures',
    name: 'Procedures',
    description: 'Define step-by-step workflows, roles, artifacts, and decision points.',
    icon: ClipboardList,
    url: `${starterBase}Procedures_V_1-0-0_starter_NN.md`,
    templateName: 'procedures',
    sampleUrl:
      'https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/latest/level2/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md',
    sampleName: 'Code Review Process',
  },
  {
    id: 'starter-organization',
    name: 'Organization',
    description: 'Structure your organization: define positions, roles, members, and relations.',
    icon: Users,
    url: `${starterBase}Organization_V_1-0-0_starter_NN.md`,
    templateName: 'organization',
    sampleUrl:
      'https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/latest/level2/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md',
    sampleName: 'Engineering Team',
  },
]

onMounted(async () => {
  history.value = await loadHistory()

  // Auto-show wizard when SampleBanner CTA links with ?createTemplate=X
  const createTemplate = route.query.createTemplate as string | undefined
  if (createTemplate) {
    showWizard.value = true
    router.replace({ query: {} })
  }
})

// Watch for empty folder detection and notify the user
watch(
  () => workspace.emptyFolderError,
  (val) => {
    if (val) {
      showToast('No iNNfo models found in this folder. Try the examples below to get started.', 'warning')
      workspace.emptyFolderError = false
      // Scroll to samples section
      const el = document.querySelector('.samples')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  },
)

const sandboxUrl = `${import.meta.env.BASE_URL}starter/Sandbox_V_1-0-0_starter_NN.md`
const sandboxBusy = ref(false)
const showSandbox = ref(!localStorage.getItem('nn_hide_sandbox'))
const showWizard = ref(false)
const folderBusy = ref(false)
const folderInputRef = ref<HTMLInputElement | null>(null)

function closeSandbox(): void {
  localStorage.setItem('nn_hide_sandbox', 'true')
  showSandbox.value = false
}

const docsUrl = 'https://format.innv0.com/documentation/'

/**
 * Entry point: prompts the user for a workspace directory.
 *
 * Primary: File System Access API (showDirectoryPicker) — Chromium browsers
 * on secure contexts. Provides full read/write with handle persistence.
 *
 * Fallback: <input type="file" webkitdirectory> — works in Chrome, Edge,
 * and Firefox (92+). Read-only virtual workspace (no save).
 */
async function openWorkspace(): Promise<void> {
  error.value = null
  folderBusy.value = true
  try {
    const picker = (
      window as unknown as {
        showDirectoryPicker?: (opts?: { id?: string }) => Promise<DirectoryHandleLike>
      }
    ).showDirectoryPicker
    if (picker) {
      const handle = await picker.call(window, { id: 'innfo-workspace' })
      await workspace.open(handle)
      if (!workspace.hasParsed) {
        if (workspace.emptyFolderError) {
          error.value = 'No iNNfo model files (_NN.md) found in this folder. Try opening a folder that contains model files, or use the samples below.'
        } else if (workspace.error) {
          error.value = workspace.error
        }
        return
      }
      if (workspace.error) {
        error.value = workspace.error
        return
      }
      await addToHistory(handle.name, handle)
      history.value = await loadHistory()
      await router.push('/workspace')
    } else {
      showToast('File System API not available. Using fallback folder picker (read-only).', 'info')
      folderInputRef.value?.click()
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    folderBusy.value = false
  }
}

/**
 * Processes files from the fallback <input type="file" webkitdirectory>
 * picker. Reads _NN.md files, parses them, and sets up a virtual workspace
 * (read-only, no file system handle).
 */
async function onFolderInputChange(event: Event): Promise<void> {
  error.value = null
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  folderBusy.value = true
  try {
    const nnFiles = Array.from(files).filter((f) => f.name.endsWith('_NN.md'))
    if (nnFiles.length === 0) {
      error.value = 'No iNNfo model files (_NN.md) found in this folder.'
      showToast('No iNNfo models found in this folder. Try the examples below.', 'warning')
      return
    }

    const modelStore = useModelStore()
    const allNodes: Record<string, import('../model/types').ModelNode> = {}
    const rootIds: string[] = []

    for (const file of nnFiles) {
      const content = await file.text()
      const rootId = file.name.replace(/\.md$/i, '')
      const result = normalizeSingleModel(content, file.webkitRelativePath || file.name, rootId)
      Object.assign(allNodes, result.nodes)
      rootIds.push(rootId)
    }

    await modelStore._resolveParentSpecs(allNodes, rootIds)
    modelStore.setGraph(allNodes, rootIds)

    workspace.hasParsed = true
    workspace.parseCount += 1
    workspace.emptyFolderError = false

    const dirName = nnFiles[0].webkitRelativePath.split('/')[0] || 'workspace'
    await addToHistory(dirName, null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    folderBusy.value = false
    input.value = ''
  }
}

/**
 * Loads a model from a remote URL into a virtual workspace.
 */
async function loadFromUrl(): Promise<void> {
  error.value = null
  const url = urlInput.value.trim()
  if (!url) {
    error.value = 'Please enter a valid URL.'
    return
  }
  try {
    new URL(url)
  } catch {
    error.value = 'Invalid URL format.'
    return
  }
  urlBusy.value = true
  try {
    await workspace.loadFromUrl(url)
    await addToHistory(url, null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    urlBusy.value = false
  }
}

/**
 * Creates a new empty workspace from a default template and navigates to it.
 */
async function createFromTemplate(): Promise<void> {
  error.value = null
  busy.value = true
  try {
    const loader = useUrlDocLoader()
    const frontmatter = {
      spec_version: 'V_0-1-5',
      model_version: 'V_1-0-0',
      title: 'Untitled Model',
      template: { name: 'business', version: 'V_1-0-0' },
      concepts: [{ name: 'Topic', type: 'topic', icon: 'wrench', color: '#059669' }],
      markers: [],
    }
    await loader.loadFromFrontmatter(frontmatter, 'Untitled_NN.md')
    workspace.hasParsed = true
    workspace.hasHandle = true
    workspace.parseCount += 1
    await addToHistory('Untitled', null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

async function loadSandbox(): Promise<void> {
  error.value = null
  sandboxBusy.value = true
  try {
    await workspace.loadFromUrl(sandboxUrl)
    await addToHistory('Sandbox', null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    sandboxBusy.value = false
  }
}

/**
 * Reopens a recent folder: retrieves the stored handle from IndexedDB,
 * verifies the permission, and navigates to the workspace view.
 */
async function reopenFolder(entry: FolderHistoryEntry): Promise<void> {
  if (reopenBusy.value) return
  reopenBusy.value = entry.handleKey
  try {
    const handle = await getStoredHandle(entry.handleKey)
    if (!handle) {
      // Stale entry — handle may have been garbage-collected by the browser
      await removeFromHistory(entry.handleKey)
      history.value = await loadHistory()
      error.value = `"${entry.name}" is no longer accessible. It has been removed from your recent list.`
      return
    }

    // Verify permission; request it if needed
    const perm = await (
      handle as unknown as { requestPermission?: (opts: { mode: string }) => Promise<string> }
    ).requestPermission?.({ mode: 'read' })
    if (perm === 'denied' || perm === 'prompt') {
      // User has denied or we can't request — remove from history as stale
      await removeFromHistory(entry.handleKey)
      history.value = await loadHistory()
      error.value = `Cannot open "${entry.name}" — permission was denied.`
      return
    }

    await workspace.open(handle)
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    reopenBusy.value = null
  }
}

/**
 * Loads a starter model from its raw GitHub URL into a virtual workspace.
 * The model can be explored and edited in memory, but cannot be saved
 * because there's no local folder handle. Use createFromStarter() if you
 * need full save support.
 */
async function previewSample(starter: StarterTemplate): Promise<void> {
  if (!starter.sampleUrl) return
  error.value = null
  urlBusy.value = true
  try {
    await workspace.loadFromUrl(starter.sampleUrl, starter.templateName)
    await addToHistory(`${starter.name} Sample`, null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    urlBusy.value = false
  }
}

/**
 * Creates a new model from a starter template by:
 * 1. Asking the user to pick a folder via File System Access API
 * 2. Fetching the starter model content from the raw URL
 * 3. Writing it as a new _NN.md file in the selected folder
 * 4. Opening the folder as a workspace (full save support)
 */
async function createFromStarter(starter: StarterTemplate): Promise<void> {
  error.value = null
  const picker = (
    window as unknown as {
      showDirectoryPicker?: () => Promise<DirectoryHandleLike>
    }
  ).showDirectoryPicker
  if (!picker) {
    error.value = 'This browser does not support the File System Access API. Use Chrome or Edge.'
    return
  }
  try {
    busy.value = true
    const handle = await picker.call(window)

    // Fetch starter content from raw GitHub URL
    const response = await window.fetch(starter.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    let content = await response.text()

    // Customise the model title so the user gets a fresh copy
    const modelName = `My${starter.name.replace(/\s/g, '')}`
    content = content.replace(/^title:.*$/m, `title: "${modelName}"`)

    const filename = `${modelName}_V_1-0-0_${starter.templateName}_NN.md`

    // Write the file into the chosen folder
    const fileHandle = await handle.getFileHandle(filename, { create: true })
    if (!fileHandle.createWritable) throw new Error('File handle does not support writing')
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()

    await workspace.open(handle)
    await addToHistory(handle.name, handle)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

/** Removes a single history entry. */
async function removeEntry(handleKey: string): Promise<void> {
  await removeFromHistory(handleKey)
  history.value = await loadHistory()
}

/** Clears all history. */
async function clearAllHistory(): Promise<void> {
  await clearHistory()
  history.value = await loadHistory()
}

/**
 * Creates a new model from a starter template looked up by name.
 * Used by the SampleBanner CTA ("Crear mi propio modelo").
 */
async function createFromStarterByName(templateName: string): Promise<void> {
  const starter = starters.find(
    (s) => s.templateName.toLowerCase() === templateName.toLowerCase(),
  )
  if (!starter) {
    error.value = `Template "${templateName}" not found.`
    return
  }
  await createFromStarter(starter)
}

/**
 * Opens an example model read-only by loading it from its raw URL into a
 * virtual workspace. No folder is needed, so this works for first-time
 * visitors who don't have the repository checked out locally.
 */
async function onSampleClick(sample: ExampleModel): Promise<void> {
  error.value = null
  urlBusy.value = true
  try {
    await workspace.loadFromUrl(sample.url, sample.templateName)
    await addToHistory(`${sample.name} Sample`, null as unknown as any)
    history.value = await loadHistory()
    router.push('/workspace')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    urlBusy.value = false
  }
}
</script>

<template>
  <div class="home">
    <!-- ── Setup Wizard (hidden by default, toggled via "Guided setup" link) ── -->
    <div v-if="showWizard" class="home__wizard-scrim">
      <div class="home__wizard-wrap">
        <button class="home__wizard-close" aria-label="Close wizard" @click="showWizard = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <SetupWizard @done="showWizard = false" />
      </div>
    </div>

    <!-- ── Hero: Open Folder ── -->
    <section class="hero">
      <div class="hero__card">
        <h1 class="hero__title">iNNfo Editor</h1>
        <p class="hero__desc">
          Open a folder that contains iNNfo model files, or choose a quick start option below.
        </p>

        <button class="hero__btn" :disabled="folderBusy" @click="openWorkspace">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
          </svg>
          <span>{{ folderBusy ? 'Opening\u2026' : 'Open Existing Work Space' }}</span>
        </button>

        <p v-if="error" class="hero__error" role="alert">{{ error }}</p>

        <button class="hero__btn hero__btn--secondary" @click="showWizard = true">
          New to iNNfo? Start with guided setup &rarr;
        </button>

        <input
          ref="folderInputRef"
          type="file"
          webkitdirectory
          multiple
          class="home__hidden-input"
          @change="onFolderInputChange"
        />
      </div>
    </section>

    <!-- ── Recent folders ── -->
    <section v-if="history.length" class="recent">
      <div class="recent__header">
        <h3 class="recent__title">Recent</h3>
        <button class="recent__clear" @click="clearAllHistory">Clear</button>
      </div>
      <div class="recent__list">
        <button
          v-for="entry in history"
          :key="entry.handleKey"
          class="recent__item"
          :disabled="reopenBusy === entry.handleKey"
          @click="reopenFolder(entry)"
        >
          <svg class="recent__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
          </svg>
          <span class="recent__name">{{ entry.name }}</span>
          <span class="recent__time">{{ formatTimestamp(entry.timestamp) }}</span>
          <span
            class="recent__remove"
            role="button"
            tabindex="0"
            @click.stop="removeEntry(entry.handleKey)"
            @keydown.enter.prevent="removeEntry(entry.handleKey)"
            @keydown.space.prevent="removeEntry(entry.handleKey)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        </button>
      </div>
    </section>

    <!-- ── Quick Start: templates + sandbox ── -->
    <section class="quickstart">
      <h3 class="quickstart__title">Quick Start</h3>
      <p class="quickstart__desc">Choose a template to create a new model, or open the sandbox to explore the editor.</p>

      <div class="quickstart__grid">
        <button
          v-for="s in starters"
          :key="s.id"
          class="quickstart__card"
          :disabled="busy"
          @click="createFromStarter(s)"
        >
          <component :is="s.icon" class="quickstart__card-icon" />
          <span class="quickstart__card-name">{{ s.name }}</span>
          <span class="quickstart__card-desc">{{ s.description }}</span>
        </button>

        <button
          v-if="showSandbox"
          class="quickstart__card quickstart__card--sandbox"
          :disabled="sandboxBusy"
          @click="loadSandbox"
        >
          <FlaskConical class="quickstart__card-icon" />
          <span class="quickstart__card-name">Sandbox</span>
          <span class="quickstart__card-desc">Try a throwaway model instantly — nothing is saved.</span>
        </button>
      </div>
    </section>

    <!-- ── Sample models ── -->
    <section class="samples">
      <h3 class="samples__title">Explore Example Models</h3>
      <p class="samples__sub">See how iNNfo models work before creating your own.</p>
      <div class="samples__grid">
        <button
          v-for="s in samples"
          :key="s.id"
          class="sample-card"
          :disabled="urlBusy"
          @click="onSampleClick(s)"
        >
          <div class="sample-card__head">
            <svg class="sample-card__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
            </svg>
            <div class="sample-card__info">
              <span class="sample-card__name">{{ s.name }}</span>
            </div>
            <span class="sample-card__badge">{{ s.templateName }}</span>
          </div>
          <p class="sample-card__desc">{{ s.description }}</p>
          <span class="sample-card__action">{{ urlBusy ? 'Loading\u2026' : 'Explore \u2192' }}</span>
        </button>
      </div>
    </section>

    <!-- ── Load from URL ── -->
    <section class="community">
      <h3 class="community__title">Load from URL</h3>
      <p class="community__desc">
        Load any iNNfo model from a remote URL — community templates, your own models, or samples.
      </p>

      <div class="community__url">
        <input
          v-model="urlInput"
          type="url"
          placeholder="https://example.com/model_V_1-0-0_business_NN.md"
          class="community__input"
          @keydown.enter="loadFromUrl"
        />
        <button class="community__btn" :disabled="urlBusy || !urlInput.trim()" @click="loadFromUrl">
          {{ urlBusy ? 'Loading\u2026' : 'Load' }}
        </button>
      </div>

      <p class="community__docs">
        <BookOpen class="community__docs-icon" /> Learn how templates work in the
        <a :href="docsUrl" target="_blank" rel="noopener noreferrer">documentation</a>.
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1rem 5rem;
  font-family: system-ui, sans-serif;
}

/* ── Wizard overlay ── */

.home__wizard-scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  overflow-y: auto;
}

.home__wizard-wrap {
  position: relative;
  width: 100%;
  max-width: 680px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
}

.home__wizard-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.home__wizard-close:hover {
  color: #333;
  background: #f5f5f5;
}

/* ── Hero section ── */

.hero {
  width: 100%;
  max-width: 520px;
}

.hero__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 2.5rem 2rem;
  border: 2px solid #4d0e4e;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8f0f8 0%, #fff 100%);
  text-align: center;
  box-shadow: 0 4px 24px rgba(77, 14, 78, 0.10);
}

.hero__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #4d0e4e;
  letter-spacing: -0.01em;
}

.hero__desc {
  margin: 0;
  max-width: 380px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  border-radius: 12px;
  background: #4d0e4e;
  color: #fff;
  transition: all 0.15s;
  box-shadow: 0 4px 14px rgba(77, 14, 78, 0.25);
  font-family: system-ui, sans-serif;
  margin-top: 0.25rem;
}

.hero__btn:hover:not(:disabled) {
  background: #3a0b3b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(77, 14, 78, 0.35);
}

.hero__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.hero__btn--secondary {
  background: #fff;
  color: #4d0e4e;
  border: 2px solid #4d0e4e;
  box-shadow: none;
  font-size: 0.95rem;
  padding: 0.75rem 1.8rem;
}

.hero__btn--secondary:hover:not(:disabled) {
  background: #f8f0f8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(77, 14, 78, 0.12);
}

.hero__error {
  margin: 0;
  font-size: 13px;
  color: #b00020;
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  background: #fff0f0;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
}

.home__hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.hero__guide {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: system-ui, sans-serif;
  padding: 0.25rem;
  transition: color 0.15s;
}

.hero__guide:hover {
  color: #4d0e4e;
  text-decoration: underline;
}

/* ── Recent folders ── */

.recent {
  width: 100%;
  max-width: 860px;
}

.recent__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.recent__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}

.recent__clear {
  font-size: 12px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}

.recent__clear:hover {
  color: #4d0e4e;
}

.recent__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  font-family: system-ui, sans-serif;
  width: 100%;
  text-align: left;
  font-size: 14px;
}

.recent__item:hover:not(:disabled) {
  border-color: #4d0e4e;
  box-shadow: 0 1px 4px rgba(77, 14, 78, 0.06);
}

.recent__item:disabled {
  opacity: 0.5;
  cursor: default;
}

.recent__icon {
  flex-shrink: 0;
  color: #4d0e4e;
}

.recent__name {
  flex: 1;
  font-weight: 600;
  color: #333;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent__time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.recent__remove {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  border-radius: 4px;
}

.recent__item:hover .recent__remove {
  opacity: 1;
}

.recent__remove:hover {
  color: #c62828;
  background: #ffebee;
}

/* ── Quick Start grid ── */

.quickstart {
  width: 100%;
  max-width: 860px;
}

.quickstart__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}

.quickstart__desc {
  margin: 0 0 0.75rem;
  font-size: 14px;
  color: #888;
}

.quickstart__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

@media (max-width: 700px) {
  .quickstart__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 420px) {
  .quickstart__grid {
    grid-template-columns: 1fr;
  }
}

.quickstart__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  font-family: system-ui, sans-serif;
  width: 100%;
}

.quickstart__card:hover:not(:disabled) {
  border-color: #4d0e4e;
  box-shadow: 0 2px 8px rgba(77, 14, 78, 0.08);
}

.quickstart__card:disabled {
  opacity: 0.5;
  cursor: default;
}

.quickstart__card--sandbox {
  border-style: dashed;
}

.quickstart__card-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #4d0e4e;
  flex-shrink: 0;
}

.quickstart__card-name {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.quickstart__card-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.4;
}

/* ── Sample models ── */

.samples {
  width: 100%;
  max-width: 860px;
}

.samples__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}

.samples__sub {
  margin: 0 0 0.75rem;
  font-size: 14px;
  color: #888;
}

.samples__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}

@media (max-width: 700px) {
  .samples__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 420px) {
  .samples__grid {
    grid-template-columns: 1fr;
  }
}

.sample-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: system-ui, sans-serif;
  width: 100%;
}

.sample-card:hover {
  border-color: #4d0e4e;
  box-shadow: 0 2px 8px rgba(77, 14, 78, 0.08);
}

.sample-card__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sample-card__icon {
  flex-shrink: 0;
  color: #4d0e4e;
}

.sample-card__info {
  flex: 1;
  min-width: 0;
}

.sample-card__name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.sample-card__badge {
  font-family: monospace;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3e5f5;
  color: #4d0e4e;
  flex-shrink: 0;
}

.sample-card__desc {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}

.sample-card__action {
  font-size: 13px;
  font-weight: 600;
  color: #4d0e4e;
}

/* ── Sandbox banner ── */

.sandbox {
  width: 100%;
  max-width: 860px;
}

.sandbox__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  border: 2px solid #4d0e4e;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f0f8 0%, #fff 100%);
  text-align: center;
}

.sandbox__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #4d0e4e;
}

.sandbox__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #4d0e4e;
}

.sandbox__desc {
  margin: 0;
  max-width: 480px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.sandbox__btn {
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  background: #4d0e4e;
  color: #fff;
  border: none;
  font-family: system-ui, sans-serif;
  transition: all 0.15s;
}

.sandbox__btn:hover:not(:disabled) {
  background: #3a0b3b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(77, 14, 78, 0.25);
}

.sandbox__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Load from URL ── */

.community {
  width: 100%;
  max-width: 860px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
}

.community__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}

.community__desc {
  margin: 0 0 1rem;
  font-size: 14px;
  color: #888;
  line-height: 1.5;
}

.community__url {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.community__input {
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

.community__input:focus {
  border-color: #4d0e4e;
  box-shadow: 0 0 0 2px rgba(77, 14, 78, 0.1);
}

.community__btn {
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

.community__btn:hover:not(:disabled) {
  background: #3a0b3b;
}

.community__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.community__docs {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.community__docs-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.community__docs a {
  color: #4d0e4e;
  font-weight: 600;
  text-decoration: none;
}

.community__docs a:hover {
  text-decoration: underline;
}
</style>
