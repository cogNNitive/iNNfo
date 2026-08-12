<template>
  <div data-testid="field-schema-view" class="field-schema-view">
    <div
      v-for="def in fieldDefinitions"
      :key="def.name"
      data-testid="field-schema-entry"
      class="py-2.5 first:pt-0 last:pb-0 border-b border-slate-100 dark:border-slate-700/60 last:border-b-0"
    >
      <!-- Field name + type badge -->
      <div class="flex items-center justify-between gap-3">
        <span
          class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 break-all"
          >{{ def.name }}</span
        >
        <span
          data-testid="field-type-badge"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0"
          :class="typeBadgeClass(def.type)"
        >
          {{ def.type }}
        </span>
      </div>

      <!-- Metadata groups: only render groups that carry data -->
      <div v-if="hasMetadata(def)" class="mt-2 flex flex-col gap-1.5">
        <div v-if="def.options && def.options.length > 0" class="flex items-start gap-2">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-14 shrink-0 pt-0.5"
            >Options</span
          >
          <div class="flex flex-wrap gap-1">
            <span
              v-for="opt in def.options"
              :key="opt"
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
            >
              {{ opt }}
            </span>
          </div>
        </div>

        <div
          v-if="def.target_concepts && def.target_concepts.length > 0"
          class="flex items-start gap-2"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-14 shrink-0 pt-0.5"
            >Targets</span
          >
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in def.target_concepts"
              :key="t"
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
            >
              [[{{ t }}]]
            </span>
          </div>
        </div>

        <div v-if="hasDefault(def)" class="flex items-start gap-2">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-14 shrink-0 pt-0.5"
            >Default</span
          >
          <code class="text-[11px] font-medium text-slate-600 dark:text-slate-300 break-all">
            {{ formatDefault(def.default) }}
          </code>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-if="fieldDefinitions.length === 0"
      class="text-xs text-slate-400 dark:text-slate-500 italic"
    >
      No fields defined for this concept.
    </p>
  </div>
</template>

<script setup lang="ts">
interface FieldSchema {
  name: string
  type: string
  options?: string[]
  target_concepts?: string[]
  default?: unknown
}

withDefaults(
  defineProps<{
    fieldDefinitions: FieldSchema[]
  }>(),
  {
    fieldDefinitions: () => [],
  },
)

/**
 * Color-coded badge per field type. Unknown types fall back to the
 * neutral slate badge so new widget types never render unstyled.
 */
const TYPE_BADGE_CLASSES: Record<string, string> = {
  string:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  text: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  category:
    'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  number:
    'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  boolean:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  select:
    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  multiselect:
    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  tags: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  togglegroup:
    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  reference:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  date: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  timestamp:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  rating:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  scale:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  cycle:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  url: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  color:
    'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800',
  image:
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  image_url:
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  asset:
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  file: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  video:
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  audio:
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  markdown:
    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  markdown_inline:
    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  markdown_file:
    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  code: 'bg-stone-100 text-stone-600 dark:bg-stone-700/40 dark:text-stone-300 border-stone-200 dark:border-stone-600',
  mermaid:
    'bg-stone-100 text-stone-600 dark:bg-stone-700/40 dark:text-stone-300 border-stone-200 dark:border-stone-600',
  diagram:
    'bg-stone-100 text-stone-600 dark:bg-stone-700/40 dark:text-stone-300 border-stone-200 dark:border-stone-600',
  weight:
    'bg-stone-100 text-stone-600 dark:bg-stone-700/40 dark:text-stone-300 border-stone-200 dark:border-stone-600',
}

function typeBadgeClass(type: string): string {
  return TYPE_BADGE_CLASSES[type] ?? TYPE_BADGE_CLASSES.string
}

function hasDefault(def: FieldSchema): boolean {
  return def.default !== undefined && def.default !== null && def.default !== ''
}

function formatDefault(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value === null || value === undefined) return ''
  return String(value)
}

function hasMetadata(def: FieldSchema): boolean {
  return Boolean(def.options?.length) || Boolean(def.target_concepts?.length) || hasDefault(def)
}
</script>
