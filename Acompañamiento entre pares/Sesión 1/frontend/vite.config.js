import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Monorepo: cada formulario vive en su propia subcarpeta pero se publica bajo su
// propio slug dentro del mismo sitio de GitHub Pages. `base` debe coincidir siempre
// con SITE_SLUG_4 en ../../.github/workflows/deploy.yml.
//
// App multi-página (sin react-router): landing, experimentados, nuevos y admin son
// páginas HTML independientes, cada una con su propio punto de entrada, para que
// cada enlace sea una URL real y autónoma.
export default defineConfig({
  plugins: [react()],
  base: '/forminscripcion/acompanamiento-pares-sesion-1/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        experimentados: resolve(import.meta.dirname, 'experimentados/index.html'),
        nuevos: resolve(import.meta.dirname, 'nuevos/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
