import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import Landing from './Landing.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
