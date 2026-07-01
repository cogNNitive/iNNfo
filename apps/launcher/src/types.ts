export interface DetectionResult {
  mode: 'FILE' | 'FOLDER' | 'BOTH' | 'NONE'
  title: string
  template?: string
  version?: string
  errors: string[]
  fileName?: string
  folderName?: string
  rawContent?: string
  validation?: ValidationReport
}

export interface ScannedItem {
  kind: 'folder' | 'file'
  name: string
  relativePath: string
  title?: string
  mode?: string
  compliant: boolean
  errors: string[]
  validation?: ValidationReport
}

export interface ScannedFolder {
  name: string
  rootFormat: boolean
  rootTitle?: string
  rootMode?: string
  rootErrors: string[]
  rootValidation?: ValidationReport
  items: ScannedItem[]
  totalFiles: number
  totalFolders: number
}

export interface FolderHistoryEntry {
  name: string
  path: string
  timestamp: number
}

export interface SampleFolder {
  id: string
  name: string
  description: string
  mode: string
  path: string
  items: number
}

/** @todo Connect to actual configuration store */
export interface LauncherConfig {
  fileFormatUrl?: string
  folderFormatUrl?: string
}

export interface ValidationCheck {
  id: string
  label: string
  description: string
  category: 'frontmatter' | 'body' | 'convention'
  severity: 'error' | 'warning' | 'info'
  passed: boolean
  message?: string
}

export interface ValidationSummary {
  total: number
  passed: number
  errors: number
  warnings: number
}

export interface ValidationReport {
  mode: 'FILE' | 'FOLDER'
  checks: ValidationCheck[]
  summary: ValidationSummary
}
