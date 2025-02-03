import { useState, useEffect, useContext } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { AuthContext } from "../context/AuthContext"; // Importar el contexto de autenticación

/**
 * Componente FavoriteButton que permite a los usuarios agregar o eliminar una receta de sus favoritos.
 * Muestra un botón que cambia según el estado del favorito (guardado o no).
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.recipeId - El ID de la receta que se desea agregar o quitar de favoritos.
 * @returns {JSX.Element} - El componente de botón de favoritos.
 */
const FavoriteButton = ({ recipeId }) => {
  const [isFavorite, setIsFavorite] = useState(false); // Estado que indica si la receta está en favoritos
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const { currentUser } = useContext(AuthContext); // Acceder al usuario actual del contexto

  // Comprobar si la receta está en favoritos al cargar el componente
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) return; // Si no hay usuario, no hacer la solicitud

      const token = localStorage.getItem("token");
      if (!token) return; // Si no hay token, no hacer la solicitud

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      

        if (Array.isArray(response.data.recipes)) {
          const isInFavorites = response.data.recipes.some((favorite) => {
            return favorite._id && favorite._id.toString() === recipeId.toString();
          });
          setIsFavorite(isInFavorites); // Actualiza el estado
        } else {
          console.error("La respuesta no contiene un arreglo de recetas válidas.");
        }
      } catch (error) {
        console.error("Error al verificar los favoritos:", error);
      }
    };

    checkFavoriteStatus();
  }, [recipeId, currentUser]); // Añadir currentUser como dependencia

  // Manejar la acción de agregar o eliminar de favoritos
  const handleFavorite = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token || !currentUser) {
      console.error("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/favorites/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.status === 200) {
          setIsFavorite(false); // Cambiar el estado a "no favorito"
        }
      } else {
        // Agregar a favoritos
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          { recipeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.status === 200) {
          setIsFavorite(true); // Cambiar el estado a "favorito"
        }
      }
    } catch (error) {
      console.error("Error al manejar favorito:", error);
      alert("Hubo un problema al agregar la receta a favoritos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span
      onClick={!isLoading ? handleFavorite : null}
      className={`cursor-pointer text-white ml-4 flex items-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      role="button"
      aria-pressed={isFavorite} // Indicar a los lectores de pantalla si el botón está activado
      aria-label={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"} // Descripción de la acción
    >
      <img
        src={isFavorite ? "/img/saved.svg" : "/img/save-icon.png"}
        alt={isFavorite ? "Icono de guardado" : "Icono de guardar"}
        className="w-5 h-5 mr-1"
      />
      {isFavorite ? "Guardado" : "Guardar"}
    </span>
  );
};

FavoriteButton.propTypes = {
  recipeId: PropTypes.string.isRequired, // ID de la receta que se manejará en favoritos
};

export default FavoriteButton;
