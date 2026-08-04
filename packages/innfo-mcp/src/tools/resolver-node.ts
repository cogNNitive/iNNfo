import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from '@cognnitive/innfo-core'
import type { SpecCache, SpecDocument, SpecFrontmatter, ResolverOptions } from '@cognnitive/innfo-core'

export function isLocalPath(url: string): boolean {
  if (!url) return false
  if (url.startsWith('http://') || url.startsWith('https://')) return false
  if (url.startsWith('file://')) return true
  if (isAbsolute(url)) return true
  if (/^[a-zA-Z]:[/\\]/.test(url)) return true
  if (url.startsWith('.') || url.endsWith('.md') || url.includes('/') || url.includes('\\')) return true
  return false
}

export function toLocalFilePath(url: string, rootDir?: string): string {
  if (url.startsWith('file://')) {
    return fileURLToPath(url)
  }
  if (isAbsolute(url) || /^[a-zA-Z]:[/\\]/.test(url)) {
    return url
  }
  if (rootDir) {
    return join(rootDir, url)
  }
  return url
}

const MAX_DEPTH_DEFAULT = 10

function normalizeVersion(versionStr: string): string {
  let v = versionStr.replace(/^[vV]_?/, '')
  v = v.replace(/[_-]/g, '.')
  return v.trim()
}

function parseSpecName(name: string) {
  // Strip file extensions and NN/FORMAT suffixes
  const clean = name.replace(/\.(md|markdown)$/i, '').replace(/_(NN|FORMAT)$/i, '')
  // Split at _V_ to extract base and version
  const parts = clean.split(/_V_/i)
  const base = parts[0].toLowerCase()
  const rawVersion = parts[1]
  const version = rawVersion ? normalizeVersion(rawVersion) : undefined
  return { base, version }
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...(await getMarkdownFiles(fullPath)))
      } else if (entry.isFile() && /\.(md|markdown)$/i.test(entry.name)) {
        files.push(fullPath)
      }
    }
  } catch {
    // Ignore directory reading issues
  }
  return files
}

async function download(url: string, timeout: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const resp = await fetch(url, { signal: controller.signal })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    return await resp.text()
  } finally {
    clearTimeout(timer)
  }
}

/** Normalized version (dots) declared by a spec document's own frontmatter, if any. */
function versionFromFrontmatter(content: string): string | undefined {
  const fm = parseFrontmatter(content)
  const v = fm?.spec_version ?? fm?.specification_version
  return v ? normalizeVersion(String(v)) : undefined
}

/**
 * Canonical cache name for a downloaded document.
 *
 * The cache filename must reflect the document's OWN version, not the caller's
 * request name. A request for `business` (from a `latest/` URL) must cache as
 * `business_V_0-3-0_NN.md`, so the same spec is never duplicated under a
 * versionless name and a versioned one. Falls back to the request name when the
 * document declares no version.
 */
export function canonicalCacheName(requestName: string, content: string): string {
  const fmVersion = versionFromFrontmatter(content)
  if (!fmVersion) return requestName
  // Preserve the request name's original case (iNNfo, defiNNe, cogNNitive...).
  const base = requestName
    .replace(/\.(md|markdown)$/i, '')
    .replace(/_(NN|FORMAT)$/i, '')
    .split(/_V_/i)[0]
  return `${base}_V_${fmVersion.replace(/\./g, '-')}`
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x - y
  }
  return 0
}

async function matchSpecPath(
  reqParsed: { base: string; version?: string },
  filePath: string,
): Promise<boolean> {
  const fileParsed = parseSpecName(basename(filePath))
  if (fileParsed.base !== reqParsed.base) return false
  if (!reqParsed.version) return true
  if (fileParsed.version) return fileParsed.version === reqParsed.version
  // Unversioned filename: match via the document's own frontmatter version.
  try {
    const content = await readFile(filePath, 'utf-8')
    const fmVersion = versionFromFrontmatter(content)
    return fmVersion !== undefined && fmVersion === reqParsed.version
  } catch {
    return false
  }
}

