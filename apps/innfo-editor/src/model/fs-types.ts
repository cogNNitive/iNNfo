/**
 * App re-export — fs-types now live in @cogNNitive/cogNNitive-core.
 * This file preserves import paths for existing app code.
 */
export type { WritableStreamLike, FileHandleLike, DirectoryHandleLike } from '@cogNNitive/cogNNitive-core'
export { isDirectoryHandle, isFileHandle } from '@cogNNitive/cogNNitive-core'
