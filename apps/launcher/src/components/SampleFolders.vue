<script setup lang="ts">
import type { SampleFolder } from '../types'

const emit = defineEmits<{
  openExample: [sample: SampleFolder]
}>()

const samples: SampleFolder[] = [
  {
    id: 'sample-kb',
    name: 'cogNNitive Sample',
    description: 'FOLDER-mode KB template with Architecture, Development, and Specifications nodes — demonstrates both FOLDER and FILE modes working together.',
    mode: 'FOLDER',
    path: 'sample/',
    items: 4,
  },
  {
    id: 'models',
    name: 'FORMAT Models',
    description: 'Collection of FILE-mode FORMAT model definitions — business templates, procedures, and knowledge base structures showing real-world model composition.',
    mode: 'FILE',
    path: 'models/',
    items: 8,
  },
]
</script>

<template>
  <section class="samples">
    <h3 class="samples__title">Example models</h3>
    <p class="samples__sub">Open a FORMAT folder to explore, or try one of these samples from the repository.</p>
    <div class="samples__grid">
      <button
        v-for="s in samples"
        :key="s.id"
        class="sample-card"
        @click="emit('openExample', s)"
      >
        <div class="sample-card__head">
          <svg class="sample-card__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
          </svg>
          <div class="sample-card__info">
            <span class="sample-card__name">{{ s.name }}</span>
            <span class="sample-card__meta">{{ s.mode }} &middot; {{ s.items }} items</span>
          </div>
          <span class="sample-card__badge">{{ s.mode }}</span>
        </div>
        <p class="sample-card__desc">{{ s.description }}</p>
        <span class="sample-card__action">Open folder &rarr;</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.samples {
  max-width: var(--max-width);
  margin: var(--space-xl) auto 0;
  padding: 0 var(--space-lg);
}

.samples__title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  margin-bottom: 4px;
}

.samples__sub {
  font-size: 14px;
  color: var(--ink-muted);
  margin-bottom: var(--space-md);
}

.samples__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .samples__grid {
    grid-template-columns: 1fr;
  }
}

.sample-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  background: var(--canvas-base);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: var(--sans);
  width: 100%;
}

.sample-card:hover {
  border-color: var(--brand-primary);
  box-shadow: 0 2px 8px rgba(77, 14, 78, 0.08);
}

.sample-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.sample-card__icon {
  flex-shrink: 0;
  color: var(--brand-primary);
}

.sample-card__info {
  flex: 1;
  min-width: 0;
}

.sample-card__name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-primary);
}

.sample-card__meta {
  display: block;
  font-size: 12px;
  color: var(--ink-muted);
  font-family: var(--mono);
  margin-top: 1px;
}

.sample-card__badge {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 4px;
  background: #F3E5F5;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.sample-card__desc {
  font-size: 13px;
  color: var(--ink-muted);
  line-height: 1.5;
}

.sample-card__action {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-primary);
}
</style>
