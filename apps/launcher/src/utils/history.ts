import type { FolderHistoryEntry } from '../types'

const STORAGE_KEY = 'launcher_folder_history'
const MAX_ENTRIES = 10

export function loadHistory(): FolderHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FolderHistoryEntry[]) : []
  } catch {
    return []
  }
}

export function addToHistory(name: string, path: string): void {
  const history = loadHistory()
  const filtered = history.filter(e => e.path !== path)
  const entry: FolderHistoryEntry = { name, path, timestamp: Date.now() }
  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function removeFromHistory(path: string): void {
  const history = loadHistory()
  const updated = history.filter(e => e.path !== path)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}
