import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Componente LikeButton que permite a los usuarios dar o quitar "like" a una receta.
 */
const LikeButton = React.memo(({ likes = [], onLike, currentUserId }) => {
  const [userHasLiked, setUserHasLiked] = useState(
    likes.includes(currentUserId)
  );
  const [totalLikes, setTotalLikes] = useState(likes.length);

  useEffect(() => {
 
    setUserHasLiked(likes.includes(currentUserId)); // Actualiza si el usuario ha dado like
    setTotalLikes(likes.length); // Actualiza el total de likes
  }, [likes, currentUserId]);

  const handleLike = async () => {
    try {
      const response = await onLike();
      if (response && response.likes) {
        setUserHasLiked(response.likes.includes(currentUserId)); // Actualiza si el usuario dio like
        setTotalLikes(response.likes.length); // Actualiza el total de likes
        if (import.meta.env.MODE === "development") {
        console.log("userHasLiked actualizado:", response.likes.includes(currentUserId));
      }
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
  currentUserId: PropTypes.string.isRequired, // Asegúrate de pasar un ID válido
};

export default LikeButton;
