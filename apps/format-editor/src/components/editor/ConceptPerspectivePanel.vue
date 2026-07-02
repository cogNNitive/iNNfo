<template>
  <div class="space-y-2">
    <div
      v-if="!neighborhoods.length"
      class="text-muted-foreground text-xs italic text-center p-4"
    >
      This concept is not part of any perspective.
    </div>

    <div
      v-for="n in neighborhoods"
      :key="n.perspective.id"
      class="rounded-lg border border-border bg-background/60 p-2.5 space-y-1.5"
    >
      <!-- Perspective header -->
      <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <IconRenderer :icon="n.perspective.icon" custom-class="w-3 h-3 text-primary" />
        <span>{{ n.perspective.name }}</span>
      </div>

      <!-- Stacked tiers: parents ▲ / active ● / children ▼ -->
      <!-- Parent tier -->
      <div v-if="n.parents.length" class="perspective-tier">
        <span class="perspective-tier__label">Parent</span>
        <div class="flex items-center flex-wrap gap-1">
          <button
            v-for="p in n.parents"
            :key="'p-' + p"
            class="perspective-chip"
            @click="$emit('select', p)"
          >
            <IconRenderer :icon="iconFor(p)" custom-class="w-3 h-3 shrink-0 text-muted-foreground" />
            <span class="truncate">{{ p }}</span>
          </button>
        </div>
      </div>

      <!-- Connector -->
      <div v-if="n.parents.length" class="perspective-connector"></div>

      <!-- Active tier -->
      <div class="perspective-tier">
        <span class="perspective-tier__label perspective-tier__label--active">Active</span>
        <span class="perspective-chip perspective-chip--active">
          <IconRenderer :icon="iconFor(conceptName)" custom-class="w-3 h-3 shrink-0 text-primary" />
          <span class="truncate">{{ conceptName }}</span>
        </span>
      </div>

      <!-- Connector -->
      <div v-if="n.children.length" class="perspective-connector"></div>

      <!-- Children tier -->
      <div v-if="n.children.length" class="perspective-tier">
        <span class="perspective-tier__label">Children</span>
        <div class="flex items-center flex-wrap gap-1">
          <button
            v-for="c in n.children"
            :key="'c-' + c"
            class="perspective-chip"
            @click="$emit('select', c)"
          >
            <IconRenderer :icon="iconFor(c)" custom-class="w-3 h-3 shrink-0 text-muted-foreground" />
            <span class="truncate">{{ c }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModelStore } from '../../stores/modelStore';
import IconRenderer from './IconRenderer.vue';
import type { Perspective, PerspectiveNeighborhood } from '../../stores/types';

const props = defineProps<{
  conceptName: string;
}>();

defineEmits<{
  (e: 'select', name: string): void;
}>();

const modelStore = useModelStore();

// Derive perspectives from conceptBindings and localMetamodel on root node
const perspectives = computed<Perspective[]>(() => {
  const rootId = modelStore.rootIds[0];
  if (!rootId) return [];
  const root = modelStore.getNode(rootId);
  if (!root?.localMetamodel?.concepts) return [];

  // Build a simple default perspective from the concept hierarchy
  const conceptNames = root.localMetamodel.concepts.map(c => c.name);
  if (conceptNames.length === 0) return [];

  return [{
    id: 'default',
    name: 'Hierarchy',
    icon: 'layers',
    edges: conceptNames.slice(0, -1).map((parent, i) => ({
      parent,
      child: conceptNames[i + 1],
    })),
  }];
});

const iconFor = (name: string): string => {
  const rootId = modelStore.rootIds[0];
  if (!rootId) return '';
  const root = modelStore.getNode(rootId);
  if (!root?.localMetamodel?.concepts) return '';
  const concept = root.localMetamodel.concepts.find(c => c.name === name);
  return concept?.icon || '';
};

const neighborhoods = computed<PerspectiveNeighborhood[]>(() => {
  return perspectives.value.map(p => {
    const parents: string[] = [];
    const children: string[] = [];

    for (const edge of p.edges) {
      if (edge.child === props.conceptName) parents.push(edge.parent);
      if (edge.parent === props.conceptName) children.push(edge.child);
    }

    return { perspective: p, parents, children };
  });
});
</script>

<style scoped>
/* ── Tiers: each level (parent / active / children) is its own row ──── */
.perspective-tier {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.perspective-tier__label {
  flex-shrink: 0;
  width: 3.5rem;
  padding-top: 0.1875rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}
.perspective-tier__label--active {
  color: rgb(79 70 229);
}

/* Vertical connector linking the tiers, aligned under the labels */
.perspective-connector {
  width: 1px;
  height: 0.5rem;
  margin-left: 1.5rem;
  background: var(--border);
}

.perspective-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 11rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.125rem;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.perspective-chip:hover {
  background: var(--accent);
}
.perspective-chip--active {
  cursor: default;
  font-weight: 600;
  border-color: rgb(165 180 252);
  background: rgb(238 242 255);
  color: rgb(67 56 202);
}
</style>
