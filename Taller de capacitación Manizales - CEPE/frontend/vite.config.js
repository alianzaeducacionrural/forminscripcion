import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Repo: alianzaeducacionrural/forminscripcion (monorepo de formularios de
// inscripción — cada formulario vive en su propia subcarpeta y se publica
// bajo su propio slug dentro del mismo sitio de Pages). Debe coincidir con
// SITE_SLUG en .github/workflows/deploy.yml.
export default defineConfig({
  plugins: [react()],
  base: '/forminscripcion/metodologias-activas-manizales/',
})
