import { SpecCache, SpecDocument, ResolverOptions } from './types'

export interface SpecResolver {
  resolveParentChain(parentUrl: string, parentName: string, options?: ResolverOptions): Promise<SpecCache>
}

export class SpecResolutionError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
  ) {
    super(message)
    this.name = 'SpecResolutionError'
  }
}

export interface MultiStoreResolverOptions {
  workspaceDir?: string
  globalTemplatesDir?: string
  skillsDir?: string
  timeout?: number
}

export interface SpecTemplateLocation {
  name: string
  filePath: string
  source: 'workspace' | 'global' | 'skill'
  skillName?: string
}

export class UnresolvedTemplateError extends Error {
  public readonly checkedPaths: string[]
  constructor(templateName: string, checkedPaths: string[]) {
    const formatted = checkedPaths.map((p) => `  - ${p}`).join('\n')
    super(`Unresolved template "${templateName}". (searched:\n${formatted})`)
    this.name = 'UnresolvedTemplateError'
    this.checkedPaths = checkedPaths
  }
}

export function getSpecForLevel(cache: SpecCache, level: number): SpecDocument | undefined {
  for (const doc of cache.specs.values()) {
    if (doc.level === level) return doc
  }
  return undefined
}

export function getTemplate(cache: SpecCache): SpecDocument | undefined {
  return getSpecForLevel(cache, 3) ?? getSpecForLevel(cache, 2)
}

export function getFormatSpec(cache: SpecCache): SpecDocument | undefined {
  return getSpecForLevel(cache, 1)
}

export function getDefiNNe(cache: SpecCache): SpecDocument | undefined {
  return getSpecForLevel(cache, 0)
}

export async function resolveTemplatePath(
  templateName: string,
  options?: MultiStoreResolverOptions,
): Promise<SpecTemplateLocation | null> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const os = await import('node:os')

  const workspaceDir = options?.workspaceDir ?? process.cwd()
  const globalTemplatesDir =
    options?.globalTemplatesDir ?? path.join(os.homedir(), '.agents', 'templates')
  const skillsDir = options?.skillsDir ?? path.join(os.homedir(), '.agents', 'skills')

  const candidateNames = templateName.endsWith('.md')
    ? [templateName]
    : [`${templateName}.md`, templateName]

  const checkedPaths: string[] = []

  // Tier 1: Workspace-local directory
  for (const candidate of candidateNames) {
    const p1 = path.join(workspaceDir, 'templates', candidate)
    checkedPaths.push(p1)
    try {
      const st = await fs.stat(p1)
      if (st.isFile()) return { name: templateName, filePath: p1, source: 'workspace' }
    } catch {}

    const p2 = path.join(workspaceDir, candidate)
    checkedPaths.push(p2)
    try {
      const st = await fs.stat(p2)
      if (st.isFile()) return { name: templateName, filePath: p2, source: 'workspace' }
    } catch {}

    const p3 = path.join(workspaceDir, 'specs', candidate)
    checkedPaths.push(p3)
    try {
      const st = await fs.stat(p3)
      if (st.isFile()) return { name: templateName, filePath: p3, source: 'workspace' }
    } catch {}
  }

  // Tier 2: Global user agents directory (~/.agents/templates/)
  for (const candidate of candidateNames) {
    const p = path.join(globalTemplatesDir, candidate)
    checkedPaths.push(p)
    try {
      const st = await fs.stat(p)
      if (st.isFile()) return { name: templateName, filePath: p, source: 'global' }
    } catch {}
  }

  // Tier 3: Installed skill template directories (~/.agents/skills/*/templates/)
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillName = entry.name
        for (const candidate of candidateNames) {
          const p1 = path.join(skillsDir, skillName, 'templates', candidate)
          checkedPaths.push(p1)
          try {
            const st = await fs.stat(p1)
            if (st.isFile())
              return { name: templateName, filePath: p1, source: 'skill', skillName }
          } catch {}

          const p2 = path.join(skillsDir, skillName, candidate)
          checkedPaths.push(p2)
          try {
            const st = await fs.stat(p2)
            if (st.isFile())
              return { name: templateName, filePath: p2, source: 'skill', skillName }
          } catch {}
        }
      }
    }
  } catch {}

  return null
}

export function resolveTemplatePathSync(
  templateName: string,
  options?: MultiStoreResolverOptions,
): SpecTemplateLocation | null {
  const fs = require('node:fs')
  const path = require('node:path')
  const os = require('node:os')

  const workspaceDir = options?.workspaceDir ?? process.cwd()
  const globalTemplatesDir =
    options?.globalTemplatesDir ?? path.join(os.homedir(), '.agents', 'templates')
  const skillsDir = options?.skillsDir ?? path.join(os.homedir(), '.agents', 'skills')

  const candidateNames = templateName.endsWith('.md')
    ? [templateName]
    : [`${templateName}.md`, templateName]

  // Tier 1: Workspace-local directory
  for (const candidate of candidateNames) {
    const p1 = path.join(workspaceDir, 'templates', candidate)
    if (fs.existsSync(p1) && fs.statSync(p1).isFile()) {
      return { name: templateName, filePath: p1, source: 'workspace' }
    }
    const p2 = path.join(workspaceDir, candidate)
    if (fs.existsSync(p2) && fs.statSync(p2).isFile()) {
      return { name: templateName, filePath: p2, source: 'workspace' }
    }
    const p3 = path.join(workspaceDir, 'specs', candidate)
    if (fs.existsSync(p3) && fs.statSync(p3).isFile()) {
      return { name: templateName, filePath: p3, source: 'workspace' }
    }
  }

  // Tier 2: Global user agents directory
  for (const candidate of candidateNames) {
    const p = path.join(globalTemplatesDir, candidate)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return { name: templateName, filePath: p, source: 'global' }
    }
  }

  // Tier 3: Installed skill template directories
  if (fs.existsSync(skillsDir)) {
    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillName = entry.name
          for (const candidate of candidateNames) {
            const p1 = path.join(skillsDir, skillName, 'templates', candidate)
            if (fs.existsSync(p1) && fs.statSync(p1).isFile()) {
              return { name: templateName, filePath: p1, source: 'skill', skillName }
            }
            const p2 = path.join(skillsDir, skillName, candidate)
            if (fs.existsSync(p2) && fs.statSync(p2).isFile()) {
              return { name: templateName, filePath: p2, source: 'skill', skillName }
            }
          }
        }
      }
    } catch {}
  }

  return null
}
