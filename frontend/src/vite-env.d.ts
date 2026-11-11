/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BACKEND_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

