/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_Base_Url: string
  readonly VITE_Busi_Url: string

  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
