import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import AOS from "aos";
import "aos/dist/aos.css";
import HeroSection from "../components/home/HeroSection";
import DescriptionSection from "../components/home/DescriptionSection";
import FeaturesSection from "../components/home/FeaturesSection";
import DownloadSection from "../components/home/DownloadSection";
import CommunitySection from "../components/home/CommunitySection";
import TestimonialCarousel from "../components/home/TestimonialCarousel";
import SpinnerFood from "../components/SpinnerFood";
import "animate.css";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para el spinner
  const [imagesLoaded, setImagesLoaded] = useState(0); // Control de imágenes cargadas
  const [totalImages, setTotalImages] = useState(0); // Total de imágenes en la página
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ once: true, duration: 1000, delay: 0 });

    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuthentication();
    window.addEventListener("authChanged", checkAuthentication);

    // Contar todas las imágenes en la página cuando se monte
    const allImages = document.querySelectorAll("img");
    setTotalImages(allImages.length);

    // Verificar si no hay imágenes para ocultar el spinner rápidamente
    if (allImages.length === 0) {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener("authChanged", checkAuthentication);
    };
  }, []);

  // Verificar si todas las imágenes están cargadas
  useEffect(() => {
    if (totalImages > 0 && imagesLoaded === totalImages) {
      setIsLoading(false); // Ocultar spinner cuando todas las imágenes estén cargadas
    }
  }, [imagesLoaded, totalImages]);

  // Función para manejar la carga de cada imagen
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (isLoading) {
    return <SpinnerFood />;
  }

  return (
    <ParallaxProvider>
      <div className="home-container flex flex-col bg-azul-bg">
        {/* Pasar handleImageLoad como prop a los componentes que contienen imágenes */}
        <HeroSection isAuthenticated={isAuthenticated} logout={logout} onImageLoad={handleImageLoad} />
        <DescriptionSection onImageLoad={handleImageLoad} />
        <FeaturesSection onImageLoad={handleImageLoad} />
        <DownloadSection onImageLoad={handleImageLoad} />
        <CommunitySection onImageLoad={handleImageLoad} />
        <TestimonialCarousel onImageLoad={handleImageLoad} />
      </div>
    </ParallaxProvider>
  );
}

export default Home;
