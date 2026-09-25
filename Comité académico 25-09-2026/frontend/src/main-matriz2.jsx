import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import MatrizForm from './matriz/MatrizForm.jsx'
import { MATRIZ_2 } from './data/catalogos.js'
import { submitMatriz2 } from './api.js'

document.documentElement.dataset.tema = MATRIZ_2.tema

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MatrizForm config={MATRIZ_2} enviar={submitMatriz2} />
  </StrictMode>,
)
