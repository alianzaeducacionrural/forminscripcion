import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Monorepo: cada formulario vive en su propia subcarpeta pero se publica bajo su
// propio slug dentro del mismo sitio de GitHub Pages. `base` debe coincidir siempre
// con SITE_SLUG en ../../.github/workflows/deploy.yml.
//
// App multi-página (sin react-router): landing, pretest, postest y admin son
// 4 páginas HTML independientes, cada una con su propio punto de entrada, para
// que cada enlace ("/pretest/", "/postest/", "/admin/") sea una URL real y
// autónoma — no una ruta de cliente detrás de un fragmento `#` compartido.
export default defineConfig({
  plugins: [react()],
  base: '/forminscripcion/pretest-postest-metodologias-activas/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pretest: resolve(import.meta.dirname, 'pretest/index.html'),
        postest: resolve(import.meta.dirname, 'postest/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
