<template>
  <div
    class="rounded-lg bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 flex flex-col relative border border-slate-200 dark:border-slate-700"
  >
    <!-- Header: concept label + markers + controls -->
    <div
      class="flex items-center rounded-lg px-3 py-2.5 transition-all duration-150 gap-2 select-none text-slate-700 dark:text-slate-300"
    >
      <!-- Title: icon + name(s) -->
      <div class="flex items-center gap-1.5 min-w-0 flex-1">
        <template v-if="kind === 'concept'">
          <IconRenderer
            :icon="conceptIcon || 'layers'"
            custom-class="w-5 h-5 shrink-0"
            :class="[palette.text]"
          />
          <span class="font-bold text-2xl truncate" :class="[palette.text]">{{ cleanConceptName }}</span>
          <span class="font-normal text-sm text-slate-500 dark:text-slate-400 shrink-0">({{ conceptType }})</span>
        </template>
        <template v-else>
          <IconRenderer
            :icon="conceptIcon || 'layers'"
            custom-class="w-4 h-4 shrink-0"
            :class="[palette.text]"
          />
          <span class="font-bold text-sm" :class="[palette.text]">{{ cleanConceptName }}</span>
          <span class="text-slate-300 dark:text-slate-600 mx-0.5">:</span>
          <button
            v-if="!isEditing"
            @click.stop="navigateToInstance"
            class="font-semibold text-2xl text-slate-800 dark:text-slate-200 hover:text-primary hover:underline transition-colors cursor-pointer text-left truncate min-w-0"
            :title="block.name || '(Empty)'"
          >
            {{ block.name || '(Empty)' }}
          </button>
          <input
            v-else
            :value="block.name"
            @input="onNameInput"
            class="flex-1 border border-slate-200 dark:border-slate-600 rounded-md p-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-w-0"
            placeholder="Enter block name"
          >
        </template>
      </div>

      <!-- Marker cycling toolbar -->
      <template v-if="hasMarkers && block.id">
        <component
          v-for="marker in allMarkers"
          :key="marker.name"
          :is="getMarkerIcon(marker.name)"
          @click.stop="cycleMarker(marker.name)"
          class="cursor-pointer"
          :class="markerClassesFor(marker.name)"
        />
        <span class="w-px h-3.5 bg-current/20 mx-0.5"></span>
      </template>

      <!-- Add child -->
      <button
        v-if="showAddChild"
        @click.stop="$emit('add-child')"
        aria-label="Add child"
        class="p-0.5 hover:bg-current/10 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
      >
        <PlusCircle class="w-3.5 h-3.5" />
      </button>

      <!-- Reorder controls -->
      <template v-if="showReorder">
        <button
          @click.stop="$emit('move-up')"
          :disabled="isFirst"
          aria-label="Move up"
          class="p-0.5 hover:bg-current/10 disabled:opacity-20 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowUp class="w-3 h-3" />
        </button>
        <button
          @click.stop="$emit('move-down')"
          :disabled="isLast"
          aria-label="Move down"
          class="p-0.5 hover:bg-current/10 disabled:opacity-20 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowDown class="w-3 h-3" />
        </button>
      </template>

      <!-- Pencil edit button -->
      <button
        @click.stop="$emit('edit-toggle')"
        aria-label="Edit"
        class="p-0.5 hover:bg-current/10 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
        :class="isEditing ? 'text-current' : 'text-current/60'"
      >
        <component :is="isEditing ? Check : Pencil" class="w-3.5 h-3.5" />
      </button>

      <!-- Delete -->
      <button
        v-if="showDelete"
        @click.stop="$emit('delete')"
        aria-label="Delete"
        class="p-0.5 text-current/50 hover:text-rose-600 hover:scale-105 active:scale-95 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>

      <!-- Chevron expand/collapse (far right) -->
      <button
        v-if="!disableExpand"
        @click.stop="$emit('update:collapsed', !collapsed)"
        aria-label="Toggle expand"
        class="p-0.5 hover:bg-current/10 rounded transition-colors cursor-pointer flex items-center justify-center shrink-0"
      >
        <ChevronDown
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ '-rotate-90': collapsed }"
        />
      </button>
    </div>

    <!-- Expandable body / edit form -->
    <div
      v-show="(!collapsed && !disableExpand) || isEditing"
      class="overflow-hidden transition-all duration-300"
    >
      <div class="px-3 pb-4 pt-2 space-y-6 flex flex-col">

        <!-- Edit-mode field inputs -->
        <template v-if="isEditing">
          <div v-if="conceptFields && conceptFields.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="field in conceptFields" :key="field.name" class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ field.name.replace(/_/g, ' ') }}</label>
              <WidgetField
                :node-id="blockIdForFields"
                :field-key="field.name"
                :widget-type="field.type || 'string'"
                :field-definition="field"
              />
            </div>
          </div>

          <!-- Description textarea -->
          <div class="flex flex-col min-h-[100px]">
            <label class="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description / Details</label>
            <textarea
              :value="block.description"
              @input="onInput"
              rows="4"
              class="w-full mt-1 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none flex-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              placeholder="Enter description (supports basic markdown)..."
            ></textarea>
          </div>
        </template>

        <!-- Read-mode expanded body -->
        <template v-else>
          <!-- Content section -->
          <div v-if="renderedDescription" class="border-t border-slate-200 dark:border-slate-700 pt-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
              Content
            </div>
            <div
              class="prose prose-slate max-w-none text-lg text-slate-600 dark:text-slate-300 leading-relaxed break-words bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
              v-html="renderedDescription"
            ></div>
          </div>

          <!-- Element fields section -->
          <div v-if="hasVisibleFields" class="border-t border-slate-200 dark:border-slate-700 pt-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
              Fields
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4 space-y-2">
              <div
                v-for="field in visibleFields"
                :key="field.name"
                class="flex items-start gap-2 text-sm"
              >
                <span class="font-semibold text-slate-500 dark:text-slate-400 shrink-0 min-w-[100px] uppercase tracking-wide">{{ field.name.replace(/_/g, ' ') }}</span>
                <span v-if="field.isWikiLink" class="text-indigo-600 underline decoration-dotted">[[{{ field.value }}]]</span>
                <span v-else class="text-slate-700 dark:text-slate-300">{{ field.value }}</span>
              </div>
            </div>
          </div>

          <!-- Relationships section (placeholder — Phase 5 will replace with BlockRelationships) -->
          <div v-if="hasRelationships" class="border-t border-slate-200 dark:border-slate-700 pt-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 rounded-full bg-slate-400 shrink-0"></span>
              Relationships
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4">
              <div
                v-for="rel in relationshipsList"
                :key="rel.targetId"
                class="flex items-center gap-2 text-sm py-1"
              >
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ rel.label }}:</span>
                <button
                  class="text-primary hover:underline cursor-pointer text-left"
                  @click="navigateToNode(rel.targetId)"
                >
                  {{ rel.targetId }}
                </button>
              </div>
              <p v-if="relationshipsList.length === 0" class="text-xs text-slate-400 italic">No relationships defined.</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, ArrowUp, ArrowDown, Pencil, Check, Trash2, PlusCircle } from 'lucide-vue-next';
