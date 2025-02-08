import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import AOS from "aos";
import "aos/dist/aos.css";
import HeroSection from "../components/home/HeroSection";
import DescriptionSection from "../components/home/DescriptionSection";
import FeaturesSection from "../components/home/FeaturesSection";
import CommunitySection from "../components/home/CommunitySection";
import TestimonialCarousel from "../components/home/TestimonialCarousel";
import SpinnerFood from "../components/SpinnerFood";
import "animate.css";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para el spinner
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 1000,
      delay: 0,
    });

    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuthentication();

    // Mostrar el spinner cada vez que se entra a Home
    const timer = setTimeout(() => {
      setIsLoading(false); // Ocultar el spinner después de la carga completa
    }, 4000); // Ajusta el tiempo según tus necesidades

    window.addEventListener("authChanged", checkAuthentication);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("authChanged", checkAuthentication);
    };
  }, []);

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

  // Mostrar Spinner mientras carga
  if (isLoading) {
    return <SpinnerFood />;
  }

  // Mostrar el contenido cuando termine de cargar
  return (
    <ParallaxProvider>
      <div className="home-container flex flex-col bg-azul-bg">
        <HeroSection isAuthenticated={isAuthenticated} logout={logout} />
        <DescriptionSection />
        <FeaturesSection />
        <CommunitySection />
        <TestimonialCarousel />
      </div>
    </ParallaxProvider>
  );
}

export default Home;
