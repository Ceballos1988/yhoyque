import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import "./styles/main.css";

// 📌 Manejar el evento `beforeinstallprompt` para evitar el mensaje en consola
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  if (import.meta.env.MODE === "development") {
    console.log("📌 Instalación manual controlada.");
  }
  window.deferredPrompt = event; // Guardar el evento para mostrarlo después
});

// 📌 Verificar que el elemento root existe antes de renderizar
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("❌ No se encontró el elemento #root en index.html");
}

// ✅ Crear y renderizar la app
createRoot(rootElement).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);

// 🔹 Registrar el Service Worker en producción
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((registration) => {
        if (import.meta.env.MODE === "development") {
          console.log("✅ Service Worker registrado correctamente:", registration);
        }
        if (registration.waiting) {
          console.log("🆕 Nueva versión esperando activación.");
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Detectar cuando hay una nueva versión
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("🔄 Nueva versión disponible.");
                showUpdateNotification();
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error("❌ Error al registrar el Service Worker:", error);
      });
  });

  // 🔹 Detectar cambios en el Service Worker y recargar
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("🔄 Se activó un nuevo Service Worker. Recargando...");
    window.location.reload();
  });
}

/**
 * Muestra un aviso cuando hay una nueva versión del Service Worker disponible.
 */
function showUpdateNotification() {
  const updateDiv = document.createElement("div");
  updateDiv.innerHTML = `
    <div style="
      position: fixed; bottom: 20px; left: 20px; right: 20px;
      background: #ff8c00; color: white; padding: 15px; text-align: center;
      font-size: 16px; font-family: Arial, sans-serif;
      border-radius: 10px; z-index: 1000;">
      🔄 Nueva versión disponible. <button id="refresh-app" style="
        background: white; color: #ff8c00; border: none;
        padding: 5px 10px; margin-left: 10px; cursor: pointer;
        font-size: 14px; border-radius: 5px;">Actualizar</button>
    </div>
  `;
  document.body.appendChild(updateDiv);

  document.getElementById("refresh-app").addEventListener("click", () => {
    window.location.reload();
  });
}
