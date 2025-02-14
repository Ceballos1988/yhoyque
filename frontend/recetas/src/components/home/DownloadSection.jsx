import { useState, useEffect } from "react";
import "../../styles/components/home/style.downloadSection.css";

function DownloadSection() {
  const [canShare, setCanShare] = useState(false);

  // Verificar si la API de compartir está disponible
  useEffect(() => {
    if (navigator.share) {
      console.log("📤 API de compartir disponible.");
      setCanShare(true);
    } else {
      console.log("🚫 API de compartir no soportada en este navegador.");
    }
  }, []);

  // Función para compartir la app
  const handleShareApp = async () => {
    try {
      await navigator.share({
        title: "¿Y HOY QUÉ?",
        text: "¡Descubrí las mejores recetas personalizadas y gestioná tus listas de compras sin conexión!",
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
          <h2 id="download-title" className="section-title text-left text-3xl font-bold pb-10 text-azul-bg">
            ACCEDÉ A LA APP EN CUALQUIER MOMENTO</h2>

          <p className="text-white text-left">
            Nuestra aplicación funciona como una <strong>PWA</strong>, lo que te permite acceder rápidamente desde tu navegador y gestionar tus <strong>listas de compras</strong> incluso sin conexión.
          </p>

          <p className="text-white text-left mt-4">
            No es necesario descargar nada desde una tienda de apps. Simplemente visitá nuestra web y utilizala como una app en tu dispositivo móvil o computadora.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {canShare && (
             <button
             className="button-download mt-6 font-raleway font-bold text-white text-left"
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
            alt="Ilustración representando el acceso offline"
            className="download-image"
          />
        </div>
      </div>
    </section>
  );
}

export default DownloadSection;
