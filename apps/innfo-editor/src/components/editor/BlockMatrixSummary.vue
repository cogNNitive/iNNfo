<template>
  <div data-testid="block-matrix-summary" class="block-matrix-summary flex flex-col gap-1.5">
    <template v-if="chips.length > 0">
      <MatrixPill
        v-for="chip in chips"
        :key="chip.matrixName + '-' + chip.position"
        :name="chip.matrixName"
        :source="chip.source"
        :target="chip.target"
        :label="chip.label"
        :value-count="chip.count"
        :full-width="true"
        interactive
        show-source-target
        as="button"
        @click="onSelectMatrix(chip.matrixName)"
      />
    </template>
    <p v-else class="text-xs text-slate-400 dark:text-slate-500 italic">No relations participation.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModelStore } from '../../stores/modelStore'
import { useUiStore } from '../../stores/uiStore'
import { parseFrontmatter } from '@cognnitive/innfo-core'
import { getHexColor } from '../../composables/useConceptVisuals'
import { readMatrixDefsField } from '../../composables/useMatrixDefinitions'
import type { MatrixDecl } from '@cognnitive/innfo-core'
import MatrixPill from './MatrixPill.vue'

const props = defineProps<{
  rootNodeId: string
  nodeConcept: string
  nodeId: string
}>()

const modelStore = useModelStore()
const uiStore = useUiStore()

interface MatrixChip {
  matrixName: string
  source?: string
  target?: string
  label?: string
  position: 'row' | 'col'
  count: number
  accentColor: string
}

const chips = computed<MatrixChip[]>(() => {
  const root = modelStore.getNode(props.rootNodeId)
  if (!root) return []

  // Matrix declarations come from the template via __matrix_defs (populated by
  // the spec resolver) or, as a fallback, from the model's own frontmatter.
  const defsField = readMatrixDefsField(root)
  const rawMatrices = defsField.length > 0
    ? defsField
    : root.rawContent
      ? (parseFrontmatter(root.rawContent) as any)?.matrices
      : undefined
  const matrices: MatrixDecl[] = Array.isArray(rawMatrices) ? (rawMatrices as MatrixDecl[]) : []
  if (matrices.length === 0) return []

  const result: MatrixChip[] = []

  // Helper: count non-dash/empty cells for a matrix + concept instance
  // Cell keys are formatted as `{matrixName}||{rowInstance}||{colInstance}`.
  // The node can appear as a row (parts[1]) or column (parts[2]) participant.
  function countNonDashCells(
    matrixName: string,
    rootNodeId: string,
    conceptInstanceName: string,
  ): number {
    const rn = modelStore.getNode(rootNodeId)
    if (!rn?.fields) return 0

    let count = 0
    for (const [key, fv] of Object.entries(rn.fields)) {
      const parts = key.split('||')
      if (parts.length >= 3 && parts[0] === matrixName) {
        // Row: matrix||nodeName||*   Col: matrix||*||nodeName
        if (parts[1] === conceptInstanceName || parts[2] === conceptInstanceName) {
          const val = (fv as any)?.value
          if (val !== undefined && val !== null && val !== '' && val !== '-' && val !== false) {
            count++
          }
        }
      }
    }
    return count
  }

  for (const m of matrices) {
    const node = modelStore.getNode(props.nodeId)
    if (!node) continue

    // Resolve concept color for accent
    const conceptColor = (() => {
      // Look up concept definition from metamodel or use node's type
      const rootNode = modelStore.getNode(props.rootNodeId)
      if (rootNode?.rawContent) {
        const fmData = parseFrontmatter(rootNode.rawContent)
        const concepts: Array<{ name: string; color?: string }> = (fmData as any)?.concepts ?? []
        const found = concepts.find((c) => c.name === props.nodeConcept)
        if (found?.color) return getHexColor(found.color)
      }
      // Fall back to the node's type-based color
      return getHexColor(undefined)
    })()

    if (m.source === props.nodeConcept) {
      // Node is a row participant
      const count = countNonDashCells(m.name, props.rootNodeId, node.name)
      result.push({
        matrixName: m.name,
        source: m.source,
        target: m.target,
        label: m.label,
        position: 'row',
        count,
        accentColor: conceptColor,
      })
    }

    if (m.target === props.nodeConcept) {
      // Node is a column participant
      const count = countNonDashCells(m.name, props.rootNodeId, node.name)
      if (!result.some((r) => r.matrixName === m.name && r.position === 'row')) {
        result.push({
          matrixName: m.name,
          source: m.source,
          target: m.target,
          label: m.label,
          position: 'col',
          count,
          accentColor: conceptColor,
        })
      }
    }
  }

  return result
})

function onSelectMatrix(matrixName: string): void {
  const root = modelStore.getNode(props.rootNodeId)
  if (!root) return

  const defsField = readMatrixDefsField(root)
  const rawMatrices = defsField.length > 0
    ? defsField
    : root.rawContent
      ? (parseFrontmatter(root.rawContent) as any)?.matrices
      : undefined
  const matrices: MatrixDecl[] = Array.isArray(rawMatrices) ? (rawMatrices as MatrixDecl[]) : []
  const idx = matrices.findIndex((m) => m.name === matrixName)
  if (idx !== -1) {
    uiStore.setActiveMatrixIndex(idx)
    uiStore.setActiveView('matrices')
  }
}
</script>
