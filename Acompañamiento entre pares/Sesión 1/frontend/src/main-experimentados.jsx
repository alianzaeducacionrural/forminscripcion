import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import HerramientaForm from './herramienta/HerramientaForm.jsx'
import { HERRAMIENTA_EXPERIMENTADOS } from './data/catalogos.js'
import { submitExperimentados } from './api.js'

document.documentElement.dataset.tema = HERRAMIENTA_EXPERIMENTADOS.tema

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HerramientaForm config={HERRAMIENTA_EXPERIMENTADOS} enviar={submitExperimentados} />
  </StrictMode>,
)
