<template>
  <div v-if="hasAnyRelationships" class="space-y-3">
    <!-- Incoming Relationships: "Referenced by" -->
    <div v-if="incomingRelationships.length > 0">
      <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <ArrowDownToLine class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        Referenced by
      </h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="ref in incomingRelationships"
          :key="ref.nodeId || ref.name"
          @click="navigateToBlock(ref)"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer hover:scale-[1.02]"
          :class="chipClasses"
          :title="ref.fieldName ? `Via field: ${ref.fieldName}` : 'Via relationship in model'"
        >
          <GitBranch class="w-3 h-3 opacity-60" />
          <span class="truncate max-w-[120px]">{{ ref.name }}</span>
        </button>
      </div>
    </div>

    <!-- Outgoing Relationships: "References" -->
    <div v-if="outgoingRelationships.length > 0">
      <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <ArrowUpFromLine class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        References
      </h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="link in outgoingRelationships"
          :key="link"
          @click="navigateByName(link)"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer hover:scale-[1.02]"
          :class="chipClasses"
        >
          <GitBranch class="w-3 h-3 opacity-60" />
          <span class="truncate max-w-[120px]">{{ link }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDownToLine, ArrowUpFromLine, GitBranch } from 'lucide-vue-next';
import { useModelStore } from '../../stores/modelStore';
import type { BlockData } from '../../stores/types';

const props = defineProps<{
  block: BlockData;
  conceptName: string;
  conceptColor?: string;
}>();

const emit = defineEmits<{
  (e: 'select-node', nodeId: string): void;
}>();

const modelStore = useModelStore();

// ── Extract wikilinks from text ──
function extractWikiLinks(text: string): string[] {
  if (!text) return [];
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return links;
}

// ── Outgoing relationships: from this block's description + ModelNode.relationships ──
const outgoingRelationships = computed(() => {
  const links = new Set<string>();

  // From ModelNode.relationships[] on this node
  if (props.block.id) {
    const node = modelStore.getNode(props.block.id);
    if (node?.relationships) {
      for (const rel of node.relationships) {
        const targetNode = modelStore.getNode(rel.targetId);
        if (targetNode) links.add(targetNode.name);
      }
    }
  }

  // From description wikilinks
  if (props.block.description) {
    extractWikiLinks(props.block.description).forEach(link => links.add(link));
  }

  // From reference-type fields (stored as FieldValue wrappers)
  if (props.block.fields) {
    for (const [fieldKey, fieldVal] of Object.entries(props.block.fields)) {
      if (typeof fieldVal === 'string') {
        // Direct string value in block data
        links.add(fieldVal);
      } else if (fieldVal && typeof fieldVal === 'object' && 'value' in fieldVal) {
        // FieldValue wrapper
        const v = (fieldVal as { value: unknown }).value;
        if (typeof v === 'string') links.add(v);
      }
    }
  }

  return Array.from(links);
});

// ── Incoming relationships: nodes that reference this block ──
const incomingRelationships = computed(() => {
  const references: Array<{ nodeId: string; name: string; fieldName?: string }> = [];
  const blockName = props.block.name;
  const blockId = props.block.id;

  for (const node of Object.values(modelStore.nodes)) {
    // Skip self
    if (node.id === blockId || node.name === blockName) continue;

    // Check ModelNode.relationships for targets matching this block
    if (node.relationships) {
      for (const rel of node.relationships) {
        if (rel.targetId === blockId || rel.targetId === blockName) {
          if (!references.some(r => r.nodeId === node.id && !r.fieldName)) {
            references.push({ nodeId: node.id, name: node.name });
          }
        }
      }
    }

    // Check description for wikilinks
    if (node.rawContent) {
      const links = extractWikiLinks(node.rawContent);
      if (links.some(l => l === blockName || l === node.name)) {
        if (!references.some(r => r.nodeId === node.id && !r.fieldName)) {
          references.push({ nodeId: node.id, name: node.name });
        }
      }
    }
  }

  return references;
});

// Hide section if no relationships at all
const hasAnyRelationships = computed(() => {
  return outgoingRelationships.value.length > 0 || incomingRelationships.value.length > 0;
});

// Dynamic chip styling based on concept color (fallback to indigo)
const chipClasses = computed(() => {
  const base = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  const hover = 'hover:border-primary/60 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10';
  return `${base} ${hover}`;
});

// Navigate to a block by clicking its chip
const navigateToBlock = (ref: { nodeId: string; name: string }) => {
  if (ref.nodeId) {
    emit('select-node', ref.nodeId);
  }
};

// Navigate to a block by name (for outgoing links that may be in different concepts)
const navigateByName = (name: string) => {
  const node = Object.values(modelStore.nodes).find(n => n.name === name);
  if (node) {
    emit('select-node', node.id);
  }
};
</script>
