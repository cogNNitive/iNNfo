<template>
  <span v-if="parsed.isValid" class="inline-flex items-center">
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-all cursor-pointer shadow-2xs group"
      :title="`Ver trazabilidad y fuente original: ${parsed.filePath}`"
      @click.stop="openModal"
    >
      <IconRenderer icon="link" custom-class="w-3.5 h-3.5 text-violet-500 group-hover:scale-110 transition-transform shrink-0" />
      <span class="font-mono text-xs font-bold">{{ parsed.sourceId }}</span>
      <span class="text-violet-300 dark:text-violet-700 font-normal">|</span>
      <span class="truncate max-w-[220px] font-mono text-[11px] font-medium">{{ parsed.fileName }}</span>
      <span v-if="parsed.startLine" class="text-violet-600 dark:text-violet-400 font-mono text-[10px] bg-violet-200/60 dark:bg-violet-900/80 px-1.5 py-0.5 rounded-full font-bold">
        :L{{ parsed.startLine }}
      </span>
    </span>

    <SourceRefModal
      :is-open="showModal"
      :parsed="parsed"
      @close="showModal = false"
    />
  </span>
  <span v-else class="text-slate-600 dark:text-slate-300 font-mono text-xs">
    {{ rawValue }}
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconRenderer from './IconRenderer.vue'
import SourceRefModal from './SourceRefModal.vue'
import { parseSourceRef, type ParsedSourceRef } from '../../utils/sourceRef'

const props = defineProps<{
  rawValue: string
}>()

const showModal = ref(false)

function openModal(): void {
  showModal.value = true
}

const parsed = computed<ParsedSourceRef>(() => parseSourceRef(props.rawValue))
</script>
