import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate en lugar de Link
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import CustomButton from "../CustomButton";
import "../../styles/components/home/style.heroSection.css";

/**
 * HeroSection - Componente de la sección hero en la página de inicio.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isAuthenticated - Indica si el usuario está autenticado.
 * @param {function} props.logout - Función para cerrar sesión.
 * @returns {JSX.Element} Componente de la sección hero.
 */
function HeroSection({ isAuthenticated, logout }) {
  const [isPaused, setIsPaused] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Estado para mostrar el modal de cierre de sesión
  const navigate = useNavigate(); // Hook para la navegación

  // Manejar el clic en el botón de pausa para alternar la animación
  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  // Función para cerrar sesión tras confirmar
  const handleConfirmLogout = () => {
    setShowLogoutModal(false); // Cerrar el modal
    logout(); // Llamar a la función de logout
  };

  // Función para cancelar el cierre de sesión
  const handleCancelLogout = () => {
    setShowLogoutModal(false); // Solo cerrar el modal sin hacer logout
  };

  // Manejar navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="home-section-hero items-center bg-cover bg-center">

      <div className="content-container-hero">
        
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-content-hero"
        >
          <h1 className=" font-poppins text-white text-center">
            Bienvenidos a <br />
            <span className="text-center mt-5 font-poppins font-semibold text-naranja-bg mb-10">
              ¿Y HOY QUÉ?
            </span>
          </h1>

          <h2 className="font-josefin text-white mb-10 text-center leading-relaxed">
            Recetas que se adaptan a tu día.
          </h2>
          <p className="font-raleway text-white mt-10">
          Descubrí las mejores recetas personalizadas y compartí las tuyas.
          Nuestra comunidad de amantes de la cocina está acá para inspirarte.
          </p>

          <div className="mt-8 button-content-hero">
            {!isAuthenticated ? (
              <>
                <CustomButton
                  text="Iniciar Sesión"
                  bgColor="bg-naranja-bg"
                  textColor="text-white"
                  aria-label="Botón para iniciar sesión"
                  onClick={() => handleNavigate("/login")} // Navega al iniciar sesión
                />
                <CustomButton
                  text="Registrarse"
                  bgColor="bg-white"
                  textColor="text-naranja-bg"
                  aria-label="Botón para registrarse"
                  onClick={() => handleNavigate("/register")} // Navega al registro
                />
              </>
            ) : (
              <>
                <CustomButton
                  text="Mi Perfil"
                  bgColor="bg-naranja-bg"
                  textColor="text-white"
                  aria-label="Botón para ir al perfil"
                  onClick={() => handleNavigate("/profile")} // Navega al perfil
                />
                <CustomButton
                  text="Cerrar Sesión"
                  bgColor="bg-white"
                  textColor="text-naranja-bg"
                  onClick={() => setShowLogoutModal(true)} // Muestra el modal al hacer clic
                  aria-label="Botón para cerrar sesión"
                />
              </>
            )}
          </div>
        </motion.div>

        <div className="image-container-hero">
          <img
            src="/img/hero.png"
            alt="Plato giratorio"
            className={`rotating-image ${isPaused ? "paused" : ""}`}
          />
          <button
            className="pause-button"
            onClick={handlePauseToggle}
            aria-label={isPaused ? "Reanudar animación" : "Pausar animación"}
          >
            <img
              src={`/img/${isPaused ? "play" : "pause"}.png`}
              alt={isPaused ? "Icono para reanudar animación" : "Icono para pausar animación"}
              className="pause-icon"
            />
          </button>
        </div>

      </div>

      {/* Modal de confirmación para Cerrar Sesión */}
      {showLogoutModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
          <div className="modal-content">
            <h2 id="logout-confirm-title" className="modal-header">¿Estás seguro?</h2>
            <p className="modal-body">¿Realmente deseas cerrar sesión?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={handleCancelLogout} aria-label="Cancelar cierre de sesión">
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleConfirmLogout} aria-label="Confirmar cierre de sesión">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

HeroSection.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
};

export default HeroSection;
