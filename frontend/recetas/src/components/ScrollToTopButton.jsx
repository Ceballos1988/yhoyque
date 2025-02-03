import { useState, useEffect } from 'react';
import '../styles/components/style.ScrollToTopButton.css';

/**
 * Componente ScrollToTopButton que muestra un botón para volver al inicio de la página cuando se ha hecho scroll hacia abajo.
 * Este botón solo es visible si el desplazamiento vertical supera los 300 píxeles.
 * @component
 * @returns {JSX.Element} Botón de desplazamiento hacia arriba.
 */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Función para mostrar u ocultar el botón según la posición de desplazamiento de la ventana.
   */
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  /**
   * Función para desplazar la ventana suavemente hasta la parte superior.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Limpiar el evento cuando el componente se desmonte
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-button"
          aria-label="Volver al inicio de la página"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
