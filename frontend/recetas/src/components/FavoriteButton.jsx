import { useState, useEffect, useContext } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { AuthContext } from "../context/AuthContext"; // Importar el contexto de autenticación

const FavoriteButton = ({ recipeId }) => {
  const [isFavorite, setIsFavorite] = useState(false); // Estado que indica si la receta está en favoritos
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const { currentUser } = useContext(AuthContext); // Acceder al usuario actual del contexto

  // Comprobar si la receta está en favoritos al cargar el componente
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (!navigator.onLine) {
        // Si está offline, carga desde el localStorage
        const isInFavorites = storedFavorites.includes(recipeId);
        setIsFavorite(isInFavorites);
        return;
      }

      if (!currentUser) return; // Si no hay usuario, no hacer la solicitud
      const token = localStorage.getItem("token");
      if (!token) return; // Si no hay token, no hacer la solicitud

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data.recipes)) {
          const isInFavorites = response.data.recipes.some(
            (favorite) => favorite._id && favorite._id.toString() === recipeId.toString()
          );
          setIsFavorite(isInFavorites);

          // Actualiza el localStorage para modo offline
          const updatedFavorites = isInFavorites
            ? [...new Set([...storedFavorites, recipeId])]
            : storedFavorites.filter((id) => id !== recipeId);

          localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        } else {
          console.error("La respuesta no contiene un arreglo de recetas válidas.");
        }
      } catch (error) {
        console.error("Error al verificar los favoritos:", error);
      }
    };

    checkFavoriteStatus();
  }, [recipeId, currentUser]);

  // Manejar la acción de agregar o eliminar de favoritos
  const handleFavorite = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const token = localStorage.getItem("token");

    if (!token || !currentUser) {
      console.error("No estás autenticado.");
      setIsLoading(false);
      return;
    }

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/favorites/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsFavorite(false);

        // Actualiza localStorage para modo offline
        const updatedFavorites = storedFavorites.filter((id) => id !== recipeId);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        // Agregar a favoritos
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          { recipeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsFavorite(true);

        // Actualiza localStorage para modo offline
        const updatedFavorites = [...new Set([...storedFavorites, recipeId])];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
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
