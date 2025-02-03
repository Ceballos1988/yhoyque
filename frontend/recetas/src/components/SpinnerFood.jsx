import "../styles/components/SpinnerFood.css";
import { useState, useEffect } from "react";

const LoadingSpinner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000); // Tiempo antes de desvanecer
    return () => clearTimeout(timer); // Limpia el temporizador
  }, []);

  return (
    <div className={`preloader ${!isVisible ? "hidden" : ""}`}>
      <img src="/img/icon-192x192.png" alt="Loading" className="spinner-image" />
    </div>
  );
};

export default LoadingSpinner;
