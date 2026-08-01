export * from './types'
export {
  parseYaml,
  parseFrontmatter,
  parseModel,
  serializeModel,
  parseIndexBlock,
  parseMarkdownTable,
  getSectionType,
  buildHierarchyTree,
  extractRelationships,
  extractAnalysis,
} from './parser'
export {
  CONCEPT_DEFINITION,
  FIELD_DEFINITION,
  MARKER_DEFINITION,
  MATRIX_DEFINITION,
  extractTemplateSchema,
  extractTemplateSchemaFromContent,
} from './schema'
export type { TemplateSchema } from './schema'
export { validateModel, validateFormatContent, validateFormatSyntax } from './validator'
export { applyMutation } from './mutate'
export type { MutationResult } from './mutate'
export { deriveMatrixWidgetType, normalizeMatrixDecl } from './matrix'
export type { MatrixWidgetType } from './matrix'
export * from './identity'
export * from './metamodel'
export * from './fs-types'
export {
  recursiveParse,
  normalizeSingleModel,
  resolveGraphEdgeTarget,
  resolveQualifiedIdToPath,
  type ParseIssue,
  type RecursiveParseResult,
} from './recursiveParser'
// Browser-safe driver stub (Node.js driver implementations are excluded
// as they depend on node:fs/promises)
export { createDriver } from './driver-browser'
export type { ModelDriver, ModelEntry } from './driver-browser'

export {
  getSpecForLevel,
  getTemplate,
  getFormatSpec,
  getDefiNNe,
  SpecResolutionError,
} from './resolver'
export type { SpecResolver } from './resolver'
