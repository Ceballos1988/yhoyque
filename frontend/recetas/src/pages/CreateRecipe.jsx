import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import CustomButton from "../components/CustomButton";
import "../styles/pages/style.createRecipe.css";
import "animate.css";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "react-modal";

const CreateRecipe = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Importante para obtener la ruta actual
  const { user } = useAuth();

  const [recipe, setRecipe] = useState({
    title: "",
    prepTime: "",
    servings: "",
    difficulty: "",
    courseType: "",
    dietType: [], // Ahora es un array para múltiples selecciones
    ingredients: [{ name: "", quantity: "", unit: "" }],
    steps: [""],
  });

  const [imageFile, setImageFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageDeleted, setIsImageDeleted] = useState(false); // Nueva bandera para manejar la eliminación de la imagen
  const [isImageUploading, setIsImageUploading] = useState(false); // Estado para la carga de imagen
  const [isPageLoading, setIsPageLoading] = useState(true); // Nuevo estado para la carga de la página

  useEffect(() => {
    const fetchRecipe = async () => {
      if (recipeId) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data && res.data.recipe) {
            setRecipe({
              ...res.data.recipe,
              image: res.data.recipe.image || "/img/recipe-null.png", // Asignar imagen por defecto
              dietType: Array.isArray(res.data.recipe.dietType)
                ? res.data.recipe.dietType
                : [res.data.recipe.dietType],
            });
          } else {
            console.warn("La receta no se encontró en la respuesta.");
          }
        } catch (error) {
          console.error("Error al cargar la receta:", error);
          setErrorMessage("Error al cargar la receta. Inténtalo nuevamente.");
        } finally {
          setIsPageLoading(false); // Utiliza isPageLoading en lugar de isLoading
        }
      } else {
        setIsPageLoading(false); // Utiliza isPageLoading para indicar que la carga de la página ha terminado
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // Agregar un nuevo ingrediente
  const addIngredient = () => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: [
        ...prevRecipe.ingredients,
        { name: "", quantity: "", unit: "" },
      ],
    }));
  };

  // Eliminar un ingrediente
  const removeIngredient = (index) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: prevRecipe.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Manejar cambios en los ingredientes
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index][field] = value;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: updatedIngredients,
    }));
  };

  // Agregar un nuevo paso
  const addStep = () => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      steps: [...prevRecipe.steps, ""],
    }));
  };

  // Eliminar un paso
  const removeStep = (index) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      steps: prevRecipe.steps.filter((_, i) => i !== index),
    }));
  };

  // Asegurar que cada paso esté bien formateado
  const handleStepChange = (index, value) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = value;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      steps: updatedSteps,
    }));
  };

  // Manejar cambios en otros campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  // Manejar la subida de imagen
  const handleImageChange = (e) => {
    setIsImageUploading(true);
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setIsImageDeleted(false);
    } else {
      setErrorMessage("No se pudo cargar la imagen. Inténtalo nuevamente.");
    }

    // Simular una carga de imagen con un pequeño retraso
    setTimeout(() => {
      setIsImageUploading(false);
    }, 1000); // Puede ajustar el tiempo de acuerdo a sus necesidades
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setIsImageDeleted(true); // Marcar la imagen como eliminada
    setRecipe((prev) => ({
      ...prev,
      image: "/img/recipe-null.png", // Actualizar la imagen a la predeterminada en el estado local
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(""); // Limpiar mensajes anteriores
    setErrorMessage("");

    const formData = new FormData();

    // Agregar campos principales al formData
    formData.append("title", recipe.title);
    formData.append("prepTime", recipe.prepTime || "");
    formData.append("servings", recipe.servings || "");
    formData.append("difficulty", recipe.difficulty);
    formData.append("courseType", recipe.courseType);

    // Manejar dietType como un array
    if (recipe.dietType.length > 0) {
      recipe.dietType.forEach((diet, index) => {
        formData.append(`dietType[${index}]`, diet);
      });
    } else {
      formData.append("dietType[0]", "None");
    }

    // Manejar ingredientes
    recipe.ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}][name]`, ingredient.name);
      formData.append(`ingredients[${index}][quantity]`, ingredient.quantity);
      formData.append(`ingredients[${index}][unit]`, ingredient.unit);
    });

    // Manejar pasos
    recipe.steps.forEach((step, index) => {
      formData.append(`steps[${index}]`, step);
    });

    // Manejar la imagen (si se carga o si se elimina)
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (isImageDeleted) {
      formData.append("image", "/img/recipe-null.png");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No estás autenticado. Inicia sesión para continuar.");
        setIsLoading(false);
        return;
      }

      let response;

      if (recipeId) {
        // Modo edición
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}`,
          formData,

          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage("Receta actualizada con éxito.");
      } else {
        // Modo creación
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/recipes/create`,
          formData,

          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Usar el ID internamente si es necesario
        if (response.data && response.data._id) {
          const recipeId = response.data._id; // El ID de la receta, solo para uso interno
          if (import.meta.env.MODE === "development") {
            console.log("ID de la receta creada:", recipeId); // Para depuración (opcional, puedes eliminarlo)
          }
        }
        // Mostrar mensaje de éxito al usuario sin el ID
        setSuccessMessage("Receta creada con éxito.");
      }

      setIsLoading(false);

      // Mostrar mensaje de éxito antes de redirigir
      setTimeout(() => {
        navigate("/recipe-wall");
      }, 2000);
    } catch (error) {
      console.error("Error al procesar la receta:", error);
      setErrorMessage("Error al procesar la receta. Inténtalo nuevamente.");
      setIsLoading(false);
    }
  };

  // Previsualización de la receta
  const handlePreview = () => {
    setShowPreview(true); // Abre el modal directamente sin cargar
  };

  const closePreview = () => setShowPreview(false);

  return (
    <div className="create-recipe-container min-h-screen flex flex-col items-center text-white pb-20 pt-10">
      <div className="breadcrumb-container-wall absolute top-10 left-20 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Volver"
        >
          <img src="/img/volver.png" alt="Volver" className="arrow-icon" />
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

      {user ? (
        <>
          {recipe && (
            <div className="intro-message  mb-10 animate__animated animate__fadeIn pl-3 pr-3 ">
              <h1 className="create-recipe-title text-center font-bold  mb-6">
                {recipeId ? "Editar receta" : "Crear receta"}
              </h1>
              <p className="text-white leading-relaxed font-poppins text-center">
                {recipeId ? (
                  <>
                    ¡Dale una vuelta más a tu receta y dejala impecable! Acá
                    podés actualizar los ingredientes, pasos y hasta subir una
                    foto nueva para que todos en la comunidad vean cómo te
                    quedó.
                    <br /> <br />
                    <span className="text-naranja-bg block">
                      ¡Metéle onda y que se luzca como corresponde!
                    </span>
                  </>
                ) : (
                  <>
                    ¡Animate a compartir tus mejores recetas! Subí los
                    ingredientes, explicá paso a paso cómo prepararla y agregá
                    una linda foto para inspirar a otros cocineros.
                    <br /> <br />
                    <span className="text-naranja-bg block">
                      ¡Tu plato puede ser el próximo favorito de la comunidad!
                    </span>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="relative w-full max-w-4xl">
            {isPageLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10 rounded-lg">
                <LoadingSpinner />
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`create-recipe-form glass-effect p-4 rounded-lg shadow-lg font-raleway ${
                isPageLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Título */}
              <label
                htmlFor="title"
                className="create-recipe-label font-semibold mt-3 mb-3"
              >
                Título de la receta
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={recipe.title || ""}
                onChange={handleChange}
                required
                className="create-recipe-input"
                placeholder="Ej: Ensalada Rusa"
              />

              {/* Tiempo y Porciones */}
              <div className="flex gap-4 ">
                <div className="w-1/2 ">
                  <label
                    htmlFor="prepTime"
                    className="create-recipe-label font-semibold "
                  >
                    Tiempo de preparación (min) (opcional)
                  </label>
                  <input
                    id="prepTime"
                    type="number"
                    name="prepTime"
                    value={recipe.prepTime || ""}
                    onChange={handleChange}
                    className="create-recipe-input mt-3 mb-3"
                    placeholder="Ej: 30"
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="servings"
                    className="create-recipe-label font-semibold mt-3 mb-3"
                  >
                    Porciones <br /> (opcional)
                  </label>
                  <input
                    id="servings"
                    type="number"
                    name="servings"
                    value={recipe.servings || ""}
                    onChange={handleChange}
                    className="create-recipe-input mt-3 mb-3"
                    placeholder="Número de porciones"
                  />
                </div>
              </div>

              {/* Dificultad y Categoría */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="difficulty"
                    className="create-recipe-label font-semibold"
                  >
                    Dificultad
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={recipe.difficulty || ""}
                    onChange={handleChange}
                    required
                    className="create-recipe-select mt-3 mb-3"
                  >
                    <option value="">Selecciona la dificultad</option>
                    <option value="Easy">Fácil</option>
                    <option value="Medium">Media</option>
                    <option value="Hard">Difícil</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="courseType"
                    className="create-recipe-label font-semibold"
                  >
                    Categoría
                  </label>
                  <select
                    id="courseType"
                    name="courseType"
                    value={recipe.courseType || ""}
                    onChange={handleChange}
                    required
                    className="create-recipe-select mt-3 mb-3"
                  >
                    <option value="">Selecciona la categoría</option>
                    <option value="Appetizer">Entrada</option>
                    <option value="Main Course">Plato principal</option>
                    <option value="Dessert">Postre</option>
                    <option value="Side Dish">Guarnición</option>
                    <option value="Pastry">Pastelería</option>
                  </select>
                </div>
              </div>

              {/* Tipo de dieta */}
              <label className="create-recipe-label font-semibold mt-3 mb-3">
                Tipo de dieta
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {[
                  "Vegetarian",
                  "Vegan",
                  "Gluten-Free",
                  "Dairy-Free",
                  "Keto",
                  "Paleo",
                ].map((diet) => (
                  <label key={diet} className="custom-checkbox">
                    <input
                      type="checkbox"
                      value={diet}
                      checked={recipe.dietType.includes(diet)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setRecipe((prevRecipe) => ({
                          ...prevRecipe,
                          dietType: checked
                            ? [...prevRecipe.dietType, value]
                            : prevRecipe.dietType.filter(
                                (type) => type !== value
                              ),
                        }));
                      }}
                    />
                    {diet}
                  </label>
                ))}
              </div>

              {/* Ingredientes */}
              <label className="create-recipe-label font-semibold mt-3 mb-3">
                Ingredientes
              </label>
              <div className="ingredients-scroll-container">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5/5">
                      <label
                        htmlFor={`ingredient-name-${index}`}
                        className="block text-sm text-gray-300 mb-1"
                      >
                        Nombre
                      </label>
                      <input
                        id={`ingredient-name-${index}`}
                        type="text"
                        placeholder="Ej: Papa"
                        value={ingredient.name || ""}
                        onChange={(e) =>
                          handleIngredientChange(index, "name", e.target.value)
                        }
                        required
                        className="create-recipe-input"
                      />
                    </div>
                    <div className="w-1/5">
                      <label
                        htmlFor={`ingredient-quantity-${index}`}
                        className="block text-sm text-gray-300 mb-1"
                      >
                        Cantidad
                      </label>
                      <input
                        id={`ingredient-quantity-${index}`}
                        type="number"
                        step="0.01"
                        placeholder="Ej: 2"
                        value={ingredient.quantity || ""}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="create-recipe-input"
                      />
                    </div>
                    <div className="w-1.1/5">
                      <label
                        htmlFor={`ingredient-unit-${index}`}
                        className="block text-sm text-gray-300 mb-1"
                      >
                        Unidad
                      </label>
                      <select
                        id={`ingredient-unit-${index}`}
                        value={ingredient.unit || ""}
                        onChange={(e) =>
                          handleIngredientChange(index, "unit", e.target.value)
                        }
                        className="create-recipe-select"
                      >
                        <option value="">Seleccionar</option>
                        <option value="g">Gramos</option>
                        <option value="kg">Kilogramos</option>
                        <option value="ml">Mililitros</option>
                        <option value="l">Litros</option>
                        <option value="cucharadita">Cucharadita</option>
                        <option value="cucharada">Cucharada</option>
                        <option value="taza">Taza</option>
                        <option value="pieza">Pieza</option>
                        <option value="unidad">Unidad</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      title="Eliminar ingrediente"
                      className="ico-delete flex items-center justify-center p-2 transition duration-300"
                    >
                      <img
                        src="/img/delete.png"
                        alt="Eliminar"
                        className="hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addIngredient}
                  title="Añadir ingrediente"
                  className="flex items-center justify-center bg-naranja-bg text-white font-bold px-4 py-2 rounded-md hover:bg-azul-bg hover:text-white transition duration-300"
                >
                  + Añadir
                </button>
              </div>

              {/* Pasos */}
              <label
                htmlFor="steps"
                className="create-recipe-label font-semibold mt-3 mb-3"
              >
                Pasos
              </label>
              <div className="steps-scroll-container">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 ">
                    {/* Textarea para el paso */}
                    <div className="w-full">
                      <label
                        htmlFor={`step-${index}`}
                        className="block text-sm text-gray-300 mb-2"
                      >
                        Paso {index + 1}
                      </label>
                      <textarea
                        id={`step-${index}`}
                        value={step || ""}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
                        placeholder={`Paso ${index + 1}`}
                        className="create-recipe-textarea w-full"
                        required
                      ></textarea>
                    </div>

                    {/* Botón Eliminar Paso */}
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      title="Eliminar paso"
                      className="ico-delete-1 flex items-center justify-center p-2 transition duration-300"
                    >
                      <img
                        src="/img/delete.png"
                        alt="Eliminar"
                        className="hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón Añadir Paso */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addStep}
                  title="Añadir paso"
                  className="flex items-center justify-center bg-naranja-bg text-white font-bold px-4 py-2 rounded-md hover:bg-azul-bg hover:text-white transition duration-300"
                >
                  + Añadir
                </button>
              </div>

              {/* Imagen */}
              <div className="flex flex-col gap-2 mt-4 ">
                {/* Label principal para la imagen */}
                <label
                  htmlFor="image"
                  className="create-recipe-label font-semibold mb-2"
                >
                  Imagen de receta <br /> (opcional)
                </label>
                <div className="span-real">
                  {/* Aviso de tamaño de imagen máximo permitido */}
                  <span className="text-left text-red-500 ">
                    *La imagen debe pesar menos de 10MB.
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Vista previa de imagen */}
                  <div className="image-indicator flex relative">
                    {imageFile ? (
                      <>
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Imagen cargada"
                          className="preview-thumbnail"
                        />
                        <p>Imagen cargada: {imageFile.name}</p>
                        <button
                          type="button"
                          onClick={() => setImageFile(null)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : recipe.image ? (
                      <>
                        <img
                          src={recipe.image}
                          alt="Imagen existente"
                          className="preview-thumbnail"
                        />
                        <p className="text-sm mt-2 text-center">
                          Imagen existente
                        </p>

                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <img
                          src="/img/recipe-null.png"
                          alt="Imagen por defecto"
                          className="preview-thumbnail"
                        />
                        <div className="span-real mt-5">
                          <span className="mt-2 text-left ">
                            No has cargado ninguna imagen.
                          </span>
                        </div>
                      </>
                    )}

                    <div className="mt-5">
                      <label
                        htmlFor="image"
                        className="flex justify-center items-center  text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-[#EE8532] hover:bg-[#0f172b]"
                      >
                        <input
                          id="image"
                          type="file"
                          name="image"
                          onChange={handleImageChange}
                          disabled={isImageUploading} // Deshabilitar durante la carga
                          className="hidden" // Ocultar el input original
                        />
                        {isImageUploading ? <LoadingSpinner /> : "Subir imagen"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Previsualización y Crear Receta */}
              <div className="mt-6 flex justify-around">
                <button
                  type="button"
                  className="text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-[#EE8532] hover:bg-[#0f172b] text-white"
                  onClick={handlePreview}
                >
                  Previsualizar
                </button>

                <button
                  type="submit"
                  className={`text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-[#EE8532] hover:bg-[#0f172b] ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  } text-white`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : recipeId ? (
                    "Actualizar receta"
                  ) : (
                    "Crear receta"
                  )}
                </button>

                {/* Botón de Cancelar */}
                {recipeId && (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              {successMessage && (
                <div
                  className="success-message-profile text-green-500 font-semibold text-center"
                  role="alert"
                >
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div
                  className="error-message-profile  text-red-500 font-semibold text-center"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
          {/* Modal de Previsualización */}
          <Modal
            isOpen={showPreview}
            onRequestClose={closePreview}
            contentLabel="Previsualización de la Receta"
            className="user-modal-list glass-effect modal-content-createm"
            overlayClassName="user-modal-overlay-list"
          >
            <button
              className="close-btn absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-500 transition-all duration-300"
              onClick={closePreview}
              aria-label="Cerrar Previsualización"
            >
              ✕
            </button>

            <h2 className="modal-session text-naranja-bg font-bold mb-4 mt-6">
              {recipe.title || "Previsualización de la Receta"}
            </h2>

            {/* Imagen de la receta */}
            <div className="preview-image-container mb-6">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : recipe.image || "/img/recipe-null.png"
                }
                alt="Previsualización de la receta"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>

            {/* Detalles de la receta */}
            <div className="dates-recipe-create text-left mb-4">
              <p className="mb-2">
                <strong>Tiempo de preparación:</strong>{" "}
                {recipe.prepTime
                  ? `${recipe.prepTime} minutos`
                  : "No especificado"}
              </p>
              <p className="mb-2">
                <strong>Porciones:</strong>{" "}
                {recipe.servings ? recipe.servings : "No especificado"}
              </p>
              <p className="mb-2">
                <strong>Dificultad:</strong>{" "}
                {recipe.difficulty === "Easy"
                  ? "Fácil"
                  : recipe.difficulty === "Medium"
                  ? "Media"
                  : recipe.difficulty === "Hard"
                  ? "Difícil"
                  : "No especificado"}
              </p>
              <p className="mb-2">
                <strong>Categoría:</strong>{" "}
                {recipe.courseType === "Appetizer"
                  ? "Entrada"
                  : recipe.courseType === "Main Course"
                  ? "Plato principal"
                  : recipe.courseType === "Dessert"
                  ? "Postre"
                  : recipe.courseType === "Side Dish"
                  ? "Guarnición"
                  : recipe.courseType === "Pastry"
                  ? "Pastelería"
                  : "No especificado"}
              </p>

              {recipe.dietType.length > 0 && (
                <p className="mb-2">
                  <strong>Tipo de dieta:</strong>{" "}
                  {recipe.dietType
                    .map((diet) => {
                      switch (diet) {
                        case "Vegetarian":
                          return "Vegetariana";
                        case "Vegan":
                          return "Vegana";
                        case "Gluten-Free":
                          return "Sin Gluten";
                        case "Dairy-Free":
                          return "Sin Lácteos";
                        case "Keto":
                          return "Keto";
                        case "Paleo":
                          return "Paleo";
                        default:
                          return "No especificado";
                      }
                    })
                    .join(", ")}
                </p>
              )}
            </div>

            {/* Ingredientes */}
            <h4 className="modal-session font-bold text-lg mb-2 text-left">
              Ingredientes:
            </h4>
            <ul className="ingredients-list text-left mb-6">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="mb-1">
                  {ingredient.quantity}{" "}
                  {ingredient.unit || ingredient.customUnit} de{" "}
                  {ingredient.name}
                </li>
              ))}
            </ul>

            {/* Pasos */}
            <h4 className="modal-session font-bold text-lg mb-2 text-left">
              Pasos:
            </h4>
            <ol className="steps-list text-left list-decimal pl-5">
              {recipe.steps.map((step, index) => (
                <li key={index} className="mb-2">
                  {step}
                </li>
              ))}
            </ol>

            {/* Botón Cerrar */}
            <div className="flex justify-left mt-6">
              <button
                onClick={closePreview}
                className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
              >
                Cerrar
              </button>
            </div>
          </Modal>
        </>
      ) : (
        <div className="login-prompt text-center">
          <h2 className=" font-bold mb-6 mt-10">
            Inicia sesión o regístrate para crear o editar tus recetas
          </h2>
          <CustomButton
            onClick={() => navigate("/login")}
            bgColor="bg-naranja-bg"
            textColor="text-azul-bg"
            text="Iniciar Sesión"
          />
          <CustomButton
            onClick={() => navigate("/register")}
            bgColor="bg-naranja-bg"
            textColor="text-white"
            text="Registrarse"
          />
        </div>
      )}
    </div>
  );
};

export default CreateRecipe;
