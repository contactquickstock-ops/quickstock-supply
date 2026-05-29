import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import OfflineBanner from './components/OfflineBanner.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <OfflineBanner />
        <Toaster
          position="top-center"
          toastOptions={{ duration: 2000 }}
        />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)

// Fade out and remove the HTML splash screen once React has mounted
const splash = document.getElementById('app-splash')
if (splash) {
  splash.style.opacity = '0'
  setTimeout(() => splash.remove(), 380)
}
