import type { ElementNode, ParsedModel, FieldValue, LocalMetamodel, ModelNode } from '../types'
import { extractTemplateSchema } from '../schema'
import type { ParseContext } from './types'

export function nowIso(): string {
  return new Date().toISOString()
}

/** Extracts a node's own locally-declared metamodel from its body-level
 *  `Concept Definition` / `Marker Definition` elements (level-2 templates
 *  instantiate the root primitives of the Metaplantilla Nivel 1). Level-3
 *  models declare no local metamodel. */
export function toLocalMetamodel(parsed: ParsedModel): LocalMetamodel {
  const schema = extractTemplateSchema(parsed)
  return { concepts: schema.concepts, markers: schema.markers, taxonomy: schema.taxonomy }
}

export function toFieldValues(fields: Record<string, unknown>): Record<string, FieldValue> {
  const result: Record<string, FieldValue> = {}
  for (const [key, value] of Object.entries(fields)) {
    result[key] = {
      value,
      provenance: { author: { kind: 'system', id: 'parser' }, timestamp: nowIso() },
    }
  }
  return result
}

/** Builds a taxonomy parent-lookup: child name -> parent name. */
export function buildTaxonomyParentMap(parsed: ParsedModel): Map<string, string> {
  const parentOf = new Map<string, string>()
  for (const edge of parsed.taxonomy) {
    parentOf.set(edge.child, edge.parent)
  }
  return parentOf
}

/**
 * Normalizes a single already-parsed ParsedModel's elements into ModelNodes,
 * attached under `rootId`. Elements form a flat or taxonomy-derived
 * hierarchy beneath the document root; unrecognized parents fall back to
 * being direct children of the root.
 */
