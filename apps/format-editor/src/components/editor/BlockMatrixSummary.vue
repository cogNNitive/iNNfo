<template>
  <div v-if="participations.length > 0" class="space-y-3">
    <div v-for="part in participations" :key="part.matrixName" class="space-y-1">
      <div
        v-for="cell in part.cells"
        :key="cell.counterpart"
        class="flex items-center gap-1.5 text-xs"
      >
        <BlockPill
          kind="instance"
          :concept-type="part.role === 'source' ? conceptName : counterpartConcept(part)"
          :name="part.role === 'source' ? blockName : cell.counterpart"
          :block-id="resolveBlockId(part.role === 'source' ? blockName : cell.counterpart)"
          class="shrink-0"
        />
        <span
          class="text-xs font-semibold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded cursor-pointer hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          @click="$emit('navigate-to-matrix', part.matrixIndex)"
        >
          {{ part.matrixName }}
        </span>
        <BlockPill
          kind="instance"
          :concept-type="part.role === 'source' ? counterpartConcept(part) : conceptName"
          :name="part.role === 'source' ? cell.counterpart : blockName"
          :block-id="resolveBlockId(part.role === 'source' ? cell.counterpart : blockName)"
          class="shrink-0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModelStore } from '../../stores/modelStore';
import BlockPill from './BlockPill.vue';

const props = defineProps<{
  blockName: string;
  conceptName: string;
}>();

defineEmits<{
  (e: 'navigate-to-matrix', matrixIndex: number): void;
}>();

const modelStore = useModelStore();
const MATRIX_DEFS_KEY = '__matrix_defs';

interface MatrixDef {
  name: string;
  source: string;
  target: string;
  widgetType: string;
  params: string;
  label?: string;
}

interface Participation {
  matrixName: string;
  matrixIndex: number;
  role: 'source' | 'target';
  cells: { counterpart: string; value: string | number | boolean }[];
}

const rootNode = computed(() => {
  if (modelStore.rootIds.length === 0) return null;
  return modelStore.getNode(modelStore.rootIds[0]);
});

const matrixDefs = computed<MatrixDef[]>(() => {
  const root = rootNode.value;
  if (!root) return [];
  const field = root.fields[MATRIX_DEFS_KEY];
  if (!field?.value) return [];
  return field.value as MatrixDef[];
});

const participations = computed<Participation[]>(() => {
  const root = rootNode.value;
  if (!root) return [];

  const result: Participation[] = [];

  matrixDefs.value.forEach((def, idx) => {
    let role: 'source' | 'target' | null = null;
    if (def.source === props.conceptName) role = 'source';
    else if (def.target === props.conceptName) role = 'target';
    if (!role) return;

    const counterpartType = role === 'source' ? def.target : def.source;
    const nodesOfType = Object.values(modelStore.nodes).filter(n => n.type === counterpartType);
    const ownTypeNodes = Object.values(modelStore.nodes).filter(n => n.type === props.conceptName);

    const cells: { counterpart: string; value: string | number | boolean }[] = [];

    for (const ownNode of ownTypeNodes) {
      for (const counterNode of nodesOfType) {
        const key = `${def.name}||${role === 'source' ? ownNode.name : counterNode.name}||${role === 'source' ? counterNode.name : ownNode.name}`;
        const field = root.fields[key];
        const val = field?.value as string | number | boolean | undefined;
        if (val !== undefined && val !== null && val !== '-') {
          cells.push({
            counterpart: counterNode.name,
            value: val,
          });
        }
      }
    }

    if (cells.length > 0) {
      result.push({ matrixName: def.name, matrixIndex: idx, role, cells });
    }
  });

  return result;
});

const getMatrixMeta = (matrixName: string) => matrixDefs.value.find(m => m.name === matrixName);

const counterpartConcept = (part: { role: 'source' | 'target'; matrixName: string }) => {
  const m = getMatrixMeta(part.matrixName);
  if (!m) return '';
  return part.role === 'source' ? m.target : m.source;
};

const resolveBlockId = (name: string): string | undefined => {
  const node = Object.values(modelStore.nodes).find(n => n.name === name);
  return node?.id;
};
</script>
