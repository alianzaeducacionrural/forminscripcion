import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import PostestForm from './postest/PostestForm.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostestForm />
  </StrictMode>,
)
