import PropTypes from "prop-types"; // Importa PropTypes
import "../../styles/admin/adminStatistics.css";

const TopRecipes = ({ topLikes, copyToClipboard, copiedId }) => {
  return (
    <div className="featured-recipes-section">
      <h3 className="section-title text-center">Recetas Más Populares</h3>
      <ul className="featured-list">
        {topLikes.map((recipe) => (
          <li key={recipe._id} className="featured-item">
            <div className="recipe-image-container">
              <img
                src={recipe.image || "/placeholder.png"}
                alt={recipe.title}
                className="recipe-image"
              />
            </div>
            <div className="recipe-info">
              <span className="recipe-title">{recipe.title}</span>
              <div className="recipe-id2">
                <span className="recipe-id">
                  <br /> ID: {recipe._id}{" "}
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(recipe._id)}
                  >
                    📋
                  </button>
                </span>
              </div>
              {copiedId === recipe._id && (
                <span className="copy-success">¡ID copiado!</span>
              )}
            </div>
            {/* Muestra correctamente el número de likes */}
            <span className="recipe-stat">❤️ {recipe.likes || 0} likes</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Añade la validación de props
TopRecipes.propTypes = {
  topLikes: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      image: PropTypes.string,
      title: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired, // Validamos que likes sea un número
    })
  ).isRequired,
  copyToClipboard: PropTypes.func.isRequired,
  copiedId: PropTypes.string,
};

export default TopRecipes;
