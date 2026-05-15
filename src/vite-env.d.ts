/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DWP_SUPABASE_URL: string
  readonly VITE_DWP_SUPABASE_ANON_KEY: string
  readonly VITE_PUBLIC_SITE_URL: string
  readonly VITE_WRIFE_HUB_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
