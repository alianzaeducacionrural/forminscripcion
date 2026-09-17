import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Monorepo: cada formulario vive en su propia subcarpeta pero se publica bajo su
// propio slug dentro del mismo sitio de GitHub Pages. `base` debe coincidir siempre
// con SITE_SLUG en ../../.github/workflows/deploy.yml.
export default defineConfig({
  plugins: [react()],
  base: '/forminscripcion/pretest-postest-metodologias-activas/',
})
