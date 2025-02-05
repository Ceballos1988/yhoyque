import { useState, useEffect } from "react";
import "../styles/components/style.cardRecipe.css";
import LikeButton from "./LikeButton";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../hooks/useAuth"; // Hook para autenticación
import PropTypes from "prop-types";
import axios from "axios";
import Comments from "./Comments"; // Componente para los comentarios
import "animate.css";
import { useNavigate } from "react-router-dom";
import UserProfileModal from "./UserProfileModal"; // Importar el nuevo componente
import MissingIngredientsModal from "./MissingIngredientsModal"; // Importar el modal de ingredientes faltantes
import ReportButton from "./ReportButton";

const CardRecipe = ({ recipe, onDelete, userIngredients }) => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || "guest"; // Cambia `._id` por `.id` si esa es la estructura del objeto

  const [isLoaded] = useState(false); // Estado para la clase 'loaded'
  const [likes, setLikes] = useState(recipe.likes || []);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controlar la visibilidad del modal
  const [showComments, setShowComments] = useState({}); // Estado para mostrar comentarios por receta
  const [comments, setComments] = useState({}); // Comentarios por receta
  const [commentsCount, setCommentsCount] = useState(0); // Inicializamos commentsCount en 0
  const [message, setMessage] = useState(""); // Mensaje para mostrar errores de autenticación
  const [userName, setUserName] = useState(recipe.userName); // Estado para el nombre de usuario de la receta
  const [isFavorited, setIsFavorited] = useState(false); // Estado para manejar el "favorito"
  const navigate = useNavigate(); // Hook para la navegación
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Estado para manejar la tarjeta expandida
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Estado para el modal de ingredientes faltantes
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para alternar la expansión de la tarjeta
  const toggleExpansion = (recipeId) => {
    setExpandedCardId((prevId) => (prevId === recipeId ? null : recipeId));
  };

  // Función para calcular ingredientes faltantes
  const calculateMissingIngredients = () => {
    const lowerCaseUserIngredients = userIngredients.map((ingredient) =>
      ingredient.toLowerCase().trim()
    );

    const missing = recipe.ingredients.filter((ingredient) => {
      const ingredientNameLowerCase = ingredient.name.toLowerCase();
      return !lowerCaseUserIngredients.some((userIngredient) =>
        ingredientNameLowerCase.includes(userIngredient)
      );
    });

    setMissingIngredients(missing); // Aquí enviamos los objetos completos
    setIsModalOpen(true);
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (import.meta.env.MODE === "development") {
        console.log("Token encontrado:", token);
      }

      if (!token) {
        console.warn("No hay token, se configurará como 'guest'.");
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const isInFavorites = response.data.recipes.some((favorite) => {
          return favorite._id.toString() === recipe._id.toString();
        });

        setIsFavorited(isInFavorites);
        localStorage.setItem(`favorite-${recipe._id}`, isInFavorites);
      } catch (error) {
        console.error("Error al verificar los favoritos:", error);
      }
    };

    const storedFavoriteStatus = localStorage.getItem(`favorite-${recipe._id}`);
    if (storedFavoriteStatus !== null) {
      setIsFavorited(JSON.parse(storedFavoriteStatus));
    } else {
      checkFavoriteStatus();
    }
  }, [recipe._id]);

  useEffect(() => {
    const updateUserName = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/${recipe.userId}`
        );
        setUserName(res.data.username);
      } catch (error) {
        console.error("Error al obtener el nombre de usuario:", error);
      }
    };

    updateUserName();
  }, [recipe.userId]);

  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/comments/recipe/${recipe._id}`
        );
        setCommentsCount(res.data.comments.length);
      } catch (error) {
        console.error("Error al cargar el conteo de comentarios:", error);
      }
    };

    fetchCommentsCount();
  }, [recipe._id]);

  const fetchComments = async (recipeId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/comments/recipe/${recipeId}`
      );

      setComments((prevComments) => ({
        ...prevComments,
        [recipeId]: res.data.comments || [],
      }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage("No se encontraron comentarios para esta receta.");
      } else {
        setMessage("Error al cargar los comentarios.");
      }
      console.error("Error al cargar comentarios:", error);
    }
  };

  const handleEditRecipe = () => {
    navigate(`/create-recipe/${recipe._id}`);
  };

  const handleDeleteComment = (commentId, recipeId) => {
    setComments((prevComments) => {
      const recipeComments = Array.isArray(prevComments[recipeId])
        ? prevComments[recipeId]
        : [];

      return {
        ...prevComments,
        [recipeId]: recipeComments.filter(
          (comment) => comment._id !== commentId
        ),
      };
    });
    setCommentsCount((prevCount) => Math.max(0, prevCount - 1));
  };

  const handleLikeRecipe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(
        "No estás autenticado. Inicia sesión para dar like a la receta."
      );
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/recipes/like/${recipe._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLikes(res.data.likes);
    } catch (error) {
      console.error("Error al dar/quitar like:", error);
    }
  };

  const handleFavoriteRecipe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(
        "No estás autenticado. Inicia sesión para marcar como favorito."
      );
      return;
    }

    try {
      let response;
      if (isFavorited) {
        response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/favorites/${recipe._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsFavorited(false);
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          { recipeId: recipe._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsFavorited(true);
      }
      if (import.meta.env.MODE === "development") {
        console.log(response.data.message);
      }
      localStorage.setItem(`favorite-${recipe._id}`, isFavorited);
    } catch (error) {
      console.error("Error al manejar favorito:", error);
    }
  };

  const handleDeleteRecipe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(
        "No estás autenticado. Inicia sesión para eliminar la receta."
      );
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/recipes/${recipe._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowDeleteModal(false);
      onDelete(recipe._id);
    } catch (error) {
      console.error("Error al eliminar receta:", error);
    }
  };

  let recipeSteps = recipe.steps;
  if (typeof recipe.steps === "string") {
    try {
      recipeSteps = JSON.parse(recipe.steps);
    } catch (e) {
      console.error("Error al parsear los pasos:", e);
    }
  }

  const handleUserClick = async () => {
    try {
      if (import.meta.env.MODE === "development") {
        console.log("Fetching user details for:", recipe.userId);
      }
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/${recipe.userId}`
      );

      setUserDetails(res.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error al obtener los detalles del usuario:", error);
    }
  };

  const handleCommentsClick = (recipeId) => {
    setShowComments((prev) => ({
      ...prev,
      [recipeId]: !prev[recipeId],
    }));

    if (!showComments[recipeId]) {
      fetchComments(recipeId);
    }
  };

  console.log("Receta ID Usuario (verificando existencia):", recipe.userId || "No definido");
  console.log("Usuario Actual ID:", currentUserId);
  console.log("Comparación:", String(recipe.userId) === String(currentUserId));

  return (
    <div
      className={`mb-10 recipe-card relative ${isLoaded ? "loaded" : ""} ${
        expandedCardId === recipe._id ? "expanded" : ""
      }`}
    >
      <div className="title-container">
        <h2 className="text-2xl text-center">{recipe.title}</h2>
        <span
          className="mb-5  text-white font-semibold p-2  flex items-center"
          onClick={handleUserClick}
          title="Ver perfil"
        >
          <img src="/img/user-icon.png" alt="User" className="w-9 mr-1" />
          {userName || "Anónimo"}
        </span>
      </div>

      <div className="relative">
        <img
          src={recipe.image || "/img/recipe-null.png"}
          alt={recipe.title || "Receta"}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <span className="absolute top-1 left-2 bg-white text-black font-semibold p-1 rounded-lg shadow-md no-hover-effect">
          {recipe.createdAt
            ? new Date(recipe.createdAt).toLocaleDateString()
            : "Fecha no disponible"}
        </span>
      </div>

      {/* Renderiza el modal usando el componente modular */}
      <UserProfileModal
        isOpen={showUserModal}
        onRequestClose={() => setShowUserModal(false)}
        userDetails={userDetails}
      />

      {userIngredients.length > 0 && (
        <div className="relative text-center mb-3">
          {/* Botón para abrir el modal */}
          <button
            onClick={calculateMissingIngredients}
            className="bg-naranja-bg text-white p-2 rounded mt-4 font-poppins hover:bg-azul-bg"
          >
            Ver ingredientes faltantes
          </button>

          {/* Modal posicionado dentro de la tarjeta */}
          {isModalOpen && (
            <div className="modal-container">
              <MissingIngredientsModal
                ingredients={missingIngredients}
                onClose={() => setIsModalOpen(false)}
                onAddToList={(selected) => {
                  if (import.meta.env.MODE === "development") {
                    console.log("Ingredientes añadidos a la lista:", selected);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="text-left justify-start">
        <p className="text-white flex items-center">
          <img
            src="/img/clock-icon.png"
            alt="Prep Time"
            className="w-4 h-4 mr-1"
          />{" "}
          Tiempo:{" "}
          {recipe.prepTime ? `${recipe.prepTime} minutos` : "No especificado"}
        </p>
        <p className="text-white flex items-center">
          <img
            src="/img/fire-icon.png"
            alt="Difficulty"
            className="w-4 h-4 mr-1"
          />{" "}
          Dificultad:
          {recipe.difficulty === "Easy" && "🔥"}
          {recipe.difficulty === "Medium" && "🔥🔥"}
          {recipe.difficulty === "Hard" && "🔥🔥🔥"}
        </p>
        <p className="text-white flex items-center">
          <img
            src="/img/servings-icon.svg"
            alt="Servings"
            className="w-4 h-4 mr-1"
          />{" "}
          Porciones: {recipe.servings || "No especificado"}
        </p>
      </div>

      <div className="list-ingredientes">
        <p className="font-semibold mt-4 text-left">Ingredientes:</p>
        <div
          className={`ingredients-container ${
            expandedCardId === recipe._id
              ? "expanded-ingredients"
              : "line-clamp-4"
          }`}
        >
          <ul className="list-disc ml-4">
            {recipe.ingredients?.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.quantity} {ingredient.unit} de {ingredient.name}
                </li>
              ))
            ) : (
              <li>No hay ingredientes disponibles.</li>
            )}
          </ul>
        </div>

        {recipe.ingredients?.length > 4 && (
          <button
            onClick={() => toggleExpansion(recipe._id)}
            className="bg-transparent text-orange-500 mt-2 flex items-center"
          >
            {expandedCardId === recipe._id ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <div className="list-pasos">
        <p className="font-semibold mt-4 text-left">Pasos:</p>
        <div
          className={`steps-container ${
            expandedCardId === recipe._id ? "expanded-steps" : "line-clamp-4"
          }`}
        >
          <ol className="list-decimal ml-4">
            {recipeSteps.length > 0 ? (
              recipeSteps.map((step, index) => <li key={index}>{step}</li>)
            ) : (
              <li>No hay pasos disponibles.</li>
            )}
          </ol>
        </div>

        {recipeSteps.length > 4 && (
          <button
            onClick={() => toggleExpansion(recipe._id)}
            className="bg-transparent text-orange-500 mt-2 flex items-center"
          >
            {expandedCardId === recipe._id ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <div className="footer-card flex items-center justify-between interaction-row">
        <div className="flex items-center mb-2">
          <LikeButton
            recipeId={recipe._id}
            likes={likes}
            onLike={handleLikeRecipe}
            currentUserId={currentUserId}
          />
        </div>
        <div className="flex items-center">
          <FavoriteButton
            recipeId={recipe._id}
            onFavorite={handleFavoriteRecipe}
            currentUserId={currentUserId}
            isFavorited={isFavorited}
          />
        </div>
        <div className="flex items-center">
          <span
            onClick={() => handleCommentsClick(recipe._id)}
            className="cursor-pointer text-blue-500 items-center"
          >
            💬 Ver comentarios ({commentsCount})
          </span>
          <ReportButton recipeId={recipe._id} />
        </div>
      </div>

      {showComments[recipe._id] && (
        <div className="comments-container mt-4">
          <Comments
            comments={comments[recipe._id] || []} // Evita errores si no hay comentarios aún
            recipeId={recipe._id}
            currentUserId={currentUserId}
            onAddComment={(newComment) => {
              setComments((prevComments) => ({
                ...prevComments,
                [recipe._id]: [...(prevComments[recipe._id] || []), newComment],
              }));
              setCommentsCount((prevCount) => prevCount + 1);
            }}
            onDeleteComment={(commentId) =>
              handleDeleteComment(commentId, recipe._id)
            }
          />
        </div>
      )}

      {String(recipe.userId) === String(currentUser?.id) && (
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center"
            title="Eliminar receta"
          >
            <img
              src="/img/delete-icon.png"
              alt="delete"
              className="w-5 h-5 mr-2"
            />{" "}
            Eliminar Receta
          </button>
          <button
            onClick={handleEditRecipe}
            className="flex items-center"
            title="Editar receta"
          >
            <img src="/img/edit-icon.png" alt="edit" className="w-5 h-5 mr-2" />{" "}
            Editar Receta
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="user-modal-overlay-list-delete">
          <div className="user-modal-list glass-effect">
            <h2 className="modal-session font-bold mb-4 text-naranja-bg">
              ¿Estás seguro?
            </h2>
            <p className="modal-session mb-6 text-white">
              ¿Realmente deseas eliminar esta receta?
            </p>
            <p className="modal-session mb-6 mt-6 text-white">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRecipe}
                className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-red-500 text-white p-2 mt-4 rounded">{message}</div>
      )}
    </div>
  );
};

CardRecipe.propTypes = {
  recipe: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    servings: PropTypes.number,
    prepTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Acepta string o número
    difficulty: PropTypes.string.isRequired,
    courseType: PropTypes.string.isRequired,
    dietType: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    steps: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string,
    likes: PropTypes.arrayOf(PropTypes.string),
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number,
        unit: PropTypes.string,
      })
    ),
    createdAt: PropTypes.string.isRequired,
    userName: PropTypes.string,
    userId: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  userIngredients: PropTypes.arrayOf(PropTypes.string).isRequired, // Nueva prop
};

export default CardRecipe;
