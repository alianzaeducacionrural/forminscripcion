import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import AdminPanel from './admin/AdminPanel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminPanel />
  </StrictMode>,
)