/** For unversioned requests, prefer the highest version among the matches. */
async function preferHighestVersion(matches: string[]): Promise<string | null> {
  if (matches.length === 0) return null
  let best = matches[0]
  let bestVersion: string | undefined
  for (const m of matches) {
    const nameVersion = parseSpecName(basename(m)).version
    const v = nameVersion ?? versionFromFrontmatter(await readFile(m, 'utf-8').catch(() => ''))
    if (!bestVersion && v) {
      best = m
      bestVersion = v
      continue
    }
    if (bestVersion && v && compareVersions(v, bestVersion) > 0) {
      best = m
      bestVersion = v
    }
  }
  return best
}

async function findSpecInDirs(
  dirs: string[],
  reqName: string,
  listFiles: (dir: string) => Promise<string[]>,
): Promise<string | null> {
  const reqParsed = parseSpecName(reqName)
  const matches: string[] = []
  for (const dir of dirs) {
    for (const filePath of await listFiles(dir)) {
      if (await matchSpecPath(reqParsed, filePath)) matches.push(filePath)
    }
  }
  if (reqParsed.version) return matches[0] ?? null
  return preferHighestVersion(matches)
}

async function findLocalSpec(specsDir: string, reqName: string): Promise<string | null> {
  return findSpecInDirs([specsDir], reqName, getMarkdownFiles)
}

async function listCacheFiles(cacheDir: string): Promise<string[]> {
  try {
    const entries = await readdir(cacheDir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && /\.(md|markdown)$/i.test(e.name))
      .map((e) => join(cacheDir, e.name))
  } catch {
    return []
  }
}

/**
 * Find a spec in the flat `.spec-cache` directory using the same
 * base+version semantics as the local `specs/` lookup, so legacy
 * unversioned cache files and canonical versioned files are interchangeable.
 */
export async function findCachedSpec(cacheDir: string, reqName: string): Promise<string | null> {
  return findSpecInDirs([cacheDir], reqName, listCacheFiles)
}

export async function resolveParentChainNode(
  rootDir: string,
  parentUrl: string,
  parentName: string,
  cacheDir: string,
  options: ResolverOptions = {},
): Promise<SpecCache> {
  const maxDepth = options.maxDepth ?? MAX_DEPTH_DEFAULT
  const timeout = options.timeout ?? 10000
  const specsDirs = [join(rootDir, 'specs'), join(rootDir, '.specs')]
  const specs = new Map<string, SpecDocument>()
  const chain: string[] = []

  let currentUrl: string | undefined = parentUrl
  let currentName: string | undefined = parentName
  let depth = 0

  await mkdir(cacheDir, { recursive: true })

  while (currentUrl && currentName && depth < maxDepth) {
    let content: string | null = null

    // 0. If currentUrl is a local file path or file:// URI, read directly via readFile
    if (isLocalPath(currentUrl)) {
      const localPath = toLocalFilePath(currentUrl, rootDir)
      try {
        content = await readFile(localPath, 'utf-8')
      } catch {
        content = null
      }
    }

    // 1. Try local specs/ or .specs/ directory recursively
    if (content === null) {
      for (const dir of specsDirs) {
        const localPath = await findLocalSpec(dir, currentName)
        if (localPath) {
          content = await readFile(localPath, 'utf-8')
          break
        }
      }
    }

    // 2. Try cache directory (version-agnostic lookup)
    if (content === null) {
      const cachePath = await findCachedSpec(cacheDir, currentName)
      if (cachePath) {
        content = await readFile(cachePath, 'utf-8')
      }
    }

    // 3. Download from network and save to cache directory under the
    //    document's canonical versioned name.
    if (content === null) {
      content = await download(currentUrl, timeout)
      const cacheName = canonicalCacheName(currentName, content)
      await writeFile(join(cacheDir, `${cacheName}_NN.md`), content, 'utf-8')
    }

    const fm = parseFrontmatter(content) ?? ({} as SpecFrontmatter)
    const doc: SpecDocument = {
      name: currentName,
      level: fm.level ?? 0,
      parentName: fm.parent_spec?.name,
      parentUrl: fm.parent_spec?.url,
      frontmatter: fm,
      rawContent: content,
    }
    specs.set(currentName, doc)
    chain.push(currentName)

    currentName = doc.parentName
    currentUrl = doc.parentUrl
    depth++
  }

  if (depth >= maxDepth && currentUrl) {
    throw new Error(`Circular parent chain detected at depth ${maxDepth}`)
  }

  return { specs, chain }
}
