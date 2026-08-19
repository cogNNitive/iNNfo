import { defineAsyncComponent, type Component } from 'vue'
import type { ExtensionManifest, ExtensionContext } from './types'
import proceduresManifest from './procedures/manifest.json'
import projectsManifest from './projects/manifest.json'

export interface RegisteredExtension {
  manifest: ExtensionManifest
  views: Record<string, Component>
}

class ExtensionRegistry {
  private extensions = new Map<string, RegisteredExtension>()

  constructor() {
    this.registerProceduresExtension()
    this.registerProjectsExtension()
  }

  private registerProceduresExtension() {
    this.extensions.set('procedures_V_0-2-0', {
      manifest: proceduresManifest as ExtensionManifest,
      views: {
        'guided-procedure': defineAsyncComponent(
          () => import('../components/editor/GuidedProcedureView.vue'),
        ),
      },
    })
    // Also alias by short name
    this.extensions.set('procedures', this.extensions.get('procedures_V_0-2-0')!)
  }

  private registerProjectsExtension() {
    this.extensions.set('projects', {
      manifest: projectsManifest as ExtensionManifest,
      views: {
        'gantt-chart': defineAsyncComponent(
          () => import('../components/editor/ProjectGanttView.vue'),
        ),
      },
    })
  }

  public getExtension(templateName: string): RegisteredExtension | undefined {
    if (!templateName) return undefined
    // Match exact or prefix (e.g. procedures_V_0-2-0)
    for (const [key, ext] of this.extensions.entries()) {
      if (templateName.toLowerCase().includes(key.toLowerCase())) {
        return ext
      }
    }
    return undefined
  }

  public getExtensionViews(templateName: string): Record<string, Component> {
    const ext = this.getExtension(templateName)
    return ext ? ext.views : {}
  }
}

export const extensionRegistry = new ExtensionRegistry()
