import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from "./auth/AuthProvider";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
     <AuthProvider>
        <App />
      </AuthProvider>
  </StrictMode>
  </BrowserRouter>,
)
