import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Renderiza la aplicación principal.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 🔹 Registrar el Service Worker en **desarrollo y producción**
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        if (registration.waiting) {
          showUpdatePrompt();
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdatePrompt();
            }
          };
        };
      })
      .catch(() => {}); // Silenciar errores en producción
  });
}

// 🔹 Función para actualizar solo una vez y evitar recarga infinita
function showUpdatePrompt() {
  if (!localStorage.getItem('swUpdated')) {
    if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
      localStorage.setItem('swUpdated', 'true');
      window.location.reload();
    }
  }
}
