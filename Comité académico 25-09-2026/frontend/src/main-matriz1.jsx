import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import MatrizForm from './matriz/MatrizForm.jsx'
import { MATRIZ_1 } from './data/catalogos.js'
import { submitMatriz1 } from './api.js'

document.documentElement.dataset.tema = MATRIZ_1.tema

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MatrizForm config={MATRIZ_1} enviar={submitMatriz1} />
  </StrictMode>,
)
