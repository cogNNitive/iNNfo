<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadHistory, removeFromHistory, clearHistory, formatTimestamp } from '../utils/history'
import type { FolderHistoryEntry } from '../types'

const emit = defineEmits<{
  reopen: [path: string]
}>()

const history = ref<FolderHistoryEntry[]>([])

onMounted(() => refresh())

function refresh() {
  history.value = loadHistory()
}

function remove(path: string) {
  removeFromHistory(path)
  refresh()
}

function clear() {
  clearHistory()
  refresh()
}
</script>

<template>
  <section v-if="history.length" class="recent">
    <div class="recent__header">
      <h3 class="recent__title">Recent</h3>
      <button class="recent__clear" @click="clear">Clear</button>
    </div>
    <div class="recent__list">
      <button
        v-for="entry in history"
        :key="entry.name"
        class="recent__item"
        @click="emit('reopen', entry.path)"
      >
        <svg class="recent__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
        </svg>
        <span class="recent__name">{{ entry.name }}</span>
        <span class="recent__time">{{ formatTimestamp(entry.timestamp) }}</span>
        <button class="recent__remove" @click.stop="remove(entry.path)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </button>
    </div>
  </section>
</template>

<style scoped>
.recent {
  max-width: var(--max-width);
  margin: var(--space-xl) auto 0;
  padding: 0 var(--space-lg);
}

.recent__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.recent__title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
}

.recent__clear {
  font-size: 12px;
  color: var(--ink-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
}

.recent__clear:hover {
  color: var(--brand-primary);
}

.recent__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  background: var(--canvas-base);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--sans);
  width: 100%;
  text-align: left;
  font-size: 14px;
}

.recent__item:hover {
  border-color: var(--brand-primary);
  box-shadow: 0 1px 4px rgba(77, 14, 78, 0.06);
}

.recent__icon {
  flex-shrink: 0;
  color: var(--brand-primary);
}

.recent__name {
  flex: 1;
  font-weight: 600;
  color: var(--ink-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent__time {
  font-size: 12px;
  color: var(--ink-muted);
  flex-shrink: 0;
}

.recent__remove {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink-muted);
  padding: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  border-radius: 4px;
}

.recent__item:hover .recent__remove {
  opacity: 1;
}

.recent__remove:hover {
  color: #C62828;
  background: #FFEBEE;
}
</style>
