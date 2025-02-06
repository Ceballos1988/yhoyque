import { useEffect, useState } from "react";
import "../../styles/components/home/style.downloadSection.css";

function DownloadSection() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Detectar si la app puede instalarse
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Verificar si ya está instalada
  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstallable(false);
      }
    };

    checkIfInstalled();

    window.addEventListener("appinstalled", () => {
      console.log("La aplicación ha sido instalada.");
      setIsInstallable(false);
    });

    // Verificar si la API de compartir está disponible
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  // Función para instalar la app
  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          console.log("La instalación fue aceptada.");
        } else {
          console.log("La instalación fue rechazada.");
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("La instalación no está disponible en este momento. Intenta desde el navegador.");
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
      console.log("Contenido compartido con éxito.");
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  return (
    <section className="download-section bg-naranja-bg text-white py-10 relative" data-aos="fade-up" aria-labelledby="download-title">
      <div className="floating-vegetables" aria-hidden="true">
        {["07", "09", "10", "11", "12", "13", "14", "15"].map((num, index) => (
          <img
            key={index}
            src={`/img/verduras-${num}.png`}
            alt={`Verdura decorativa número ${num}`}
            className={`floating-vegetable vegetable-${index + 1}`}
          />
        ))}
      </div>

      <div className="download-content container mx-auto flex flex-col lg:flex-row justify-center items-center gap-10">
        <div className="download-text lg:w-1/2 text-left mt-10 mb-10 ml-10">
          <h2 id="download-title" className="section-title text-left pb-10 text-azul-bg">
            ¡DESCARGÁ NUESTRA APP!
          </h2>

          <p className="text-white text-left">
            Llevá tus recetas favoritas siempre con vos. Nuestra aplicación está diseñada como una <strong>PWA</strong>, lo que
            significa que podés descargarla directamente desde tu navegador y acceder a todas las recetas sin conexión.
          </p>

          <p className="text-white text-left mt-4">
            Disfrutá de la flexibilidad de tener recetas personalizadas y actualizaciones automáticas sin la necesidad de una app store.
            Compatible con dispositivos Android, iOS, tablets y computadoras de escritorio.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {isInstallable && (
              <button
                className="button-download mt-6 font-raleway font-bold text-white mx-auto text-center"
                onClick={handleInstallApp}
                aria-label="Instalar la aplicación desde el navegador"
              >
                Instalar la App
              </button>
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
