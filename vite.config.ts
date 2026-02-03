import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { join } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Workers: 25 MiB per asset. Remove videos from dist; host them on R2 and set VITE_VIDEO_BASE_URL.
    {
      name: 'remove-videos-from-dist',
      closeBundle() {
        try {
          rmSync(join(process.cwd(), 'dist', 'videos'), { recursive: true })
        } catch {
          // ignore
        }
      },
    },
  ],
})
