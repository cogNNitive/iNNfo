import { parseFrontmatter } from '@innv0/format-core'
import type { DetectionResult } from '../types'

export interface FileEntry {
  name: string
  relativePath: string
  content: string
}

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

export function findFormatMd(files: File[]): File | null {
  for (const file of files) {
    if (file.name === '_FORMAT.md') return file
  }
  return null
}

export function findFormatFiles(files: File[]): File[] {
  return files.filter(f => f.name.endsWith('.md') && f.name !== '_FORMAT.md')
}

export async function detectFileMode(file: File): Promise<DetectionResult> {
  const content = await readFileAsText(file)
  const fm = parseFrontmatter(content)

  if (!fm) {
    return {
      mode: 'NONE',
      title: file.name,
      errors: ['No FORMAT frontmatter found'],
    }
  }

  const rawMode = fm.mode
  const modes = rawMode
    ? (Array.isArray(rawMode) ? rawMode : [rawMode])
    : []

  const isFile = modes.includes('FILE')
  const isFolder = modes.includes('FOLDER')

  return {
    mode: isFile && isFolder ? 'BOTH' : isFile ? 'FILE' : isFolder ? 'FOLDER' : 'NONE',
    title: (fm.title as string) || file.name,
    template: fm.specification_version as string,
    version: fm.model_version as string,
    errors: (!isFile && !isFolder) ? ['Frontmatter exists but mode is not FILE or FOLDER'] : [],
    fileName: file.name,
  }
}

export async function detectFolderMode(files: File[]): Promise<DetectionResult> {
  const formatMd = findFormatMd(files)
  if (!formatMd) {
    return {
      mode: 'NONE',
      title: 'Unknown Folder',
      errors: ['No _FORMAT.md found in this directory'],
    }
  }

  const content = await readFileAsText(formatMd)
  const fm = parseFrontmatter(content)

  if (!fm) {
    return {
      mode: 'NONE',
      title: formatMd.name,
      errors: ['_FORMAT.md has no valid frontmatter'],
    }
  }

  const rawMode = fm.mode
  const modes = rawMode
    ? (Array.isArray(rawMode) ? rawMode : [rawMode])
    : []

  const isFile = modes.includes('FILE')
  const isFolder = modes.includes('FOLDER')

  const folderName = files[0]?.webkitRelativePath?.split(/[\\\/]/)[0] ?? formatMd.name

  return {
    mode: isFile && isFolder ? 'BOTH' : isFolder ? 'FOLDER' : isFile ? 'FILE' : 'NONE',
    title: (fm.title as string) || 'Unknown Folder',
    template: fm.specification_version as string,
    version: fm.model_version as string,
    errors: (!isFile && !isFolder) ? ['_FORMAT.md frontmatter does not declare FILE or FOLDER mode'] : [],
    fileName: formatMd.name,
    folderName,
  }
}
