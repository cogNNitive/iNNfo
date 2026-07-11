import type { ParsedModel, ElementNode } from './types'

export interface MutationResult {
  success: boolean
  errors?: Array<{ path: string; message: string }>
  warnings?: Array<{ path: string; message: string }>
}

const RESERVED_CONCEPT_NAMES = new Set(['Concepts', 'Elements', 'Markers'])

function getModelWideElementNames(model: ParsedModel): Set<string> {
  const names = new Set<string>()
  for (const [, elements] of model.elements.entries()) {
    for (const el of elements) {
      names.add(el.name)
    }
  }
  return names
}

export function applyMutation(
  model: ParsedModel,
  op: string,
  args: Record<string, unknown>,
): MutationResult {
  try {
    switch (op) {
      case 'add_concept':
        return addConcept(model, args)
      case 'add_field':
        return addField(model, args)
      case 'set_marker':
        return setMarker(model, args)
      case 'add_element':
        return addElement(model, args)
      case 'remove_element':
        return removeElement(model, args)
      case 'rename_concept':
        return renameConcept(model, args)
      case 'rename_element':
        return renameElement(model, args)
      default:
        return { success: false, errors: [{ path: '', message: `Unknown operation: ${op}` }] }
    }
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : String(err) }],
    }
  }
}

function addConcept(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  if (!conceptName) return { success: false, errors: [{ path: '', message: 'conceptName is required' }] }

  if (RESERVED_CONCEPT_NAMES.has(conceptName)) {
    return {
      success: false,
      errors: [{
        path: 'frontmatter.concepts',
        message: `"${conceptName}" is a reserved pseudo-concept name and MUST NOT be declared`,
      }],
    }
  }

  const concepts = model.frontmatter.concepts ?? []
  if (concepts.some((c) => c.name.toLowerCase() === conceptName.toLowerCase())) {
    return { success: false, errors: [{ path: '', message: `Concept "${conceptName}" already exists` }] }
  }

  concepts.push({
    name: conceptName,
    type: (args.type as string) ?? 'text',
    icon: args.icon as string | undefined,
    color: args.color as string | undefined,
  } as any)
  model.frontmatter.concepts = concepts
  return { success: true }
}

function addField(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  const fieldName = args.fieldName as string | undefined
  if (!conceptName || !fieldName) {
    return { success: false, errors: [{ path: '', message: 'conceptName and fieldName are required' }] }
  }

  const concepts = model.frontmatter.concepts ?? []
  const concept = concepts.find((c) => c.name.toLowerCase() === conceptName.toLowerCase())
  if (!concept) return { success: false, errors: [{ path: '', message: `Concept "${conceptName}" not found` }] }

  const fields = concept.fields ?? []
  if (fields.some((f) => f.name.toLowerCase() === fieldName.toLowerCase())) {
    return { success: false, errors: [{ path: '', message: `Field "${fieldName}" already exists on concept "${conceptName}"` }] }
  }

  fields.push({ name: fieldName, type: (args.fieldType as string) ?? 'string', options: args.options as string[] | undefined } as any)
  concept.fields = fields
  return { success: true }
}

function setMarker(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const markerName = args.markerName as string | undefined
  if (!markerName) return { success: false, errors: [{ path: '', message: 'markerName is required' }] }

  const markers = model.frontmatter.markers ?? []
  const existing = markers.find((m) => m.name.toLowerCase() === markerName.toLowerCase())
  if (existing) {
    if (args.symbol !== undefined) existing.symbol = args.symbol as string
    if (args.icon !== undefined) existing.icon = args.icon as string
    if (args.color !== undefined) existing.color = args.color as string
  } else {
    markers.push({ name: markerName, symbol: args.symbol as string | undefined, icon: args.icon as string | undefined, color: args.color as string | undefined })
  }
  model.frontmatter.markers = markers
  return { success: true }
}

function addElement(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  const elementName = args.elementName as string | undefined
  if (!conceptName || !elementName) {
    return { success: false, errors: [{ path: '', message: 'conceptName and elementName are required' }] }
  }

  // Model-wide uniqueness check (R-IE-02)
  const existingNames = getModelWideElementNames(model)
  if (existingNames.has(elementName)) {
    return {
      success: false,
      errors: [{ path: '', message: `Element "${elementName}" already exists in this model — element names must be unique model-wide` }],
    }
  }

  const existingElements = model.elements.get(conceptName) ?? []
  const newElement: ElementNode = {
    type: conceptName,
    name: elementName,
    description: (args.description as string) ?? '',
    fields: (args.fields as Record<string, unknown>) ?? {},
    markers: {},
  }
  existingElements.push(newElement)
  model.elements.set(conceptName, existingElements)
  return { success: true }
}

