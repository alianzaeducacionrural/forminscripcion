import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Monorepo: cada formulario se publica bajo su propio slug dentro del mismo sitio de
// GitHub Pages. `base` debe coincidir siempre con SITE_SLUG_5 en ../../.github/workflows/deploy.yml.
// Dos páginas HTML independientes (sin router): el formulario y el panel /admin/.
export default defineConfig({
  plugins: [react()],
  base: '/forminscripcion/percepcion-pertinencia-programa/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
