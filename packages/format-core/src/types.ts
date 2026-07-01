export type ConceptType = 'text' | 'list' | 'category' | 'weight' | 'steps' | 'sequence';
export type Mode = 'FILE' | 'FOLDER';
export type SpecLevel = 0 | 1 | 2 | 3;

export interface ParentRef {
  name: string;
  url: string;
}

export interface ConceptField {
  name: string;
  type: 'string' | 'select' | 'reference';
  options?: string[];
  target_concepts?: string[];
}

export interface Concept {
  name: string;
  icon?: string;
  type: ConceptType;
  color?: string;
  weight?: number;
  fields?: ConceptField[];
}

export interface Marker {
  name: string;
  icon?: string;
  symbol?: string;
  color?: string;
  weight?: number;
}

export interface MatrixDecl {
  name: string;
  source: string;
  target: string;
  params: string;
}

export type RelationshipType = 'hierarchy' | 'evaluable_matrix' | 'graph_edge' | 'sequence';

export interface RelationshipDecl {
  enabled: boolean;
  via?: string;
}

export interface RelationshipTypeDef {
  name: RelationshipType;
  description: string;
  file_representation: string;
  folder_representation: string;
}

export interface SpecFrontmatter {
  specification_version: string;
  specification_url: string;
  level: SpecLevel;
  parent?: ParentRef;
  title?: string;
  description?: string;
  author?: string;
  status?: string;
  mode?: Mode | Mode[];
  concepts?: Concept[];
  markers?: Marker[];
  matrices?: MatrixDecl[];
  relationship_types?: RelationshipTypeDef[];
  relationship_declarations?: Partial<Record<RelationshipType, RelationshipDecl>>;
  model_version?: string;
  last_updated?: string;
  [key: string]: unknown;
}

export interface ElementNode {
  type: string;
  name: string;
  description: string;
  fields: Record<string, unknown>;
  markers: Record<string, number | string>;
}

export interface MatrixCell {
  row: string;
  col: string;
  value: string;
}

export interface MatrixData {
  name: string;
  source: string;
  target: string;
  cells: MatrixCell[];
}

export interface TaxonomyEdge {
  parent: string;
  child: string;
}

export interface GraphEdge {
  target: string;
  label: string;
  weight?: number;
  [key: string]: unknown;
}

export interface FolderElement {
  path: string;
  type: string;
  fields: Record<string, unknown>;
  markers: Record<string, number | string>;
  graphEdges: GraphEdge[];
  assets: string[];
  children: FolderElement[];
}

export interface ParsedModel {
  frontmatter: SpecFrontmatter;
  taxonomy: TaxonomyEdge[];
  elements: Map<string, ElementNode[]>;
  matrices: MatrixData[];
  nodeMarkers: Record<string, Record<string, number | string>>;
  rawContent: string;
}

export interface SpecCache {
  specs: Map<string, SpecDocument>;
  chain: string[];
}

export interface SpecDocument {
  name: string;
  level: SpecLevel;
  parentName?: string;
  parentUrl?: string;
  frontmatter: SpecFrontmatter;
  rawContent: string;
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FileDriverOptions {
  encoding?: string;
}

export interface FolderDriverOptions {
  ignorePatterns?: string[];
}

export interface ResolverOptions {
  cacheDir?: string;
  maxDepth?: number;
  timeout?: number;
}
