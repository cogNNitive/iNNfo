<script setup lang="ts">
import { computed } from 'vue'
import type { ScannedFolder, ScannedItem, ValidationReport as ValidationReportType } from '../types'
import ValidationReport from './ValidationReport.vue'

const props = defineProps<{
  folder: ScannedFolder
}>()

const baseFileUrl = import.meta.env.VITE_FILE_FORMAT_URL ?? 'http://localhost:5175'
const baseFolderUrl = import.meta.env.VITE_FOLDER_FORMAT_URL ?? 'http://localhost:5174'

const folders = computed(() => props.folder.items.filter(i => i.kind === 'folder'))
const documents = computed(() => props.folder.items.filter(i => i.kind === 'file'))

function openApp(item: ScannedItem) {
  if (item.kind === 'folder') {
    const url = new URL(baseFolderUrl)
    url.searchParams.set('folder', item.relativePath)
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  } else {
    const url = new URL(baseFileUrl)
    url.searchParams.set('file', item.relativePath)
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }
}

function statusClass(item: ScannedItem): string {
  if (!item.compliant) return 'card--muted'
  if (item.validation && item.validation.summary.errors > 0) return 'card--warn'
  return 'card--ok'
}

function statusLabel(item: ScannedItem): string {
  if (!item.compliant) return ''
  return item.mode || 'FORMAT'
}

function hasIssues(report: ValidationReportType): boolean {
  return report.summary.errors > 0 || report.summary.warnings > 0
}
</script>

<template>
  <div class="explorer">
    <!-- Root header -->
    <div class="explorer__root">
      <div class="explorer__root-head">
        <svg class="explorer__root-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
        </svg>
        <div class="explorer__root-info">
          <h2 class="explorer__root-name">{{ folder.name }}</h2>
          <p v-if="folder.rootFormat && folder.rootMode" class="explorer__root-meta">
            {{ folder.rootMode }} &middot; {{ folder.rootTitle || 'Model' }}
          </p>
          <p v-else class="explorer__root-meta explorer__root-meta--warn">
            No root _FORMAT.md
          </p>
        </div>
      </div>
      <ValidationReport v-if="folder.rootValidation" :report="folder.rootValidation" />
      <div v-for="err in folder.rootErrors" :key="err" class="root-error">{{ err }}</div>
    </div>

    <!-- Folders -->
    <section v-if="folders.length" class="explorer__section">
      <h3 class="explorer__section-title">
        Folders
        <span class="explorer__section-count">{{ folders.length }}</span>
      </h3>
      <div class="explorer__grid">
        <div
          v-for="item in folders"
          :key="item.relativePath"
          class="explorer__item"
        >
          <button
            class="card"
            :class="[statusClass(item), 'card--folder']"
            @click="openApp(item)"
          >
            <svg class="card__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
            </svg>
            <div class="card__body">
              <span class="card__title">{{ item.title || item.name }}</span>
              <span class="card__name">{{ item.name }}</span>
            </div>
            <span v-if="item.compliant" class="card__badge badge--folder">{{ statusLabel(item) }}</span>
          </button>
          <ValidationReport v-if="item.validation && hasIssues(item.validation)" :report="item.validation" />
        </div>
      </div>
    </section>

    <!-- Documents -->
    <section v-if="documents.length" class="explorer__section">
      <h3 class="explorer__section-title">
        Documents
        <span class="explorer__section-count">{{ documents.length }}</span>
      </h3>
      <div class="explorer__list">
        <div
          v-for="item in documents"
          :key="item.relativePath"
          class="explorer__item"
        >
          <button
            class="card"
            :class="[statusClass(item), 'card--file']"
            @click="openApp(item)"
          >
            <svg class="card__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6"/>
            </svg>
            <div class="card__body">
              <span class="card__title">{{ item.title || item.name.replace('.md', '') }}</span>
              <span class="card__name">{{ item.name }}</span>
            </div>
            <span v-if="item.compliant" class="card__badge badge--file">{{ statusLabel(item) }}</span>
          </button>
          <ValidationReport v-if="item.validation && hasIssues(item.validation)" :report="item.validation" />
        </div>
      </div>
    </section>

    <!-- Empty -->
    <div v-if="!folder.rootFormat && !folder.items.length" class="explorer__empty">
      <p>This folder contains no FORMAT models or documents.</p>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* ── Root header ── */

.explorer__root {
  margin-bottom: var(--space-xl);
}

.explorer__root-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.explorer__root-icon {
  flex-shrink: 0;
  color: var(--brand-primary);
}

.explorer__root-info {
  flex: 1;
  min-width: 0;
}

.explorer__root-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink-primary);
}

.explorer__root-meta {
  font-size: 13px;
  color: var(--ink-muted);
  margin-top: 2px;
}

.explorer__root-meta--warn {
  color: #8D6E00;
}

.root-error {
  font-size: 13px;
  color: #C62828;
  background: #FFEBEE;
  padding: var(--space-sm) var(--space-md);
  border-radius: 6px;
  margin-bottom: var(--space-xs);
}

/* ── Section ── */

.explorer__section {
  margin-bottom: var(--space-xl);
}

.explorer__section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.explorer__section-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-muted);
  background: var(--canvas-inert);
  padding: 1px 8px;
  border-radius: 10px;
}

/* ── Folder grid ── */

.explorer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-sm);
}

.explorer__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.explorer__item {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.explorer__item .validation-report {
  margin-top: 0;
  padding: var(--space-sm) var(--space-md);
  background: var(--canvas-inert);
  border-radius: 0 0 var(--radius) var(--radius);
  border: 1px solid var(--border-soft);
  border-top: none;
}

/* ── Card ── */

.card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  background: var(--canvas-base);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: var(--sans);
  width: 100%;
}

.card:hover {
  border-color: var(--brand-primary);
  box-shadow: 0 2px 8px rgba(77, 14, 78, 0.08);
}

.card--folder {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.card--file {
  gap: var(--space-md);
}

.card--muted {
  opacity: 0.6;
}

.card--warn {
  border-color: #FFD54F;
}

.card__icon {
  flex-shrink: 0;
  color: var(--brand-primary);
}

.card--muted .card__icon {
  color: var(--ink-muted);
}

.card__body {
  flex: 1;
  min-width: 0;
}

.card__title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-primary);
  line-height: 1.3;
}

.card__name {
  display: block;
  font-size: 12px;
  color: var(--ink-muted);
  font-family: var(--mono);
  margin-top: 2px;
}

.card__badge {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.badge--folder {
  background: #F3E5F5;
  color: var(--brand-primary);
}

.badge--file {
  background: #E8EAF6;
  color: #283593;
}

/* ── Empty state ── */

.explorer__empty {
  text-align: center;
  padding: var(--space-xxl) 0;
  color: var(--ink-muted);
}
</style>
