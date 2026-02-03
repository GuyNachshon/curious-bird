/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIDEO_BASE_URL?: string
}

declare module '*.csv?raw' {
  const content: string;
  export default content;
}
