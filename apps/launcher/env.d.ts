/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_FILE_FORMAT_URL: string
  readonly VITE_FOLDER_FORMAT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
