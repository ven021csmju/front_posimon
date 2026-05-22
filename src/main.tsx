import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      richColors 
      position="top-right" 
      theme="dark" 
      toastOptions={{
        style: {
          background: '#100c0c',
          border: '1px solid rgba(214, 182, 107, 0.2)',
          color: '#fff',
        },
      }}
    />
  </StrictMode>,
)
