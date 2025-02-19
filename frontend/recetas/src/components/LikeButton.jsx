import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const LikeButton = React.memo(({ likes = [], onLike, currentUserId, recipeId }) => {
  const [userHasLiked, setUserHasLiked] = useState(likes.includes(currentUserId));
  const [totalLikes, setTotalLikes] = useState(likes.length);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Detectar cambios en la conexión
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
      const cachedLikes = JSON.parse(localStorage.getItem(`likes-${recipeId}`)) || {};
      if (cachedLikes && cachedLikes.userId === currentUserId) {
        setUserHasLiked(cachedLikes.userHasLiked);
        setTotalLikes(cachedLikes.totalLikes);
      }
    } else {
      // Guardar en localStorage cuando esté online
      const likesData = {
        userId: currentUserId,
        userHasLiked,
        totalLikes,
      };
      localStorage.setItem(`likes-${recipeId}`, JSON.stringify(likesData));
    }
  }, [isOffline, userHasLiked, totalLikes, currentUserId, recipeId]);

  // 🔹 Nueva función para manejar el like correctamente
  const handleLike = async () => {
    if (!currentUserId) {
      console.warn("Usuario no autenticado, no puede dar like.");
      return;
    }
    try {
      const response = await onLike(recipeId);
      if (response && response.likes) {
        setUserHasLiked(response.likes.includes(currentUserId || ""));
        setTotalLikes(response.likes.length);
      }
    } catch (error) {
      console.error("Error al dar/quitar like:", error);
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
});

LikeButton.displayName = "LikeButton";

LikeButton.propTypes = {
  likes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onLike: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  recipeId: PropTypes.string.isRequired,
};

export default LikeButton;
