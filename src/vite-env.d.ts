/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端地址前缀；开发环境留空由 Vite 代理。 */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
