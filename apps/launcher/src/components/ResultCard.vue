<script setup lang="ts">
import { computed } from 'vue'
import type { DetectionResult } from '../types'
import ValidationReport from './ValidationReport.vue'
import { useAppUrls } from '../composables/useAppUrls'

const props = defineProps<{
  result: DetectionResult
}>()

const { fileUrl, folderUrl } = useAppUrls()

const fileFormatUrl = computed(() => fileUrl(props.result.fileName ?? ''))
const folderFormatUrl = computed(() => folderUrl(props.result.folderName ?? ''))

const stateLabels: Record<string, { label: string; kind: 'success' | 'error' | 'info' }> = {
  FILE: { label: 'FILE', kind: 'success' },
  FOLDER: { label: 'FOLDER', kind: 'success' },
  BOTH: { label: 'FILE + FOLDER', kind: 'success' },
  NONE: { label: 'NO MODE', kind: 'error' },
}

const meta = computed(() => stateLabels[props.result.mode] ?? stateLabels.NONE)
</script>

<template>
  <div class="result-card">
    <div class="result-card__header">
      <span class="badge" :class="`badge--${meta.kind}`">{{ meta.label }}</span>
      <span v-if="result.version" class="result-card__version">{{ result.version }}</span>
    </div>

    <h2 class="result-card__title">{{ result.title }}</h2>

    <p v-if="result.template" class="result-card__meta">
      Specification: <strong>{{ result.template }}</strong>
    </p>

    <div v-if="result.errors.length" class="result-card__errors">
      <p v-for="err in result.errors" :key="err" class="error-msg">{{ err }}</p>
    </div>

    <ValidationReport
      v-if="result.validation"
      :report="result.validation"
    />

    <div v-if="result.mode !== 'NONE'" class="result-card__actions">
      <a
        v-if="result.mode === 'FILE' || result.mode === 'BOTH'"
        :href="fileFormatUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--primary"
      >
        Open in <strong>file-format</strong>
      </a>
      <a
        v-if="result.mode === 'FOLDER' || result.mode === 'BOTH'"
        :href="folderFormatUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--secondary"
      >
        Open in <strong>folder-format</strong>
      </a>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  background: var(--canvas-base);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: var(--space-lg);
}

.result-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.badge {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px var(--space-sm);
  border-radius: 4px;
}

.badge--success {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge--error {
  background: #FFEBEE;
  color: #C62828;
}

.badge--info {
  background: var(--canvas-inert);
  color: var(--ink-muted);
}

.result-card__version {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-muted);
}

.result-card__title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.result-card__meta {
  font-size: 13px;
  color: var(--ink-muted);
  margin-bottom: var(--space-md);
}

.result-card__errors {
  margin-bottom: var(--space-md);
}

.error-msg {
  font-size: 13px;
  color: #C62828;
  background: #FFEBEE;
  padding: var(--space-sm) var(--space-md);
  border-radius: 6px;
  margin-bottom: var(--space-xs);
}

.result-card__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.btn {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn--primary {
  background: var(--brand-primary);
  color: white;
  border: 2px solid var(--brand-primary);
}

.btn--primary:hover {
  opacity: 0.9;
}

.btn--secondary {
  background: transparent;
  color: var(--brand-primary);
  border: 2px solid var(--brand-primary);
}

.btn--secondary:hover {
  background: var(--brand-primary);
  color: white;
}
</style>
