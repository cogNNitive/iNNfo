import { defineStore } from 'pinia'
import type { ModelNode } from '../model/types'
import type { DirectoryHandleLike } from '../model/fs-types'
import { recursiveParse } from '../model/recursiveParser'
import { validateFormatContent } from '@cognnitive/innfo-core'
import type { ModelDriver, ParseIssue, ValidationReport } from '@cognnitive/innfo-core'
import { resolveParentSpecs } from '../services/SpecResolverService'

export interface ModelState {
  nodes: Record<string, ModelNode>
  rootIds: string[]
  dirtyIds: Set<string>
  parseIssues: ParseIssue[]
  validationReport: ValidationReport | null
}

/**
 * modelStore is the single normalized element graph. It replaces the
 * previously planned documentStore + folderStore split: every node,
 * regardless of storageMode, lives in this one graph (R2, R3).
 */
export const useModelStore = defineStore('model', {
  state: (): ModelState => ({
    nodes: {},
    rootIds: [],
    dirtyIds: new Set<string>(),
    parseIssues: [],
    validationReport: null,
  }),
  getters: {
    getNode:
      (state) =>
      (id: string): ModelNode | undefined =>
        state.nodes[id],
    getChildren:
      (state) =>
      (id: string): ModelNode[] =>
        (state.nodes[id]?.childIds ?? []).map((cid) => state.nodes[cid]).filter(Boolean),
    getRoots: (state) => (): ModelNode[] =>
      state.rootIds
        .filter((id) => !id.startsWith('spec:'))
        .map((id) => state.nodes[id])
        .filter(Boolean),

    /**
     * Returns the first root node id as the default "active" node.
     * View-only selection (which node is highlighted/interacted with)
     * lives in uiStore.selectedNodeId — this getter provides a fallback
     * for components that need a stable node reference to derive data
     * (e.g., metamodel resolution).
     */
    activeNodeId: (state): string | null => {
      return state.rootIds[0] ?? null
    },
  },
  actions: {
    /** Replaces the whole graph (used by a fresh recursive parse). */
    setGraph(nodes: Record<string, ModelNode>, rootIds: string[]): void {
      this.nodes = nodes
      this.rootIds = rootIds
      this.dirtyIds = new Set<string>()
      this.validateModel()
    },

    validateModel(): void {
      const nonTemplateRoots = this.rootIds.filter((id) => !id.startsWith('spec:') && this.nodes[id])
      if (nonTemplateRoots.length === 0) {
        this.validationReport = null
        return
      }

      let combinedReport: ValidationReport | null = null

      for (const rootId of nonTemplateRoots) {
        const rootNode = this.nodes[rootId]
        if (!rootNode?.rawContent) continue
        const path = rootNode.source?.path ?? ''
        const fileName = path.split('/').pop() || path || 'unknown.md'
        const report = validateFormatContent(rootNode.rawContent, fileName)

        if (!combinedReport) {
          combinedReport = {
            checks: [...report.checks],
            summary: { ...report.summary },
          }
        } else {
          combinedReport.summary.total += report.summary.total
          combinedReport.summary.passed += report.summary.passed
          combinedReport.summary.errors += report.summary.errors
          combinedReport.summary.warnings += report.summary.warnings
          combinedReport.checks.push(...report.checks)
        }
      }

      this.validationReport = combinedReport
    },

    upsertNode(node: ModelNode): void {
      this.nodes[node.id] = node
    },

    markDirty(id: string): void {
      this.dirtyIds.add(id)
    },

    clearDirty(id: string): void {
      this.dirtyIds.delete(id)
    },

    clearParseIssues(): void {
      this.parseIssues = []
    },

    isDirty(id: string): boolean {
      return this.dirtyIds.has(id)
    },

    /**
     * Populates this store directly from a workspace handle via a
     * recursive parse — no intermediate per-mode store. Real recursive
     * walking/parsing lands in Phase 3 (recursiveParser.ts); this wires
     * the call so workspaceStore.open() has a single integration point.
     */
    async parseFromHandle(handle: DirectoryHandleLike, driver?: ModelDriver): Promise<void> {
      const result = await recursiveParse(handle, driver)
      this.parseIssues = result.issues
      await resolveParentSpecs(result.nodes, result.rootIds, handle)
      this.setGraph(result.nodes, result.rootIds)
    },

    /**
     * Reorders a child within its parent's childIds array.
     * @param direction 1 = move down, -1 = move up
     */
    reorderChild(parentId: string, childId: string, direction: 1 | -1): void {
      const parent = this.nodes[parentId]
      if (!parent) return
      const idx = parent.childIds.indexOf(childId)
      if (idx === -1) return
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= parent.childIds.length) return
      parent.childIds.splice(idx, 1)
      parent.childIds.splice(newIdx, 0, childId)
      this.markDirty(parentId)
    },

    /**
     * Creates a new child node under the given parent.
     * @returns the new node's id
     */
    createChild(
      parentId: string,
      name: string,
      type: string,
      kind?: 'concept' | 'element',
    ): string {
      const parent = this.nodes[parentId]
      if (!parent) throw new Error(`Parent node "${parentId}" not found`)
      const id = `${parentId}/${name}`
      if (this.nodes[id]) throw new Error(`Node "${id}" already exists`)
      this.nodes[id] = {
        id,
        name,
        parentId,
        childIds: [],
        type,
        kind: kind ?? 'element',
        fields: {},
        markers: {},
        relationships: [],
        rawSections: {},
        source: { path: '' },
      }
      parent.childIds.push(id)
      this.markDirty(parentId)
      return id
    },

    /**
     * Creates a child element for a concept under the specified (or default) root node.
     * Convenience wrapper used by the ghost "Add first element" action.
     * @returns the new node's id
     */
    addConceptElement(conceptName: string, elementName: string, targetModelId?: string): string {
      const rootId = targetModelId ?? this.rootIds.find((id) => !id.startsWith('spec:')) ?? this.rootIds[0]
      if (!rootId) throw new Error('No root node — cannot add element')
      return this.createChild(rootId, elementName, conceptName, 'element')
    },

    /**
     * Creates a text-type section under the specified (or default) root node.
     * For concepts of type `text` (single Markdown block).
     */
    addTextSection(conceptName: string, targetModelId?: string): void {
      const rootId = targetModelId ?? this.rootIds.find((id) => !id.startsWith('spec:')) ?? this.rootIds[0]
      if (!rootId) throw new Error('No root node — cannot add section')
      const root = this.nodes[rootId]
      if (!root) throw new Error(`Root node "${rootId}" not found`)
      if (!root.rawSections) root.rawSections = {}
      root.rawSections[conceptName] = ''
      this.markDirty(rootId)
    },

    /**
     * Removes a node and all its descendants from the graph.
     */
    removeNodeTree(nodeId: string): void {
      const node = this.nodes[nodeId]
      if (!node) return
      // Recursively remove children
      for (const childId of [...node.childIds]) {
        this.removeNodeTree(childId)
      }
      // Remove from parent
      if (node.parentId) {
        const parent = this.nodes[node.parentId]
        if (parent) {
          parent.childIds = parent.childIds.filter((id) => id !== nodeId)
        }
      }
      delete this.nodes[nodeId]
      this.dirtyIds.add(nodeId)
    },
  },
})
