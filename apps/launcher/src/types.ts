export interface DetectionResult {
  mode: 'FILE' | 'FOLDER' | 'BOTH' | 'NONE'
  title: string
  template?: string
  version?: string
  errors: string[]
  fileName?: string
  folderName?: string
}

export interface LauncherConfig {
  fileFormatUrl?: string
  folderFormatUrl?: string
}
