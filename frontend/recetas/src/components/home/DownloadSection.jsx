import { useState, useEffect } from "react";
import "../../styles/components/home/style.downloadSection.css";

function DownloadSection() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Detectar si la app puede instalarse
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log("📲 La app está lista para ser instalada.");
      e.preventDefault();  // Prevenir el comportamiento por defecto
      setDeferredPrompt(e);  // Guardar el evento para usar más tarde
      setIsInstallable(true);  // Mostrar el botón de instalación
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Verificar si la app ya está instalada y si la API de compartir está disponible
  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        console.log("✅ La app ya está instalada.");
        setIsInstallable(false);  // Ocultar el botón si ya está instalada
      } else {
        console.log("🌐 La app no está instalada, mostrando el botón.");
      }
    };

    checkIfInstalled();

    window.addEventListener("appinstalled", () => {
      console.log("✅ La aplicación ha sido instalada.");
      setIsInstallable(false);  // Ocultar el botón después de la instalación
    });

    // Mostrar el botón si está en modo navegador
    if (window.matchMedia("(display-mode: browser)").matches) {
      console.log("🌐 La app está en modo navegador.");
      setIsInstallable(true);
    }

    // Verificar si la API de compartir está disponible
    if (navigator.share) {
      console.log("📤 API de compartir disponible.");
      setCanShare(true);
    } else {
      console.log("🚫 API de compartir no soportada en este navegador.");
    }
  }, []);

  // Función para instalar la app
  const handleInstallApp = () => {
    if (deferredPrompt) {
      console.log("🛠️ Lanzando el prompt de instalación...");
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          console.log("👍 Instalación aceptada.");
        } else {
          console.log("👎 Instalación rechazada.");
        }
        setDeferredPrompt(null);  // Resetear el prompt después de usarlo
        setIsInstallable(false);  // Ocultar el botón después de intentar instalar
      }).catch((error) => {
        console.error("❌ Error durante la instalación:", error);
      });
    } else {
      console.warn("⚠️ No hay prompt de instalación disponible.");
    }
  };

  // Función para compartir la app
  const handleShareApp = async () => {
    try {
      await navigator.share({
        title: "¿Y HOY QUÉ?",
        text: "¡Descubrí las mejores recetas personalizadas!",
        url: window.location.href,
      });
      console.log("📤 Contenido compartido con éxito.");
    } catch (error) {
      console.error("❌ Error al compartir:", error);
    }
  };

  return (
    <section 
      className="download-section bg-naranja-bg text-white py-10 relative" 
      data-aos="fade-up" 
      aria-labelledby="download-title"
    >
      <div className="download-content container mx-auto flex flex-col lg:flex-row justify-center items-center gap-10">
        <div className="download-text lg:w-1/2 text-left mt-10 mb-10 ml-10">
          <h2 id="download-title" className="section-title text-left pb-10 text-azul-bg">
            ¡DESCARGÁ NUESTRA APP!
          </h2>

          <p className="text-white text-left">
            Llevá tus recetas favoritas siempre con vos. Nuestra aplicación está diseñada como una <strong>PWA</strong>, lo que significa que podés descargarla directamente desde tu navegador y acceder a todas las recetas sin conexión.
          </p>

          <p className="text-white text-left mt-4">
            Disfrutá de la flexibilidad de tener recetas personalizadas y actualizaciones automáticas sin la necesidad de una app store. Compatible con dispositivos Android, iOS, tablets y computadoras de escritorio.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {isInstallable ? (
              <button
                className="button-download mt-6 font-raleway font-bold text-white mx-auto text-center"
                onClick={handleInstallApp}
                aria-label="Instalar la aplicación desde el navegador"
              >
                Instalar la App
              </button>
            ) : (
              <p className="text-center text-sm mt-4">
                {deferredPrompt === null 
                  ? "La app ya está instalada o no está disponible para instalar."
                  : "La app está lista para instalar."
                }
              </p>
            )}

            {canShare && (
              <button
                className="button-download mt-6 font-raleway font-bold text-white mx-auto text-center"
                onClick={handleShareApp}
                aria-label="Compartir la aplicación"
              >
                Compartir la App
              </button>
            )}
          </div>
        </div>

        <div className="download-image-container flex justify-center">
          <img
            src="/img/download-app.png"
            alt="Representación visual de la app para descargar"
            className="download-image"
          />
        </div>
      </div>
    </section>
  );
}

export default DownloadSection;