import IconRenderer from './IconRenderer.vue';
import WidgetField from '../../shared/widgets/WidgetField.vue';
import { getMarkerIcon, getMarkerClasses } from './MarkerIcons';
import { renderInlineMarkdown } from '../../utils/renderMarkdown';
import { useModelStore } from '../../stores/modelStore';
import { commitFieldValue, commitMarkerValue } from '../../shared/provenance';
import { MARKER_CYCLE_COUNT } from '../../utils/constants';
import { getColorClasses } from '../../utils/colors';
import type { BlockKind } from '../../utils/conceptVisuals';

const props = withDefaults(defineProps<{
  block: { id?: string; name: string; description: string; fields?: Record<string, any> };
  kind: BlockKind;
  conceptType: string;
  conceptName: string;
  conceptFields?: any[];
  conceptColor?: string;
  conceptIcon?: string;
  collapsed: boolean;
  isEditing: boolean;
  disableExpand?: boolean;
  hasMarkers?: boolean;
  showDelete?: boolean;
  showReorder?: boolean;
  showAddChild?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}>(), {
  conceptFields: () => [],
  conceptColor: '',
  conceptIcon: '',
  disableExpand: false,
  hasMarkers: false,
  showDelete: false,
  showReorder: false,
  showAddChild: false,
  isFirst: false,
  isLast: false,
});

