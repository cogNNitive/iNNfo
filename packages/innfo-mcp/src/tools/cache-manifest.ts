/**
 * Local, non-git-tracked integrity manifest for `.spec-cache/`.
 *
 * `.spec-cache/.manifest.json` maps each cached filename to the sha256 of
 * the content that was written, its source URL, and when it was fetched.
 * This lets the resolver detect silent staleness (a cache file whose
 * content changed on disk without going through the cache writer) and
 * treat it as a MISS instead of serving it forever.
 *
 * All writes (the cached `.md` file and the manifest itself) go through
 * `rename`, which is atomic on the same filesystem on both POSIX and NTFS,
 * so a crash or concurrent read never observes a torn/partial file.
 */

import { readFile, rename, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const MANIFEST_FILENAME = '.manifest.json'

export interface ManifestEntry {
  sha256: string
  sourceUrl: string
  fetchedAt: string
}

export type Manifest = Record<string, ManifestEntry>

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Write `content` to `path` atomically: write to a sibling temp file, then
 * rename over the destination. Never leaves a partially-written file at
 * `path` for a concurrent reader to observe.
 */
export async function atomicWriteFile(path: string, content: string): Promise<void> {
  const tmpPath = `${path}.tmp-${process.pid}-${Date.now()}`
  await writeFile(tmpPath, content, 'utf-8')
  await rename(tmpPath, path)
}

async function readManifest(cacheDir: string): Promise<Manifest> {
  try {
    const raw = await readFile(join(cacheDir, MANIFEST_FILENAME), 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Manifest) : {}
  } catch {
    // Missing or corrupt manifest: treat as empty so every cache entry is
    // re-validated (and re-recorded) from here on, rather than failing hard.
    return {}
  }
}

async function writeManifest(cacheDir: string, manifest: Manifest): Promise<void> {
  await mkdir(cacheDir, { recursive: true })
  await atomicWriteFile(join(cacheDir, MANIFEST_FILENAME), JSON.stringify(manifest, null, 2))
}

/**
 * Write a resolved spec into `.spec-cache/` and upsert its integrity entry
 * in the local manifest. Use this from every call site that writes into
 * `.spec-cache/` instead of a bare `writeFile`.
 */
export async function writeSpecToCache(
  cacheDir: string,
  filename: string,
  content: string,
  sourceUrl: string,
): Promise<void> {
  await mkdir(cacheDir, { recursive: true })
  await atomicWriteFile(join(cacheDir, filename), content)

  // Read-merge-write: reload the manifest right before merging so a write
  // from another cache entry in the same run isn't clobbered.
  const manifest = await readManifest(cacheDir)
  manifest[filename] = {
    sha256: hashContent(content),
    sourceUrl,
    fetchedAt: new Date().toISOString(),
  }
  await writeManifest(cacheDir, manifest)
}

/**
 * Check whether a `.spec-cache/` entry's current on-disk `content` still
 * matches its recorded manifest hash. Returns false — a cache MISS — when
 * there is no manifest entry for `filename` or the hash no longer matches,
 * either of which means the file must not be served as valid cached content.
 */
export async function isCacheEntryValid(
  cacheDir: string,
  filename: string,
  content: string,
): Promise<boolean> {
  const manifest = await readManifest(cacheDir)
  const entry = manifest[filename]
  if (!entry) return false
  return entry.sha256 === hashContent(content)
}
