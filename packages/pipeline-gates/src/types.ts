export interface GateResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidateOptions {
  filePath: string
  skipMcp?: boolean
}

export interface IntegrateOptions {
  filePath: string
  targetDir?: string
  dryRun?: boolean
}

export interface IntegrateResult extends GateResult {
  newFilePath?: string
  newVersion?: string
  indexEntry?: string
}