const emit = defineEmits<{
  'update:collapsed': [val: boolean];
  'edit-toggle': [];
  'move-up': [];
  'move-down': [];
  'delete': [];
  'add-child': [];
  'change': [];
  'update:field': [fieldName: string, value: unknown];
  'navigate-to-node': [nodeId: string];
}>();

const modelStore = useModelStore();

const palette = computed(() => getColorClasses(props.conceptColor));

// ── Markers (hardcoded default list until Phase 6 metamodel adapter) ──
const allMarkers = computed(() => {
  return [
    { name: 'completion', icon: 'check-circle', color: 'emerald' },
    { name: 'certainty', icon: 'help-circle', color: 'blue' },
    { name: 'priority', icon: 'flag', color: 'rose' },
    { name: 'rating', icon: 'star', color: 'amber' },
    { name: 'weight', icon: 'scale', color: 'indigo' },
  ];
});

const getMarkerScore = (markerName: string): number => {
  if (!props.block.id) return 0;
  const node = modelStore.getNode(props.block.id);
  if (!node?.markers) return 0;
  return (node.markers[markerName] as number) ?? 0;
};

const cycleMarker = (markerName: string) => {
  const id = props.block.id;
  if (!id) return;
  const current = getMarkerScore(markerName);
  commitMarkerValue(modelStore, id, markerName, (current + 1) % MARKER_CYCLE_COUNT);
  emit('change');
};

const markerClassesFor = (markerName: string) =>
  getMarkerClasses(markerName, getMarkerScore(markerName));

const cleanConceptName = computed(() => {
  const name = props.conceptName;
  return name.endsWith('s') ? name.slice(0, -1) : name;
});

// Strip everything from the first _F marker onwards
function stripBlockDefinitions(text: string): string {
  const blockPattern = /^[ \t]*(?:[-*+]|\d+\.)?[ \t]*_F\s+[\w\s-]+?:/m;
  const idx = text.search(blockPattern);
  if (idx === -1) return text;
  return text.substring(0, idx).trim();
}

const renderedDescription = computed(() => {
  const text = props.kind === 'concept'
    ? stripBlockDefinitions(props.block.description)
    : props.block.description;
  const html = renderInlineMarkdown(text);
  return html;
});

const visibleFields = computed(() => {
  if (!props.conceptFields || !props.block.fields) return [];
  return props.conceptFields
    .map((field: any) => {
      const val = props.block.fields?.[field.name];
      if (val === undefined || val === '' || val === null || val === false) return null;
      const isReference = field.type === 'reference';
      return {
        name: field.name,
        value: typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val,
        isWikiLink: isReference,
      };
    })
    .filter((f: { name: string; value: any; isWikiLink: boolean } | null): f is { name: string; value: any; isWikiLink: boolean } => f !== null);
});

const hasVisibleFields = computed(() => visibleFields.value.length > 0);

// The nodeId used for WidgetField field reads/writes
const blockIdForFields = computed(() => props.block.id || '');

// Relationships read from modelStore
const hasRelationships = computed(() => {
  if (!props.block.id) return false;
  const node = modelStore.getNode(props.block.id);
  return node && node.relationships && node.relationships.length > 0;
});

const relationshipsList = computed(() => {
  if (!props.block.id) return [];
  const node = modelStore.getNode(props.block.id);
  return node?.relationships ?? [];
});

const navigateToNode = (targetId: string) => {
  emit('navigate-to-node', targetId);
};

const navigateToInstance = () => {
  if (!props.block.name || !props.conceptName) return;
  emit('navigate-to-node', props.block.name);
  emit('update:collapsed', false);
};

const onInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  props.block.description = textarea.value;
  modelStore.markDirty(props.block.id || '');
  emit('change');
};

const onNameInput = (event: Event) => {
  const newName = (event.target as HTMLInputElement).value;
  props.block.name = newName;
  if (props.block.id) {
    // Upsert the node with updated name
    const existing = modelStore.getNode(props.block.id);
    if (existing) {
      modelStore.upsertNode({ ...existing, name: newName });
    }
  }
  modelStore.markDirty(props.block.id || '');
  emit('change');
};
</script>
