import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import HerramientaForm from './herramienta/HerramientaForm.jsx'
import { HERRAMIENTA_NUEVOS } from './data/catalogos.js'
import { submitNuevos } from './api.js'

document.documentElement.dataset.tema = HERRAMIENTA_NUEVOS.tema

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HerramientaForm config={HERRAMIENTA_NUEVOS} enviar={submitNuevos} />
  </StrictMode>,
)
