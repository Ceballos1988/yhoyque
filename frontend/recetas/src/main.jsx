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

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("🆕 Nueva versión lista. Actualizando...");
              window.location.reload();
            }
          };
        };
      })
      .catch((error) => {
        console.error("❌ Error al registrar el Service Worker:", error);
      });
  });

  // 🔹 Detectar cambios en el Service Worker y actualizar automáticamente
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("🔄 Se activó un nuevo Service Worker. Recargando...");
    window.location.reload();
  });
}
