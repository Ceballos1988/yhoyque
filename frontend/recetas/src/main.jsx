import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import "./styles/main.css";

/**
 * Renderiza la aplicación principal.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 🔹 Registrar el Service Worker en desarrollo y producción
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log("✅ Service Worker registrado correctamente:", registration);

        // Si hay un nuevo SW esperando a ser activado
        if (registration.waiting) {
          showUpdatePrompt();
        }

        // Escuchar si hay una nueva actualización disponible
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          console.log("🔄 Nueva versión del Service Worker encontrada...");

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Hay una nueva versión lista para ser usada
                console.log("🆕 Nueva versión instalada y lista.");
                showUpdatePrompt();
              } else {
                // El Service Worker está instalado por primera vez
                console.log("🚀 Service Worker instalado por primera vez.");
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error("❌ Error al registrar el Service Worker:", error);
      });
  });
}

// 🔹 Mostrar un mensaje para actualizar la app cuando haya una nueva versión
function showUpdatePrompt() {
  if (!localStorage.getItem('swUpdated')) {
    const updateConfirmed = confirm('Nueva versión disponible. ¿Actualizar ahora?');

    if (updateConfirmed) {
      localStorage.setItem('swUpdated', 'true');  // Prevenir recargas infinitas
      window.location.reload();                   // Recargar la app para usar el nuevo SW
    }
  }
}
