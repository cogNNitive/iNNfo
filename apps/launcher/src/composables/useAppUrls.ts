export function useAppUrls() {
  const baseFileUrl = import.meta.env.VITE_FILE_FORMAT_URL ?? 'http://localhost:5175'
  const baseFolderUrl = import.meta.env.VITE_FOLDER_FORMAT_URL ?? 'http://localhost:5174'

  function fileUrl(fileName: string): string {
    const url = new URL(baseFileUrl)
    url.searchParams.set('file', fileName)
    return url.toString()
  }

  function folderUrl(folderName: string): string {
    const url = new URL(baseFolderUrl)
    url.searchParams.set('folder', folderName)
    return url.toString()
  }

  return { fileUrl, folderUrl }
}
