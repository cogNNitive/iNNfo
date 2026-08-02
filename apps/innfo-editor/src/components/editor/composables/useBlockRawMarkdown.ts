import { computed, type ComputedRef, type Ref } from 'vue'
import { useModelStore } from '../../../stores/modelStore'

export interface BlockRawMarkdownInput {
  id?: string
  name: string
  description: string
  fields?: Record<string, any>
}

/**
 * Reconstructs the raw Markdown source shown in BlockSheet.vue's "Code" tab
 * — moved verbatim, no logic change.
 *
 * `conceptType` is not part of the design's listed ctx shorthand but IS
 * required to preserve exact current behavior: the "Element nodes" branch
 * below prefers the `conceptType` prop over `node?.type` (see design.md's
 * "moved verbatim" invariant, pinned by `tests/component/BlockSheet.test.ts`).
 */
export function useBlockRawMarkdown(ctx: {
  blockId: Ref<string>
  kind: Ref<string>
  conceptName: Ref<string | undefined>
  conceptType: Ref<string | undefined>
  block: Ref<BlockRawMarkdownInput>
}): { rawMarkdown: ComputedRef<string> } {
  const modelStore = useModelStore()

  const rootNodeId = computed(() => {
    if (!ctx.blockId.value) return modelStore.rootIds[0] ?? ''
    let curr = modelStore.getNode(ctx.blockId.value)
    while (curr && curr.parentId) {
      curr = modelStore.getNode(curr.parentId)
    }
    return curr ? curr.id : (modelStore.rootIds[0] ?? '')
  })

  const rawMarkdown = computed(() => {
    if (!ctx.blockId.value) return ''
    const node = modelStore.getNode(ctx.blockId.value)

    // Root nodes: full raw source of the file
    if (node?.rawContent) return node.rawContent

    const description = node?.rawSections?.description || ctx.block.value.description

    // Concept sections (virtual group or concept-kind node): # _NN heading + children
    if (ctx.kind.value === 'concept') {
      const conceptName = ctx.conceptName.value || ctx.block.value.name
      if (!conceptName) return description || ''

      const lines: string[] = [`# _NN ${conceptName}`]
      const visited = new Set<string>()
      const walk = (nodeId: string) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)
        const n = modelStore.getNode(nodeId)
        if (!n) return
        for (const cid of n.childIds) {
          const child = modelStore.getNode(cid)
          if (!child || child.type !== conceptName) continue
          lines.push('')
          lines.push(`* _NN ${conceptName}: ${child.name}`)
          const yamlFields = Object.entries(child.fields ?? {}).filter(
            ([, fv]) => (fv as any)?.value !== undefined && (fv as any)?.value !== '',
          )
          if (yamlFields.length > 0) {
            lines.push('  ```yaml')
            for (const [k, fv] of yamlFields) {
              lines.push(`  ${k}: ${JSON.stringify((fv as any).value)}`)
            }
            lines.push('  ```')
          }
          const childDesc = child.rawSections?.description || ''
          if (childDesc) {
            for (const line of childDesc.split('\n')) {
              lines.push(`  ${line}`)
            }
          }
          walk(cid)
        }
      }
      const rootId = rootNodeId.value
      if (rootId) walk(rootId)

      return lines.join('\n')
    }

    // Element nodes: * _NN marker line + description
    const type = ctx.conceptType.value || node?.type || ''
    const name = node?.name || ctx.block.value.name
    if (type && name) {
      const lines: string[] = [`* _NN ${type}: ${name}`]
      // Include YAML fields from the node
      if (node?.fields) {
        const yamlFields = Object.entries(node.fields).filter(
          ([, fv]) => (fv as any)?.value !== undefined && (fv as any)?.value !== '',
        )
        if (yamlFields.length > 0) {
          lines.push('  ```yaml')
          for (const [k, fv] of yamlFields) {
            lines.push(`  ${k}: ${JSON.stringify((fv as any).value)}`)
          }
          lines.push('  ```')
        }
      }
      if (description) {
        for (const line of description.split('\n')) {
          lines.push(`  ${line}`)
        }
      }
      return lines.join('\n')
    }

    return description || ''
  })

  return { rawMarkdown }
}