export function normalizeElementsIntoGraph(
  parsed: ParsedModel,
  rootId: string,
  sourcePath: string,
  ctx: ParseContext,
): void {
  const parentOfTaxonomy = buildTaxonomyParentMap(parsed)
  const qualifiedIdByElementName = new Map<string, string>()

  // Collect all elements in declaration order, grouped by concept.
  const allElements: ElementNode[] = []
  for (const [, elementNodes] of parsed.elements.entries()) {
    for (const el of elementNodes) {
      allElements.push(el)
    }
  }

  // Re-sort elements by their position in the NN index (if present).
  // The index defines both hierarchy AND display order; elements not listed
  // in the index get a high sort value so they appear after indexed ones.
  if (parsed.taxonomy.length > 0) {
    const indexOrder = new Map<string, number>()
    let orderIdx = 0
    for (const edge of parsed.taxonomy) {
      if (!indexOrder.has(edge.parent)) indexOrder.set(edge.parent, orderIdx++)
      if (!indexOrder.has(edge.child)) indexOrder.set(edge.child, orderIdx++)
    }
    allElements.sort((a, b) => {
      const oa = indexOrder.get(a.name) ?? 99999
      const ob = indexOrder.get(b.name) ?? 99999
      return oa - ob
    })
  }

  // First pass: elements whose taxonomy parent has no listed parent themselves
  // (i.e. top-level relative to this document) get created first, so their
  // qualifiedId is available for children referencing them via taxonomy.
  const byName = new Map<string, ElementNode>()
  for (const el of allElements) byName.set(el.name, el)

  function resolveParentQualifiedId(elementName: string, seen: Set<string>): string {
    const taxonomyParentName = parentOfTaxonomy.get(elementName)
    if (!taxonomyParentName || seen.has(elementName)) {
      return rootId
    }
    if (qualifiedIdByElementName.has(taxonomyParentName)) {
      return qualifiedIdByElementName.get(taxonomyParentName)!
    }
    if (byName.has(taxonomyParentName)) {
      seen.add(elementName)
      return resolveParentQualifiedId(taxonomyParentName, seen)
    }
    return rootId
  }

  // Track element names model-wide for uniqueness across all concepts (R-IE-02)
  const modelWideElementNames = new Set<string>()

  for (const el of allElements) {
    try {
      if (modelWideElementNames.has(el.name)) {
        throw new Error(
          `Duplicate element name "${el.name}" — element names must be unique within the whole model`,
        )
      }
      modelWideElementNames.add(el.name)

      const parentQualifiedId = resolveParentQualifiedId(el.name, new Set())
      const qualifiedId = ctx.identity.register(parentQualifiedId, el.name)
      qualifiedIdByElementName.set(el.name, qualifiedId)

      const node: ModelNode = {
        id: qualifiedId,
        name: el.name,
        parentId: parentQualifiedId,
        childIds: [],
        type: el.type,
        kind: 'element',
        slug: el.slug,
        fields: toFieldValues(el.fields),
        markers: { ...(parsed.nodeMarkers[el.name] ?? {}) },
        relationships: [],
        rawSections: el.description ? { description: el.description } : {},
        source: { path: sourcePath },
      }
      ctx.nodes[qualifiedId] = node
      const parent = ctx.nodes[parentQualifiedId]
      if (parent && !parent.childIds.includes(qualifiedId)) {
        parent.childIds.push(qualifiedId)
      }
    } catch (err) {
      ctx.issues.push({
        path: `${sourcePath}#${el.name}`,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // Attach relationships from matrices between named elements, once all
  // qualified ids are known.
  for (const matrix of parsed.matrices) {
    for (const cell of matrix.cells) {
      const sourceId = qualifiedIdByElementName.get(cell.row)
      const targetId = qualifiedIdByElementName.get(cell.col)
      if (sourceId && targetId && ctx.nodes[sourceId]) {
        ctx.nodes[sourceId].relationships.push({ targetId, label: matrix.name, value: cell.value })
      }
    }
  }

  // Resolve asset paths for elements with asset-typed fields (FR-004)
  resolveElementAssets(parsed, rootId, sourcePath, ctx, qualifiedIdByElementName)
}

/**
 * Resolve asset paths for elements whose concept fields are of type
 * image/file/video/audio. Paths are constructed according to asset_mode.
 */
export function resolveElementAssets(
  parsed: ParsedModel,
  rootId: string,
  sourcePath: string,
  ctx: ParseContext,
  qualifiedIdByElementName: Map<string, string>,
): void {
  // Build a map of concept name -> asset field definitions
  const assetFieldsByConcept = new Map<string, Array<{ name: string; type: string }>>()
  const schemaConcepts = extractTemplateSchema(parsed).concepts
  for (const concept of schemaConcepts) {
    const assetFields = (concept.fields ?? []).filter(
      (f) => f.type === 'image' || f.type === 'file' || f.type === 'video' || f.type === 'audio',
    )
    if (assetFields.length > 0) {
      assetFieldsByConcept.set(
        concept.name,
        assetFields.map((f) => ({ name: f.name, type: f.type })),
      )
    }
  }

  if (assetFieldsByConcept.size === 0) return

  // Determine asset mode from root node
  const rootNode = ctx.nodes[rootId]
  const assetMode = rootNode?.assetMode ?? 'centralized'
  const modelDir = sourcePath.replace(/\/?[^/]+$/, '') // directory of the model file

  for (const [conceptName, elementNodes] of parsed.elements.entries()) {
    const assetFields = assetFieldsByConcept.get(conceptName)
    if (!assetFields) continue

    for (const el of elementNodes) {
      const qualifiedId = qualifiedIdByElementName.get(el.name)
      if (!qualifiedId) continue
      const node = ctx.nodes[qualifiedId]
      if (!node) continue

      const paths: string[] = []
      for (const fieldDef of assetFields) {
        const fieldValue = el.fields[fieldDef.name]
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
          const assetDir =
            assetMode === 'per-element' && el.slug ? `${modelDir}/${el.slug}` : `${modelDir}/assets`
          paths.push(`${assetDir}/${fieldValue.trim()}`)
        }
      }

      if (paths.length > 0) {
        node.assets = [...(node.assets ?? []), ...paths]
      }
    }
  }
}
