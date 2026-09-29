import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import PlanAccionForm from './plan/PlanAccionForm.jsx'
import { HERRAMIENTA_PLAN_ACCION } from './data/catalogos.js'
import { submitPlanAccion } from './api.js'

document.documentElement.dataset.tema = HERRAMIENTA_PLAN_ACCION.tema

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlanAccionForm config={HERRAMIENTA_PLAN_ACCION} enviar={submitPlanAccion} />
  </StrictMode>,
)
