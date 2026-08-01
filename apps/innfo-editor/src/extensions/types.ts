import type { ModelNode } from '../model/types'

export interface ExtensionManifestView {
  id: string
  label: string
  icon?: string
  targetConcept?: string
}

export interface ExtensionManifestWidget {
  targetField: string
  component: string
}

export interface ExtensionManifest {
  id: string
  name: string
  version: string
  template: string
  description?: string
  views?: ExtensionManifestView[]
  widgets?: ExtensionManifestWidget[]
}

export interface ExtensionContext {
  nodes: Record<string, ModelNode>
  selectNode?: (nodeId: string) => void
  readOnly?: boolean
  standalone?: boolean
  activeProcedureName?: string
}

export interface TemplateExtension {
  manifest: ExtensionManifest
  views: Record<string, any>
}
