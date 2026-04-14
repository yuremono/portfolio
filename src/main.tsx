import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './scss/globals.scss'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
