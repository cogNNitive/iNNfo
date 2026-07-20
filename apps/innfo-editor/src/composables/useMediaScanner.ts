/**
 * useMediaScanner — scans element folders for media files (images, video, audio,
 * markdown, pdf, etc.) and returns discovered assets for display in BlockPill,
 * NodeMedia, and BlockSheet.
 *
 * Follows the same folder conventions as resolveElementAssets() in recursiveParser.ts:
 *   - per-element mode:  {modelDir}/{slug}/{filename}
 *   - centralized mode:  {modelDir}/assets/{slug}_{filename}
 *
 * The scanner tries per-element first, then falls back to centralized.
 */
import type { DirectoryHandleLike } from '@cogNNitive/cogNNitive-core'

export interface ScannedAsset {
  filename: string
  relativePath: string
  type: 'image' | 'video' | 'audio' | 'markdown' | 'pdf' | 'file'
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'])
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'])
const AUDIO_EXTS = new Set(['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'])
const MARKDOWN_EXTS = new Set(['md', 'txt'])
const PDF_EXTS = new Set(['pdf'])

function classifyFile(ext: string): ScannedAsset['type'] {
  const clean = ext.toLowerCase().replace(/^\./, '')
  if (IMAGE_EXTS.has(clean)) return 'image'
  if (VIDEO_EXTS.has(clean)) return 'video'
  if (AUDIO_EXTS.has(clean)) return 'audio'
  if (MARKDOWN_EXTS.has(clean)) return 'markdown'
  if (PDF_EXTS.has(clean)) return 'pdf'
  return 'file'
}

/**
 * Scans a directory for media files and classifies them.
 */
async function scanDir(dir: DirectoryHandleLike): Promise<ScannedAsset[]> {
  const results: ScannedAsset[] = []

  for await (const [name, entry] of dir.entries()) {
    if (entry.kind !== 'file') continue
    // Skip iNNfo model files and hidden files
    if (name.startsWith('.') || name.endsWith('_NN.md') || name === 'index.md') continue

    const ext = name.split('.').pop() ?? ''
    const type = classifyFile(ext)

    results.push({
      filename: name,
      relativePath: name,
      type,
    })
  }

  // Sort: images first, then alphabetical
  results.sort((a, b) => {
    const order = { image: 0, video: 1, audio: 2, markdown: 3, pdf: 4, file: 5 }
    const diff = (order[a.type] ?? 9) - (order[b.type] ?? 9)
    if (diff !== 0) return diff
    return a.filename.localeCompare(b.filename)
  })

  return results
}

/**
 * Scans a node's media folder for discovered files.
 *
 * @param rootHandle  The workspace root DirectoryHandleLike
 * @param slug        Element slug or name (for folder resolution)
 * @returns           Array of discovered ScannedAsset items
 */
export async function scanNodeMedia(
  rootHandle: DirectoryHandleLike,
  slug: string,
): Promise<ScannedAsset[]> {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '_')

  // Try per-element folder first: {slug}/
  try {
    const elDir = await rootHandle.getDirectoryHandle(cleanSlug)
    const assets = await scanDir(elDir)
    if (assets.length > 0) {
      return assets.map((a) => ({
        ...a,
        relativePath: `${cleanSlug}/${a.filename}`,
      }))
    }
  } catch {
    // No per-element folder, try centralized
  }

  // Try centralized assets/ folder: assets/{slug}_*
  try {
    const assetsDir = await rootHandle.getDirectoryHandle('assets')
    const results: ScannedAsset[] = []
    const prefix = `${cleanSlug}_`

    for await (const [name, entry] of assetsDir.entries()) {
      if (entry.kind !== 'file') continue
      if (name.startsWith('.') || name === 'index.md') continue
      // Only pick files prefixed with this element's slug
      if (!name.startsWith(prefix)) continue

      const ext = name.split('.').pop() ?? ''
      const type = classifyFile(ext)

      results.push({
        filename: name,
        relativePath: `assets/${name}`,
        type,
      })
    }

    results.sort((a, b) => {
      const order = { image: 0, video: 1, audio: 2, markdown: 3, pdf: 4, file: 5 }
      const diff = (order[a.type] ?? 9) - (order[b.type] ?? 9)
      if (diff !== 0) return diff
      return a.filename.localeCompare(b.filename)
    })

    return results
  } catch {
    return []
  }
}
