import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        console.log('✅ Service worker registered:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Service worker registration failed:', err);
      });
  });
}


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="105930651413-f1qiqueslllsf7c9ulf7aak20gltb0kl.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>,
  </GoogleOAuthProvider>
)
