import type { DirectoryHandleLike, FileHandleLike } from '../../src/model/fs-types'

/** In-memory tree description used to build fake FS Access API handles for tests. */
export type FakeTree = { [name: string]: string | FakeTree }

class FakeFileHandle implements FileHandleLike {
  kind: 'file' = 'file'
  constructor(public name: string, private content: string) {}
  async getFile() {
    const content = this.content
    return { async text() { return content } }
  }
}

class FakeDirectoryHandle implements DirectoryHandleLike {
  kind: 'directory' = 'directory'
  constructor(public name: string, private tree: FakeTree) {}

  async *entries(): AsyncIterableIterator<[string, FileHandleLike | DirectoryHandleLike]> {
    for (const [entryName, value] of Object.entries(this.tree)) {
      if (typeof value === 'string') {
        yield [entryName, new FakeFileHandle(entryName, value)]
      } else {
        yield [entryName, new FakeDirectoryHandle(entryName, value)]
      }
    }
  }

  async getFileHandle(name: string): Promise<FileHandleLike> {
    const value = this.tree[name]
    if (typeof value !== 'string') {
      throw new Error(`File not found: ${name}`)
    }
    return new FakeFileHandle(name, value)
  }
}

/** Builds a fake root DirectoryHandleLike from a plain nested object tree. */
export function buildFakeTree(name: string, tree: FakeTree): DirectoryHandleLike {
  return new FakeDirectoryHandle(name, tree)
}
