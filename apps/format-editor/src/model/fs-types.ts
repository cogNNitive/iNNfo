/**
 * Minimal subset of the File System Access API we depend on, so tests
 * can supply lightweight fakes instead of real browser handles.
 */
export interface FileHandleLike {
  kind: 'file'
  name: string
  getFile(): Promise<{ text(): Promise<string> }>
}

export interface DirectoryHandleLike {
  kind: 'directory'
  name: string
  entries(): AsyncIterableIterator<[string, FileHandleLike | DirectoryHandleLike]>
  getFileHandle(name: string): Promise<FileHandleLike>
}

export function isDirectoryHandle(h: FileHandleLike | DirectoryHandleLike): h is DirectoryHandleLike {
  return h.kind === 'directory'
}

export function isFileHandle(h: FileHandleLike | DirectoryHandleLike): h is FileHandleLike {
  return h.kind === 'file'
}