function removeElement(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  const elementName = args.elementName as string | undefined
  if (!conceptName || !elementName) {
    return { success: false, errors: [{ path: '', message: 'conceptName and elementName are required' }] }
  }

  const existingElements = model.elements.get(conceptName) ?? []
  const filtered = existingElements.filter((e) => e.name.toLowerCase() !== elementName!.toLowerCase())
  if (filtered.length === existingElements.length) {
    return { success: false, errors: [{ path: '', message: `Element "${elementName}" not found in concept "${conceptName}"` }] }
  }
  model.elements.set(conceptName, filtered)
  return { success: true }
}

function renameConcept(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  const newName = args.newName as string | undefined
  if (!conceptName || !newName) {
    return { success: false, errors: [{ path: '', message: 'conceptName and newName are required' }] }
  }

  if (RESERVED_CONCEPT_NAMES.has(newName)) {
    return {
      success: false,
      errors: [{ path: 'frontmatter.concepts', message: `"${newName}" is a reserved pseudo-concept name` }],
    }
  }

  const lowerOld = conceptName.toLowerCase()
  const lowerNew = newName.toLowerCase()
  if (lowerOld === lowerNew) return { success: false, errors: [{ path: '', message: 'newName must differ from conceptName' }] }

  const concepts = model.frontmatter.concepts ?? []
  const concept = concepts.find((c) => c.name.toLowerCase() === lowerOld)
  if (!concept) return { success: false, errors: [{ path: '', message: `Concept "${conceptName}" not found in frontmatter` }] }
  if (concepts.some((c) => c.name.toLowerCase() === lowerNew && c.name !== concept.name)) {
    return { success: false, errors: [{ path: '', message: `Concept "${newName}" already exists in frontmatter` }] }
  }
  concept.name = newName
  model.frontmatter.concepts = concepts

  // Update elements map
  const nodes = model.elements.get(conceptName)
  if (nodes) {
    for (const node of nodes) {
      node.type = newName
    }
    model.elements.set(newName, nodes)
    model.elements.delete(conceptName)
  }

  // Update taxonomy edges
  for (const edge of model.taxonomy) {
    if (edge.parent.toLowerCase() === lowerOld) edge.parent = newName
    if (edge.child.toLowerCase() === lowerOld) edge.child = newName
  }

  // Update rawSections key
  if (model.rawSections) {
    const raw = model.rawSections[conceptName]
    if (raw !== undefined) {
      delete model.rawSections[conceptName]
      model.rawSections[newName] = raw
    }
  }

  // Update matrix declaration source/target (R-IE-03)
  if (model.frontmatter.matrices) {
    for (const matrix of model.frontmatter.matrices) {
      if (matrix.source.toLowerCase() === lowerOld) matrix.source = newName
      if (matrix.target.toLowerCase() === lowerOld) matrix.target = newName
    }
  }

  return { success: true }
}

function renameElement(model: ParsedModel, args: Record<string, unknown>): MutationResult {
  const conceptName = args.conceptName as string | undefined
  const elementName = args.elementName as string | undefined
  const newName = args.newName as string | undefined
  if (!conceptName || !elementName || !newName) {
    return { success: false, errors: [{ path: '', message: 'conceptName, elementName, and newName are required' }] }
  }

  const lowerOld = elementName.toLowerCase()
  const lowerNew = newName.toLowerCase()
  if (lowerOld === lowerNew) return { success: false, errors: [{ path: '', message: 'newName must differ from elementName' }] }

  // Model-wide uniqueness check (R-IE-02)
  const existingNames = getModelWideElementNames(model)
  existingNames.delete(elementName) // Remove current name for rename check
  if (existingNames.has(newName)) {
    return {
      success: false,
      errors: [{ path: '', message: `Element "${newName}" already exists in this model — element names must be unique model-wide` }],
    }
  }

  const existingElements = model.elements.get(conceptName)
  if (!existingElements) return { success: false, errors: [{ path: '', message: `Concept "${conceptName}" not found` }] }

  const element = existingElements.find((e) => e.name.toLowerCase() === lowerOld)
  if (!element) return { success: false, errors: [{ path: '', message: `Element "${elementName}" not found in concept "${conceptName}"` }] }

  element.name = newName
  element.slug = undefined

  // Update nodeMarkers key
  if (model.nodeMarkers[elementName] !== undefined) {
    model.nodeMarkers[newName] = model.nodeMarkers[elementName]
    delete model.nodeMarkers[elementName]
  }

  // Update taxonomy entries (R-IE-03)
  for (const edge of model.taxonomy) {
    if (edge.parent.toLowerCase() === lowerOld) edge.parent = newName
    if (edge.child.toLowerCase() === lowerOld) edge.child = newName
  }

  // Update matrix cell row/col labels (R-IE-03)
  for (const matrix of model.matrices) {
    for (const cell of matrix.cells) {
      if (cell.row.toLowerCase() === lowerOld) cell.row = newName
      if (cell.col.toLowerCase() === lowerOld) cell.col = newName
    }
  }

  model.elements.set(conceptName, existingElements)
  return { success: true }
}
