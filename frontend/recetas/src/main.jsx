import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";  // Importar BrowserRouter
import App from "./App.jsx";
import "./styles/main.css";

/**
 * Renderiza la aplicación principal.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>  {/* Envolver App con Router */}
      <App />
    </Router>
  </StrictMode>
);

// 🔹 Registrar el Service Worker en producción
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registrado correctamente:", registration);

        // Si hay un Service Worker esperando para activarse, mostrar mensaje
        if (registration.waiting) {
          updateServiceWorker(registration);
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("🆕 Nueva versión instalada y lista.");
                updateServiceWorker(registration);
              } else {
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

/**
 * 🔄 Fuerza la actualización del Service Worker si hay una nueva versión
 * @param {ServiceWorkerRegistration} registration
 */
function updateServiceWorker(registration) {
  if (confirm("Nueva versión disponible. ¿Actualizar ahora?")) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }
}

// 🔹 Escuchar mensajes del Service Worker para aplicar actualizaciones inmediatas
navigator.serviceWorker.addEventListener("controllerchange", () => {
  console.log("🔄 Se activó un nuevo Service Worker. Recargando...");
  window.location.reload();
});
