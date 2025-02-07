import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/main.css";

/**
 * Renderiza la aplicación principal.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 🔹 Registrar el Service Worker en desarrollo y producción
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register('/service-worker.js')
  .then((registration) => {
    console.log("✅ Service Worker registrado correctamente:", registration);

    if (registration.waiting) {
      showUpdatePrompt();
    }

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            console.log("🆕 Nueva versión instalada y lista.");
            showUpdatePrompt();
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


    // 🔹 Manejar el evento de instalación de la PWA
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log("📲 La app está lista para ser instalada.");

      // Mostrar un botón personalizado para instalar
      const installButton = document.createElement("button");
      installButton.textContent = "Instalar App";
      installButton.style.position = "fixed";
      installButton.style.bottom = "20px";
      installButton.style.right = "20px";
      installButton.style.backgroundColor = "#ff8c00";
      installButton.style.color = "white";
      installButton.style.padding = "10px 20px";
      installButton.style.border = "none";
      installButton.style.borderRadius = "5px";
      installButton.style.cursor = "pointer";
      document.body.appendChild(installButton);

      installButton.addEventListener("click", () => {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("👍 Instalación aceptada");
          } else {
            console.log("👎 Instalación rechazada");
          }
          window.deferredPrompt = null; // Resetear el prompt
          installButton.remove(); // Ocultar el botón después de la instalación
        });
      });
    });
  });
}

// 🔹 Mostrar un mensaje para actualizar la app cuando haya una nueva versión
function showUpdatePrompt() {
  if (!localStorage.getItem("swUpdated")) {
    const updateConfirmed = confirm(
      "Nueva versión disponible. ¿Actualizar ahora?"
    );

    if (updateConfirmed) {
      localStorage.setItem("swUpdated", "true"); // Prevenir recargas infinitas
      window.location.reload(); // Recargar la app para usar el nuevo SW
    }
  }
}
