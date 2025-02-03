import { useState } from "react";
import axios from "axios";

/**
 * Hook personalizado para gestionar las recetas favoritas del usuario.
 * Proporciona funcionalidades para obtener, agregar y eliminar favoritos.
 *
 * @returns {Object} - Un objeto con el estado de favoritos y las funciones para manejarlos.
 * @property {Array} favorites - Lista de recetas favoritas del usuario.
 * @property {Function} getFavorites - Función para obtener todas las recetas favoritas.
 * @property {Function} addFavorite - Función para agregar una receta a favoritos.
 * @property {Function} removeFavorite - Función para eliminar una receta de favoritos.
 */
const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  /**
   * Obtener todos los favoritos del usuario autenticado.
   * Actualiza el estado de 'favorites' con las recetas favoritas.
   */
  const getFavorites = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/favorites`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setFavorites(response.data.recipes);
      } else {
        console.error("No se pudieron obtener los favoritos correctamente");
      }
    } catch (error) {
      console.error("Error al obtener favoritos", error);
    }
  };

  /**
   * Agregar una receta a la lista de favoritos.
   * @param {string} recipeId - ID de la receta que se va a agregar a favoritos.
   */
  const addFavorite = async (recipeId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/favorites`,
        { recipeId },

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      getFavorites(); // Actualizar favoritos después de agregar
    } catch (error) {
      console.error("Error al agregar a favoritos", error);
    }
  };

  /**
   * Eliminar una receta de la lista de favoritos.
   * @param {string} recipeId - ID de la receta que se va a eliminar de favoritos.
   */
  const removeFavorite = async (recipeId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/favorites/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      getFavorites(); // Actualizar favoritos después de eliminar
    } catch (error) {
      console.error("Error al eliminar de favoritos", error);
    }
  };

  return {
    favorites,
    getFavorites,
    addFavorite,
    removeFavorite,
  };
};

export default useFavorites;
