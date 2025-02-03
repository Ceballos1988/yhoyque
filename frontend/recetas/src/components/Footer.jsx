// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import '../styles/pages/style.footer.css';

/**
 * Componente Footer que muestra la parte inferior de la página.
 * Incluye el logo, enlaces a términos y privacidad, iconos de redes sociales y contacto.
 * @component
 * @returns {JSX.Element} - El pie de página de la aplicación.
 */
function Footer() {
  return (
    <footer
      className="footer-container flex flex-col items-center text-center lg:text-left lg:flex-row justify-between p-6 bg-[#0f172b] text-white w-full"
      aria-labelledby="footer-title"
    >
      <h2 id="footer-title" className="sr-only">Pie de página de ¿Y HOY QUÉ?</h2>

      {/* Logo y descripción */}
      <div className="footer-logo mb-4 lg:mb-0 text-lg font-poppins text-center lg:text-left">
        <Link to="/" className="footer-logo-link text-center" aria-label="Ir a la página principal">
          <img src="/img/icon-192x192.png" alt="Logo de ¿Y HOY QUÉ?" className="footer-logo" />
        </Link>
      </div>

      {/* Menú de enlaces */}
      <div className="footer-links flex flex-col items-center lg:items-start space-y-2 mb-4 lg:mb-0">
        <Link to="/terms" className="footer-link" aria-label="Ver Términos y Condiciones">
          Términos y Condiciones
        </Link>
        <Link to="/privacy" className="footer-link" aria-label="Ver Política de Privacidad">
          Política de Privacidad
        </Link>
      </div>

      {/* Redes sociales y contacto */}
      <div className="footer-social flex flex-col items-center lg:items-start space-y-4 mt-4 lg:mt-0">
        
        {/* Iconos sociales */}
        <div className="icon-social flex justify-center space-x-4">
          <a href="https://wa.me/5491138474414" target="_blank" rel="noopener noreferrer" aria-label="Enlace a WhatsApp">
            <img src="/img/whatsapp.png" alt="WhatsApp" className="footer-icon"/>
          </a>
          <a href="https://www.instagram.com/yhoyque_recetas/" target="_blank" rel="noopener noreferrer" aria-label="Enlace a Facebook">
            <img src="/img/facebook.png" alt="Facebook" className="footer-icon"/>
          </a>
          <a href="https://www.instagram.com/yhoyque_recetas/" target="_blank" rel="noopener noreferrer" aria-label="Enlace a Instagram">
            <img src="/img/instagram.png" alt="Instagram" className="footer-icon"/>
          </a>
        </div>
        
        {/* Información de contacto */}
        <div>
          <p className="footer-contact">
            <a href="mailto:yhoyquerecetas@gmail.com" className="footer-link" aria-label="Enviar un correo a yhoyquerecetas@gmail.com">
              yhoyquerecetas@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Derechos reservados */}
      <div className="footer-rights text-center lg:text-left mt-4 lg:mt-0 ">
        &copy; 2024 ¿Y HOY QUÉ? - Todos los derechos reservados
      </div>
    </footer>
  );
}

export default Footer;
