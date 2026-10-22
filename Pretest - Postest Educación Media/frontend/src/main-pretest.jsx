import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import PretestForm from './pretest/PretestForm.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PretestForm />
  </StrictMode>,
)
