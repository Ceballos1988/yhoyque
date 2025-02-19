import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import axios from "axios";
import CardRecipe from "../components/CardRecipe";
import "../styles/pages/style.recipeWall.css";
import { useAuth } from "../hooks/useAuth";
import CustomButton from "../components/CustomButton";
import FilterPanel from "../components/FilterPanel";
import SearchBar from "../components/SearchBar";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterContext } from "../context/FilterContext"; // Importa el contexto
import LoadingSpinner from "../components/LoadingSpinner"; // Importa el spinner
import { searchRecipeById } from "../services/api"; // Ajusta la ruta según tu estructura

/**
 * Componente RecipeWall que muestra una lista de recetas filtradas y permite la búsqueda de recetas.
 * Utiliza paginación para mostrar una cantidad limitada de recetas por página.
 * @component
 * @returns {JSX.Element} Componente de la página del Muro de Recetas.
 */
const RecipeWall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]); // Nuevo estado para favoritos
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Detectar si está offline

  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 8;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchIngredients, setSearchIngredients] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { filters, updateFilters } = useContext(FilterContext);
  // Añade esta línea para definir si hay filtros activos
  const filtersActive = Object.values(filters).some((value) => value);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const totalPages =
    totalRecipes > 0 ? Math.ceil(totalRecipes / recipesPerPage) : 1;

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Para mensajes de error
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga

  /**
   * Maneja los cambios en el término de búsqueda por título de receta.
   * @param {string} term - Término de búsqueda.
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setSearchIngredients([]);
    setErrorMessage(""); // Limpia el mensaje de error
    setCurrentPage(1);
    setSearchTriggered((prev) => !prev);
  };

  /**
   * Maneja la búsqueda de recetas por ingredientes.
   * @param {Array} ingredients - Lista de ingredientes.
   */
  const handleIngredientSearch = (ingredients) => {
    setSearchIngredients(ingredients);
    setSearchTerm("");
    setErrorMessage(""); // Limpia el mensaje de error
    setCurrentPage(1);
    setSearchTriggered((prev) => !prev);
  };

  /**
   * Limpia la búsqueda por nombre e ingredientes, pero mantiene los filtros aplicados.
   */
  const clearSearch = () => {
    setSearchTerm("");
    setSearchIngredients([]);
    setErrorMessage(""); // Limpia el mensaje de error
    setCurrentPage(1);
    setSearchTriggered((prev) => !prev);
  };

  /**
   * Limpia todos los filtros aplicados sin modificar las búsquedas realizadas.
   */
  const handleClearFilters = () => {
    updateFilters({
      category: "",
      difficulty: "",
      prepTime: "",
      dietType: "",
      rating: "",
      sortOption: "",
      userRecipesOnly: false,
      savedRecipesOnly: false,
    });
    setCurrentPage(1);
    setSearchTriggered((prev) => !prev);
  };

  /**
   * Alterna la expansión del sidebar.
   */
  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  // Construcción de los parámetros de búsqueda y filtros
  const buildParams = useMemo(() => {
    const params = {
      filters: {
        category: filters.category || null,
        difficulty: filters.difficulty || null,
        prepTime: filters.prepTime ? JSON.stringify(filters.prepTime) : null,
        dietType: filters.dietType || null,
        rating: filters.rating || null,
        sortOption: filters.sortOption || null,
        userRecipesOnly: filters.userRecipesOnly || false,
        savedRecipesOnly: filters.savedRecipesOnly || false,
      },
      searchIngredients:
        searchIngredients.length > 0 ? searchIngredients : null, // Añadir ingredientes al filtro
      searchTerm: searchTerm || null, // Añadir búsqueda por nombre si existe
    };

    // Remover filtros vacíos o que sean false
    Object.keys(params.filters).forEach((key) => {
      if (!params.filters[key]) delete params.filters[key];
    });

    return params;
  }, [filters, searchIngredients, searchTerm]);

  /**
   * Carga todas las recetas según los filtros y parámetros de búsqueda aplicados.
   */
  const loadAllRecipes = useCallback(async () => {
    setIsLoading(true); // Activar el spinner
    const token = localStorage.getItem("token");

    try {
      let endpoint = `${import.meta.env.VITE_API_URL}/api/recipes`;
      let method = "get";
      let requestData = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...buildParams.filters,
          page: currentPage,
          limit: recipesPerPage,
          sortOption: filters.sortOption || null,
        },
      };

      if (filters.savedRecipesOnly && user) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/favorites`;
      } else if (filters.userRecipesOnly && user) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/recipes/user/${
          user.id
        }`;
      } else if (searchIngredients.length > 0) {
        endpoint = `${
          import.meta.env.VITE_API_URL
        }/api/recipes/searchByIngredients`;
        method = "post";
        requestData = {
          ...requestData,
          data: {
            ingredients: searchIngredients,
            filters: buildParams.filters,
          },
        };
      } else if (searchTerm) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/recipes/search`;
        requestData.params = { ...requestData.params, name: searchTerm };
      }

      const res = await axios({ method, url: endpoint, ...requestData });

      setRecipes(res.data.recipes || res.data);
      setTotalRecipes(
        Number.isInteger(res.data.totalCount) ? res.data.totalCount : 0
      );

      // Guardar en localStorage para el acceso offline
      localStorage.setItem(
        "recetasVistas",
        JSON.stringify(res.data.recipes || res.data)
      );

      if (filters.savedRecipesOnly && res.data.favorites) {
        setFavorites(res.data.favorites);
      }
    } catch (error) {
      console.error("Error al cargar las recetas:", error);

      // En caso de error, intenta cargar las recetas desde localStorage
      const recetasOffline =
        JSON.parse(localStorage.getItem("recetasVistas")) || [];
      if (recetasOffline.length > 0) {
        setRecipes(recetasOffline);
      } else {
        setRecipes([]); // Si no hay nada guardado, muestra vacío
      }
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  }, [
    searchTerm,
    searchIngredients,
    buildParams,
    currentPage,
    filters.userRecipesOnly,
    filters.savedRecipesOnly,
    filters.sortOption,
    user,
  ]);

  useEffect(() => {
    loadAllRecipes();
  }, [loadAllRecipes, currentPage, searchTriggered]);

  // Detectar cambios en la conexión
  // Detectar cambios en la conexión y cargar recetas desde el caché si está offline
  useEffect(() => {
    const handleConnectionChange = () => {
      setIsOffline(!navigator.onLine);
      if (!navigator.onLine) {
        const recetasOffline =
          JSON.parse(localStorage.getItem("recetasVistas")) || [];
        setRecipes(recetasOffline);
      } else {
        loadAllRecipes(); // Vuelve a cargar desde la API si hay conexión
      }
    };

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  }, [loadAllRecipes]);

  // Cargar recetas favoritas desde localStorage si está offline
  useEffect(() => {
    if (isOffline) {
      const recetasOffline =
        JSON.parse(localStorage.getItem("recetasVistas")) || [];
      setRecipes(recetasOffline);
    } else {
      loadAllRecipes(); // Carga desde la API si hay conexión
    }
  }, [isOffline, loadAllRecipes]);

  useEffect(() => {
    if (recipes.length > 0 && !isOffline) {
      localStorage.setItem("recetasVistas", JSON.stringify(recipes));
    }
  }, [recipes, isOffline]);

  useEffect(() => {
    if (isOffline) {
      const recetasOffline =
        JSON.parse(localStorage.getItem("recetasVistas")) || [];
      setRecipes(recetasOffline);
    }
  }, [isOffline]);

  /**
   * Función para manejar la lógica de paginación.
   */
  const getPaginationArray = () => {
    const pagesToShow = 3;
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const paginationArray = getPaginationArray();

  // Paginación
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleIdSearch = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Obtener el token del usuario
      const recipe = await searchRecipeById(id, token); // Llamar al servicio
      setRecipes([recipe]); // Mostrar solo la receta encontrada
      setTotalRecipes(1); // Ajustar la paginación
      console.log("Receta encontrada:", recipe);
    } catch (error) {
      console.error("Error al buscar receta por ID:", error);
      setRecipes([]);
      setTotalRecipes(0);
      setErrorMessage("No se encontró una receta con ese ID.");
    }
  };
  const handleLikeToggle = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/recipes/like/${recipeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId
            ? { ...recipe, likes: response.data.likes } // 🔹 ACTUALIZA los likes en tiempo real
            : recipe
        )
      );
    } catch (error) {
      console.error("Error al manejar el like:", error);
    }
  };
  
  
  return (
    <div
      className="recipe-wall-container min-h-screen flex text-azul-bg pb-20 pt-10 relative"
      role="main"
    >
      {/* Sidebar con expansión (oculto si está offline) */}
      {!isOffline && (
        <div
          className={`rounded-md shadow-md sidebar-container ${
            isSidebarExpanded ? "" : "collapsed"
          }`}
        >
          <button
            className="expand-sidebar-button absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center"
            onClick={toggleSidebar}
          >
            <img
              src={
                isSidebarExpanded
                  ? "https://res.cloudinary.com/dnlyti3zm/image/upload/v1739477335/cerrar_ngfyef.png"
                  : "/img/abrir.png"
              }
              alt={isSidebarExpanded ? "Cerrar Sidebar" : "Abrir Sidebar"}
              className="w-8 h-8 mr-3"
              title={isSidebarExpanded ? "Cerrar" : "Abrir"}
            />
          </button>

          {isSidebarExpanded && (
            <div className="flex flex-col">
              {/* Sección de búsqueda */}
              <div className="search-bar-section mb-6 ml-5">
                <SearchBar
                  searchTerm={searchTerm}
                  ingredientTerm={searchIngredients.join(", ")}
                  onSearch={handleSearchChange}
                  onIngredientSearch={handleIngredientSearch}
                  onIdSearch={handleIdSearch}
                  onClearSearch={clearSearch}
                  isAdmin={user?.role === "admin"}
                  placeholder="Buscar por título o @usuario..."
                  ingredientPlaceholder="Buscar por ingredientes..."
                  idPlaceholder="Buscar por ID de receta..."
                />

                {errorMessage && (
                  <p className="error-message text-red-500 text-center mt-2">
                    {errorMessage}
                  </p>
                )}
                {/* Aviso de búsqueda activa */}
                {(searchTerm || searchIngredients.length > 0) && (
                  <div className="filters-active-message text-raleway text-naranja-bg mt-2 text-center">
                    Búsqueda aplicada:{" "}
                    {searchTerm.startsWith("@")
                      ? "Usuario"
                      : searchTerm
                      ? "Título"
                      : searchIngredients.length > 0
                      ? "Ingredientes"
                      : ""}
                    <button
                      onClick={clearSearch}
                      className="text-white underline ml-2"
                      aria-label="Limpiar búsqueda"
                    >
                      Limpiar Búsqueda
                    </button>
                  </div>
                )}
              </div>

              {/* Sección de filtros */}
              <div className="filter-section mb-10">
                <FilterPanel onClearFilters={handleClearFilters} />
                {filtersActive && (
                  <div className="filters-active-message text-raleway text-naranja-bg mt-2 text-center">
                    Filtros y/u Ordenamiento aplicados:
                    <button
                      onClick={handleClearFilters}
                      className="text-white underline ml-2"
                      aria-label="Limpiar Filtros"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div
        className={`recipe-wall-content transition-all duration-300 ease-in-out`}
      >
        <div className="breadcrumb-container-wall absolute top-10 left-20 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Volver"
          >
            <img
              src="https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png"
              alt="Volver"
              className="arrow-icon"
            />
          </button>
          <nav className="breadcrumb-wall" aria-label="breadcrumb">
            <span
              className={`mx-2 cursor-pointer ${
                location.pathname === "/recipe-wall"
                  ? "text-naranja-bg font-bold"
                  : ""
              }`}
              onClick={() => navigate("/recipe-wall")}
            >
              Muro Recetas
            </span>
            <span className="separator">/</span>
            <span
              className={`mx-2 cursor-pointer ${
                location.pathname === "/create-recipe"
                  ? "text-naranja-bg font-bold"
                  : ""
              }`}
              onClick={() => navigate("/create-recipe")}
            >
              Crear Receta
            </span>
            <span className="separator">/</span>
            <span
              className={`mx-2 cursor-pointer ${
                location.pathname === "/shopping-lists"
                  ? "text-naranja-bg font-bold"
                  : ""
              }`}
              onClick={() => navigate("/shopping-lists")}
            >
              Lista de Compras
            </span>
            <span className="separator">/</span>
            <span
              className={`mx-2 cursor-pointer ${
                location.pathname === "/profile"
                  ? "text-naranja-bg font-bold"
                  : ""
              }`}
              onClick={() => navigate("/profile")}
            >
              Mi Perfil
            </span>
          </nav>
        </div>

        {user && (
          <div className="welcome-message-wall text-center animate__animated animate__fadeIn">
            <h1 className="font-bold mb-10 mt-10 text-center text-white">
              ¡Bienvenidos a la <br /> Comunidad de Recetas!
            </h1>
            <h2 className="mb-5 text-center text-naranja-bg font-poppins">
              Aquí en nuestra comunidad, compartimos nuestras mejores recetas.{" "}
              <br />
              ¡Explora y prueba las creaciones culinarias de otros miembros!
            </h2>
          </div>
        )}

        <div>
          {user ? (
            <div>
              <div className="search-instruction">
                <p className="font-raleway text-white mb-10 mt-10">
                  Acá podés buscar recetas por <strong>título</strong> o por una{" "}
                  <strong>lista de ingredientes</strong> (separados por comas).
                  Cuantas más coincidencias haya con los ingredientes que tenés
                  en casa, más arriba aparecerán las recetas. Además, podés
                  filtrar para ver tus <strong>recetas guardadas</strong> o las{" "}
                  <strong>recetas que creaste vos</strong>, y también podés ver
                  recetas de otros usuarios que te gusten. Recordá que también
                  podés <strong>editar o eliminar</strong> las recetas que hayas
                  creado. Las recetas te indicarán cuáles son los ingredientes
                  que te faltan para poder armar fácilmente tu lista de compras.
                </p>
              </div>

              <p className="mt-10 mb-10 text-white text-center font-josefin">
                Resultados:
              </p>
              {/* Mostrar mensaje si está sin conexión */}
              {isOffline && (
                <div className="offline-message text-center text-white p-4 rounded-md mb-4">
                  <div className="bg-red-500 text-white p-4 rounded mb-4">
                    <h2 className="text-2xl font-bold">
                      Recetas disponibles sin conexión
                    </h2>
                    <p className="mt-2">
                    Estás viendo solo las recetas recientes. Cuando te conectes a internet, podrás acceder a todas nuevamente.
                    </p>
                  </div>
                </div>
              )}
              {isLoading ? (
                <LoadingSpinner />
              ) : recipes.length > 0 ? (
                <div className="recipes-flex animate__animated animate__fadeIn">
                  {recipes.map((recipe) => (
                   <CardRecipe
                   key={recipe._id}
                   recipe={recipe}
                   currentUserId={user?._id || null}
                   userIngredients={searchIngredients}
                   onDelete={(recipeId) =>
                     setRecipes((prev) => prev.filter((r) => r._id !== recipeId))
                   }
                   isFavorite={favorites.some((fav) => fav.recipeId === recipe._id)}
                   toggleFavorite={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      let updatedFavorites = [];
                  
                      if (favorites.some((fav) => fav.recipeId === recipe._id)) {
                        const response = await axios.delete(
                          `${import.meta.env.VITE_API_URL}/api/favorites/${recipe._id}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        updatedFavorites = response.data.favorites;
                      } else {
                        const response = await axios.post(
                          `${import.meta.env.VITE_API_URL}/api/favorites`,
                          { recipeId: recipe._id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        updatedFavorites = response.data.favorites;
                      }
                  
                      // 🔹 ACTUALIZA EL ESTADO GLOBAL SIN RECARGAR LA PÁGINA
                      setFavorites(updatedFavorites);
                    } catch (error) {
                      console.error("Error al manejar favorito:", error);
                    }
                  }}
                   onLikeToggle={handleLikeToggle}  // 🔹 Pasa la función de like
                 />
                 
                  ))}
                </div>
              ) : isOffline ? (
                <p
                  className="no-recipes-message-wall text-center text-white"
                  role="alert"
                >
                  No tenés recetas guardadas para ver sin conexión. Cuando
                  vuelvas a tener internet, guardá tus recetas favoritas para
                  poder acceder a ellas sin conexión.
                </p>
              ) : (
                <p
                  className="no-recipes-message-wall text-center text-white"
                  role="alert"
                >
                  No hay recetas disponibles en este momento.
                </p>
              )}

              <div
                className="pagination flex justify-center mt-10"
                role="navigation"
                aria-label="Paginación"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                {paginationArray.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`mx-2 px-4 py-2 rounded ${
                      page === currentPage
                        ? "active"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > paginationArray[paginationArray.length - 1] && (
                  <span className="mx-2">...</span>
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : (
            <div className="login-prompt" role="alert">
              <h2 className="font-bold mb-6 mt-10">
                Inicia sesión o regístrate para ver las recetas de la comunidad
              </h2>
              <CustomButton
                onClick={() => navigate("/login")}
                bgColor="bg-naranja-bg"
                textColor="text-azul-bg"
                text="Iniciar Sesión"
                aria-label="Iniciar sesión"
              />
              <CustomButton
                onClick={() => navigate("/register")}
                bgColor="bg-naranja-bg"
                textColor="text-white"
                text="Registrarse"
                aria-label="Registrarse"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeWall;
