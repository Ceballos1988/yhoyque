import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "../styles/components/style.searchBar.css";

const SearchBar = ({
  searchTerm: parentSearchTerm = "", // Recibe el término de búsqueda como prop
  ingredientTerm: parentIngredientTerm = "", // Recibe los ingredientes como prop
  onSearch,
  onIngredientSearch,
  onIdSearch, // Nueva prop para búsqueda por ID
  onClearSearch,
  isAdmin = false, // Nueva prop para verificar si el usuario es administrador
  placeholder = "Buscar por título o @usuario...",
  ingredientPlaceholder = 'Buscar por ingredientes separados por ","',
  idPlaceholder = "Buscar por ID de receta...", // Placeholder para ID
}) => {
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm);
  const [ingredientTerm, setIngredientTerm] = useState(parentIngredientTerm);
  const [idTerm, setIdTerm] = useState(""); // Nuevo estado para ID
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Sincroniza el estado interno del término de búsqueda con el valor de las props
    setSearchTerm(parentSearchTerm);
  }, [parentSearchTerm]);

  useEffect(() => {
    // Sincroniza el estado interno de ingredientes con el valor de las props
    setIngredientTerm(parentIngredientTerm);
  }, [parentIngredientTerm]);

  const handleTitleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setErrorMessage(""); // Limpiar mensaje de error al escribir
  };

  const handleIngredientInputChange = (event) => {
    setIngredientTerm(event.target.value);
    setErrorMessage(""); // Limpiar mensaje de error al escribir
  };

  const handleIdInputChange = (event) => {
    setIdTerm(event.target.value);
    setErrorMessage(""); // Limpiar mensaje de error al escribir
  };

  const handleTitleSearchSubmit = async (event) => {
    event.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm) {
      try {
        if (trimmedTerm.startsWith("@")) {
          // Buscar por username
          await onSearch(trimmedTerm); // La función onSearch debe manejar la solicitud al backend
        } else {
          // Buscar por título
          await onSearch(trimmedTerm);
        }
        setErrorMessage(""); // Limpiar cualquier error previo si la búsqueda es exitosa
      } catch (error) {
        setErrorMessage(
          error.response && error.response.status === 404
            ? "No hay recetas para este nombre de usuario."
            : "Hubo un problema con la búsqueda. Intenta de nuevo."
        );
      }
    } else {
      clearBothSearches();
    }
  };

  const handleIngredientSearchSubmit = async (event) => {
    event.preventDefault();
    const ingredientsArray = ingredientTerm
      .split(",")
      .map((ing) => ing.trim())
      .filter(Boolean);

    if (ingredientsArray.length) {
      try {
        await onIngredientSearch(ingredientsArray);
        setErrorMessage(""); // Limpiar cualquier error previo si la búsqueda es exitosa
      } catch {
        setErrorMessage("Hubo un problema con la búsqueda de ingredientes.");
      }
    } else {
      clearBothSearches();
    }
  };

  const handleIdSearchSubmit = async (event) => {
    event.preventDefault();
    const trimmedId = idTerm.trim();

    if (trimmedId) {
      try {
        await onIdSearch(trimmedId); // Llamar a la función onIdSearch
        setErrorMessage("");
      } catch {
        setErrorMessage(
          "No se encontró una receta con ese ID o hubo un error en la búsqueda."
        );
      }
    } else {
      clearBothSearches();
    }
  };

  const clearBothSearches = () => {
    setSearchTerm("");
    setIngredientTerm("");
    setIdTerm(""); // Limpiar el campo de búsqueda por ID
    onClearSearch();
    setErrorMessage("");
  };

  return (
    <div className="search-bar-background">
      <div className="search-bar-container">
        {/* Icono de filtro solo decorativo */}
        <div className="search-icon flex">
          <img src="https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png" alt="Icono de filtros" />
          <span className="text-naranja-bg">Búsquedas:</span>
        </div>

        <div className="search-inputs-wrapper">
          {/* Búsqueda por título o username */}
          <div className="search-section">
            <fieldset className="border-none mt-2">
              <legend className="text-left mb-2">
                <label
                  htmlFor="titleSearch"
                  className="cursor-pointer text-white"
                >
                  Búsqueda por título o @usuario
                </label>
              </legend>
              <form
                onSubmit={handleTitleSearchSubmit}
                className="search-section-content flex items-center"
              >
                <input
                  type="text"
                  id="titleSearch"
                  className="search-input"
                  value={searchTerm}
                  onChange={handleTitleInputChange}
                  placeholder={placeholder}
                  aria-label="Buscar por título o @usuario"
                />

                <button
                  type="submit"
                  className="icon-button search-button ml-2"
                  title="Buscar"
                  aria-label="Buscar por título o @usuario"
                >
                  <img src="https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png" alt="Icono de búsqueda" />
                </button>
                <button
                  type="button"
                  className="icon-button-delete clear-button ml-2"
                  title="Eliminar"
                  onClick={clearBothSearches}
                  aria-label="Limpiar búsqueda"
                >
                  <img src="/img/delete.png" alt="Icono de limpieza" />
                </button>
              </form>
            </fieldset>
            {errorMessage && (
              <p className="error-message text-red-500 text-sm mt-2">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Búsqueda por ingredientes */}
          <div className="search-section mt-2">
            <fieldset className="border-none">
              <legend className="text-left mb-2">
                <label
                  htmlFor="ingredientSearch"
                  className="cursor-pointer text-white"
                >
                  Búsqueda por ingredientes
                </label>
              </legend>
              <form
                onSubmit={handleIngredientSearchSubmit}
                className="search-section-content flex items-center mt-2"
              >
                <input
                  type="text"
                  id="ingredientSearch"
                  className="search-input"
                  value={ingredientTerm}
                  onChange={handleIngredientInputChange}
                  placeholder={ingredientPlaceholder}
                  aria-label="Buscar por ingredientes"
                />
                <button
                  type="submit"
                  className="icon-button search-button ml-2"
                  aria-label="Buscar por ingredientes"
                  title="Buscar"
                >
                  <img src="https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png" alt="Icono de búsqueda" />
                </button>
                <button
                  type="button"
                  className="icon-button-delete clear-button ml-2"
                  title="Eliminar"
                  onClick={clearBothSearches}
                  aria-label="Limpiar búsqueda de ingredientes"
                >
                  <img src="/img/delete.png" alt="Icono de limpieza" />
                </button>
              </form>
            </fieldset>
          </div>

          {/* Búsqueda por ID (Solo para administradores) */}
          {isAdmin && (
            <div className="search-section mt-2">
              <fieldset className="border-none">
                <legend className="text-left mb-2">
                  <label htmlFor="idSearch" className="cursor-pointer text-white">
                    Búsqueda por ID
                  </label>
                </legend>
                <form
                  onSubmit={handleIdSearchSubmit}
                  className="search-section-content flex items-center mt-2"
                >
                  <input
                    type="text"
                    id="idSearch"
                    className="search-input"
                    value={idTerm}
                    onChange={handleIdInputChange}
                    placeholder={idPlaceholder}
                    aria-label="Buscar por ID"
                  />
                  <button
                    type="submit"
                    className="icon-button search-button ml-2"
                    aria-label="Buscar por ID"
                    title="Buscar por ID"
                  >
                    <img src="https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png" alt="Icono de búsqueda" />
                  </button>
                  <button
                    type="button"
                    className="icon-button-delete clear-button ml-2"
                    title="Eliminar"
                    onClick={clearBothSearches}
                    aria-label="Limpiar búsqueda"
                  >
                    <img src="/img/delete.png" alt="Icono de limpieza" />
                  </button>
                </form>
              </fieldset>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string,
  ingredientTerm: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onIngredientSearch: PropTypes.func.isRequired,
  onIdSearch: PropTypes.func.isRequired, // Validar la nueva prop
  onClearSearch: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool, // Validar si es administrador
  placeholder: PropTypes.string,
  ingredientPlaceholder: PropTypes.string,
  idPlaceholder: PropTypes.string,
};

export default SearchBar;
