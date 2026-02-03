# React + TypeScript + Vite

## Deploy (Cloudflare Workers + R2 for videos)

Workers has a 25 MiB per-asset limit, so videos are not in `dist/`. Host them on **R2**:

1. **Create a public R2 bucket** (Cloudflare dashboard → R2 → Create bucket, e.g. `israel-aharoni-videos`).
2. **Enable public access** (Bucket → Settings → Public access → Allow access, and note the public URL, e.g. `https://pub-xxxx.r2.dev`).
3. **Upload videos** into a `videos/` prefix (so you have `videos/176.mp4`, `videos/637.mp4`, etc.).  
   CLI: `npx wrangler r2 object put israel-aharoni-videos/videos/176.mp4 --file=./public/videos/176.mp4` (create bucket first with `npx wrangler r2 bucket create israel-aharoni-videos` if needed).
4. **Build with the video base URL**: set env `VITE_VIDEO_BASE_URL=https://pub-xxxx.r2.dev` (your bucket’s public URL) in your Cloudflare build settings, then run the build and deploy.

Local dev uses `public/videos/` and `/videos/...`; production uses R2 via `VITE_VIDEO_BASE_URL`.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
