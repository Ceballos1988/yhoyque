import { useState } from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";
import LoadingSpinner from "../components/LoadingSpinner"; // Importa el spinner
import "../styles/components/style.userProfileModal.css"; // Añade un archivo CSS para estilizar el modal si es necesario

Modal.setAppElement("#root"); // Necesario para accesibilidad

const UserProfileModal = ({ isOpen, onRequestClose, userDetails }) => {
  const [isImageLoading, setIsImageLoading] = useState(true); // Estado para la carga de la imagen

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Información del Usuario"
      className="user-modal glass-effect"
      overlayClassName="user-modal-overlay"
    >
      {userDetails ? (
        <div className="user-details">
          {/* Botón de cerrar en la parte superior derecha */}
          <button
            onClick={onRequestClose}
            className="close-button-top"
            aria-label="Cerrar modal"
          >
            ✖
          </button>

          {/* Contenedor de la imagen con spinner */}
          <div className="profile-picture-container">
            {isImageLoading && <LoadingSpinner />}{" "}
            {/* Mostrar spinner mientras carga */}
            <img
              src={
                userDetails?.profileImage?.trim()
                  ? userDetails.profileImage
                  : "/img/user-icon.png"
              }
              alt="Foto de perfil del usuario"
              className="profile-picture"
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                e.target.src = "/img/user-icon.png"; // Usa la imagen predeterminada si falla la carga
                setIsImageLoading(false);
              }}
              style={{ display: isImageLoading ? "none" : "block" }}
            />
          </div>

          {/* Nombre del usuario */}
          <h2 className="modal-title">
            <p className="username">
              @{userDetails.username || "usuario_desconocido"}
            </p>
            {userDetails.firstName
              ? userDetails.firstName
              : "Nombre no disponible"}{" "}
            {userDetails.lastName ? userDetails.lastName : ""}
          </h2>

          {/* Biografía del usuario */}
          <p>{userDetails.bio || "Bio: Sin informar"}</p>

          {/* Enlace a Instagram si existe */}
          {userDetails.instagram ? (
            <a
              href={`https://www.instagram.com/${userDetails.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-link flex items-center"
              aria-label={`Ver perfil de Instagram de ${userDetails.instagram}`}
            >
              <img
                src="/img/instagram.png"
                alt="Instagram"
                className="instagram-icon"
                style={{
                  width: "25px",
                  height: "25px",
                  marginRight: "5px",
                  verticalAlign: "middle",
                }}
              />
              @{userDetails.instagram}
            </a>
          ) : (
            <div className="instagram-placeholder flex items-center">
              <img
                src="/img/instagram.png"
                alt="Instagram"
                className="instagram-icon"
                style={{
                  width: "25px",
                  height: "25px",
                  marginRight: "5px",
                  verticalAlign: "middle",
                }}
              />
              <p>Sin informar</p>
            </div>
          )}
        </div>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
    </Modal>
  );
};

UserProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  userDetails: PropTypes.shape({
    profileImage: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string,
    bio: PropTypes.string,
    instagram: PropTypes.string,
  }),
};

export default UserProfileModal;
