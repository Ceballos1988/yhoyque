import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Componente LikeButton que permite a los usuarios dar o quitar "like" a una receta.
 */
const LikeButton = React.memo(
  ({ likes = [], onLike, currentUserId, recipeId }) => {
    const [userHasLiked, setUserHasLiked] = useState(
      likes.includes(currentUserId)
    );
    const [totalLikes, setTotalLikes] = useState(likes.length);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Detectar si el usuario está online o offline
    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);

    // Sincronizar el estado de likes cuando cambie la conexión
    useEffect(() => {
      if (isOffline) {
        const cachedLikes =
          JSON.parse(localStorage.getItem(`likes-${recipeId}`)) || {};
        if (cachedLikes && cachedLikes.userId === currentUserId) {
          setUserHasLiked(cachedLikes.userHasLiked);
          setTotalLikes(cachedLikes.totalLikes);
        }
      } else {
        // Guardar los likes en localStorage cuando esté online
        const likesData = {
          userId: currentUserId,
          userHasLiked,
          totalLikes,
        };
        localStorage.setItem(`likes-${recipeId}`, JSON.stringify(likesData));
      }
    }, [isOffline, userHasLiked, totalLikes, currentUserId, recipeId]);

    const handleLike = async () => {
      if (isOffline) {
        // Eliminar esta línea porque no se usa directamente en la lógica:
        // const cachedLikes = JSON.parse(localStorage.getItem(`likes-${recipeId}`)) || {};

        if (userHasLiked) {
          // Si el usuario ya dio like, quitar el like en modo offline
          setUserHasLiked(false);
          setTotalLikes((prevLikes) => Math.max(0, prevLikes - 1));
        } else {
          // Dar like en modo offline
          setUserHasLiked(true);
          setTotalLikes((prevLikes) => prevLikes + 1);
        }

        // Actualizar localStorage con el nuevo estado
        const updatedLikes = {
          userId: currentUserId,
          userHasLiked: !userHasLiked,
          totalLikes: userHasLiked ? totalLikes - 1 : totalLikes + 1,
        };
        localStorage.setItem(`likes-${recipeId}`, JSON.stringify(updatedLikes));
      } else {
        // Manejo online
        try {
          const response = await onLike();
          if (response && response.likes) {
            setUserHasLiked(response.likes.includes(currentUserId));
            setTotalLikes(response.likes.length);

            // Guardar el estado actualizado en localStorage
            const updatedLikes = {
              userId: currentUserId,
              userHasLiked: response.likes.includes(currentUserId),
              totalLikes: response.likes.length,
            };
            localStorage.setItem(
              `likes-${recipeId}`,
              JSON.stringify(updatedLikes)
            );
          }
        } catch (error) {
          console.error("Error al dar/quitar like:", error);
        }
      }
    };

    return (
      <span
        onClick={handleLike}
        className={`cursor-pointer flex items-center ${
          userHasLiked ? "text-red-500" : "text-white"
        }`}
        role="button"
        aria-label={userHasLiked ? "Quitar like" : "Dar like"}
      >
        {userHasLiked ? (
          <img
            src={`${window.location.origin}/img/heart-filled.svg`}
            className="w-5 h-5 mr-1"
            alt="Icono de corazón lleno"
          />
        ) : (
          <img
            src={`${window.location.origin}/img/heart-outline.svg`}
            className="w-5 h-5 mr-1"
            alt="Icono de corazón vacío"
          />
        )}
        <span>{totalLikes} Likes</span>
      </span>
    );
  }
);

LikeButton.displayName = "LikeButton";

LikeButton.propTypes = {
  likes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onLike: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  recipeId: PropTypes.string.isRequired, // Necesario para almacenar el estado de likes en localStorage
};

export default LikeButton;
