import { parseFrontmatter } from '@innv0/format-core'
import { validateFormatContent } from './validator'
import type { ScannedFolder, ScannedItem } from '../types'

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function collectFiles(items: DataTransferItemList): File[] {
  const files: File[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry()
      if (entry?.isDirectory) {
        files.push(...collectDirectoryEntries(entry as any))
      } else if (entry?.isFile) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    } else {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }
  return files
}

function collectDirectoryEntries(entry: any): File[] {
  const files: File[] = []
  const reader = entry.createReader()
  function readEntries(): Promise<void> {
    return new Promise((resolve) => {
      reader.readEntries((entries: any[]) => {
        if (entries.length === 0) return resolve()
        let pending = entries.length
        for (const e of entries) {
          if (e.isDirectory) {
            files.push(...collectDirectoryEntries(e))
            pending--
            if (pending === 0) resolve()
          } else {
            ;(e as any).file((file: File) => {
              files.push(file)
              pending--
              if (pending === 0) resolve()
            })
          }
        }
      })
    })
  }
  return files
}

function normPath(p: string): string {
  return p.replace(/\\/g, '/')
}

interface FileEntry {
  file: File
  relativePath: string
}

export async function scanFolderContents(files: File[]): Promise<ScannedFolder> {
  if (files.length === 0) {
    return { name: 'Empty', rootFormat: false, rootErrors: ['No files'], items: [], totalFiles: 0, totalFolders: 0 }
  }

  const first = files[0]
  let folderName: string
  const entries: FileEntry[] = []

  if (first.webkitRelativePath) {
    const root = normPath(first.webkitRelativePath).split('/')[0]
    folderName = root
    for (const f of files) {
      const rel = normPath(f.webkitRelativePath)
      entries.push({ file: f, relativePath: rel.slice(root.length + 1) })
    }
  } else {
    folderName = first.name
    for (const f of files) {
      entries.push({ file: f, relativePath: f.name })
    }
  }

  const formatMdByDir = new Map<string, FileEntry>()
  const mdFiles = new Map<string, FileEntry>()

  for (const e of entries) {
    if (e.file.name === '_FORMAT.md') {
      const dir = e.relativePath.replace(/\/?_FORMAT\.md$/, '') || ''
      formatMdByDir.set(dir, e)
    } else if (e.file.name.endsWith('.md')) {
      mdFiles.set(e.relativePath, e)
    }
  }

  // Root _FORMAT.md
  const rootEntry = formatMdByDir.get('')
  let rootTitle: string | undefined
  let rootMode: string | undefined
  let rootValidation = undefined
  const rootErrors: string[] = []

  if (rootEntry) {
    const content = await readFileAsText(rootEntry.file)
    const fm = parseFrontmatter(content)
    if (fm) {
      rootTitle = (fm.title as string) || folderName
      rootMode = Array.isArray(fm.mode) ? fm.mode.join(', ') : (fm.mode as string)
      rootValidation = validateFormatContent(content, '_FORMAT.md', rootMode)
    } else {
      rootErrors.push('Root _FORMAT.md has no valid FORMAT frontmatter')
    }
  } else {
    rootErrors.push('No _FORMAT.md found in root')
  }

  const items: ScannedItem[] = []

  // Subfolders with _FORMAT.md
  for (const [dir, e] of formatMdByDir) {
    if (dir === '') continue
    const content = await readFileAsText(e.file)
    const fm = parseFrontmatter(content)
    const compliant = !!fm
    const mode = compliant
      ? (Array.isArray(fm!.mode) ? fm!.mode.join(', ') : (fm!.mode as string))
      : undefined
    items.push({
      kind: 'folder',
      name: dir.split('/').pop() || dir,
      relativePath: dir,
      title: compliant ? ((fm!.title as string) || undefined) : undefined,
      mode,
      compliant,
      errors: compliant ? [] : ['Invalid FORMAT frontmatter'],
      validation: compliant ? validateFormatContent(content, '_FORMAT.md', mode) : undefined,
    })
  }

  // Markdown files
  for (const [relPath, e] of mdFiles) {
    const content = await readFileAsText(e.file)
    const fm = parseFrontmatter(content)
    const compliant = !!fm
    const mode = compliant
      ? (Array.isArray(fm!.mode) ? fm!.mode.join(', ') : (fm!.mode as string))
      : undefined
    items.push({
      kind: 'file',
      name: e.file.name,
      relativePath: relPath,
      title: compliant ? ((fm!.title as string) || undefined) : undefined,
      mode,
      compliant,
      errors: compliant ? [] : ['No FORMAT frontmatter'],
      validation: compliant ? validateFormatContent(content, e.file.name, mode) : undefined,
    })
  }

  const score = (item: ScannedItem): string => {
    const grp = item.kind === 'folder' ? '0' : '1'
    const ok = item.compliant ? '0' : '1'
    return `${grp}${ok}${item.name.toLowerCase()}`
  }
  items.sort((a, b) => score(a).localeCompare(score(b)))

  return {
    name: folderName,
    rootFormat: !!rootEntry,
    rootTitle,
    rootMode,
    rootErrors,
    rootValidation,
    items,
    totalFiles: mdFiles.size,
    totalFolders: formatMdByDir.size - (rootEntry ? 1 : 0),
  }
}
