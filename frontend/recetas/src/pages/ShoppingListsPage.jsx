import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/pages/style.shoppingListsPage.css";
import ShoppingList from "../components/ShoppingList";
import CustomButton from "../components/CustomButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import BrandCarousel from "../components/BrandCarousel";
import MissingIngredientsModal from "../components/MissingIngredientsModal";

const ShoppingListsPage = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [missingIngredients] = useState([]); // Ingredientes faltantes
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener listas de compras
  const fetchShoppingLists = async () => {
    try {
      setIsLoadingLists(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShoppingLists(response.data);

      // Guardar siempre en LocalStorage después de recibir la respuesta
      localStorage.setItem(
        "listasComprasGuardadas",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Error al cargar listas de compras:", error);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    const cargarListas = () => {
      if (navigator.onLine) {
        fetchShoppingLists(); // Si hay conexión, carga desde la API
      } else {
        const listasOffline =
          JSON.parse(localStorage.getItem("listasComprasGuardadas")) || [];
        setShoppingLists(listasOffline); // Carga desde el localStorage si no hay conexión
      }
    };

    cargarListas(); // Ejecutar la función cuando el componente se monte

    // Escuchar cambios en la conexión para actualizar las listas automáticamente
    window.addEventListener("online", cargarListas);
    window.addEventListener("offline", cargarListas);

    return () => {
      window.removeEventListener("online", fetchShoppingLists);
      window.removeEventListener("offline", cargarListas);
    };
  }, []);

  useEffect(() => {
    if (shoppingLists.length > 0) {
      localStorage.setItem("listasComprasGuardadas", JSON.stringify(shoppingLists));
    } else {
      localStorage.removeItem("listasComprasGuardadas");  // Limpia si no hay listas
    }
  }, [shoppingLists]);
  

  // Crear nueva lista
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setErrorMessage("El nombre de la lista no puede estar vacío.");
      return;
    }

    if (shoppingLists.length >= 3) {
      setErrorMessage("Solo puedes crear un máximo de 3 listas.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists`,

        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShoppingLists([...shoppingLists, response.data]);
      localStorage.setItem(
        "listasComprasGuardadas",
        JSON.stringify([...shoppingLists, response.data])
      ); // Guardar inmediatamente

      setNewListName("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error al crear una nueva lista:", error);
    }
  };

  // Eliminar lista
  const handleDeleteList = async (listId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists/${listId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShoppingLists(shoppingLists.filter((list) => list._id !== listId));
    } catch (error) {
      console.error("Error al eliminar la lista:", error);
    }
  };

  // Agregar categoría
  const handleAddCategory = async (listId, title) => {
    if (!title.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/shopping-lists/${listId}/categories`,

        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, categories: response.data } : list
        )
      );
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }
  };

  // Editar categoría
  const handleEditCategory = async (listId, categoryId, newTitle) => {
    if (!newTitle.trim()) return; // Validar que el nombre no esté vacío.

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/shopping-lists/${listId}/categories/${categoryId}`,
        { title: newTitle.trim() },

        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                categories: list.categories.map((category) =>
                  category._id === categoryId
                    ? { ...category, title: response.data.title }
                    : category
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error("Error al editar categoría:", error);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (listId, categoryId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/shopping-lists/${listId}/categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                categories: list.categories.filter(
                  (category) => category._id !== categoryId
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  // Agregar ítem a una categoría
  const handleAddItem = async (categoryId, listId, itemData) => {
    if (!itemData || !itemData.name?.trim()) {
      alert("El nombre del ítem no puede estar vacío.");
      return;
    }

    if (!categoryId) {
      alert("Primero debes crear una categoría para agregar ítems.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${
        import.meta.env.VITE_API_URL
      }/api/shopping-lists/${listId}/categories/${categoryId}/items`;

      const response = await axios.post(url, itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                categories: list.categories.map((cat) =>
                  cat._id === categoryId
                    ? { ...cat, items: response.data }
                    : cat
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error("Error al agregar ítem:", error);
      alert("Error al agregar el ítem.");
    }
  };

  // Eliminar ítem
  const handleDeleteItem = async (itemId, categoryId, listId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/shopping-lists/${listId}/categories/${categoryId}/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                categories: list.categories.map((cat) =>
                  cat._id === categoryId
                    ? {
                        ...cat,
                        items: cat.items.filter((item) => item._id !== itemId),
                      }
                    : cat
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error("Error al eliminar ítem:", error);
    }
  };

  // Alternar estado de comprado
  const handleTogglePurchased = async (itemId, categoryId, listId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/shopping-lists/${listId}/categories/${categoryId}/items/${itemId}`,
        {},

        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado de las listas
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                categories: list.categories.map((cat) =>
                  cat._id === categoryId
                    ? {
                        ...cat,
                        items: cat.items.map((item) =>
                          item._id === itemId ? response.data : item
                        ),
                      }
                    : cat
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error(
        "Error al alternar estado de comprado:",
        error.response?.data
      );
      alert("Error al alternar el estado de comprado.");
    }
  };

  // Manejar edición de nombre de lista
  const handleEditName = async (listId, newName) => {
    if (!newName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists/${listId}`,

        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar las listas con el nuevo nombre
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, name: response.data.name } : list
        )
      );
    } catch (error) {
      console.error("Error al editar el nombre de la lista:", error);
      alert("Error al actualizar el nombre de la lista.");
    }
  };

  // Agregar ingredientes faltantes a una lista de compras
  const handleAddMissingIngredientsToList = async (selectedIngredients) => {
    if (!selectedIngredients.length) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists/${
          shoppingLists[0]._id
        }/ingredients`,
        { ingredients: selectedIngredients },

        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === shoppingLists[0]._id
            ? { ...list, categories: response.data.categories }
            : list
        )
      );
      console.log("Ingredientes añadidos con éxito.");
      setIsModalOpen(false); // Cierra el modal tras la acción
    } catch (error) {
      console.error("Error al agregar ingredientes a la lista:", error);
    }
  };

  return (
    <div className="shopping-lists-page min-h-screen flex text-azul-bg pb-20 pt-10 relative ">
      <div className="shopping-lists-content">
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

        {user && (
          <div className="welcome-message-wall animate__animated animate__fadeIn">
            <div className=" text-center">
              <h1 className="font-bold mb-10 mt-10 text-center text-white">
                ¡Bienvenido a tu gestor de listas de compras!
              </h1>
            </div>
            <div className="text-left">
              <p className="mb-5 text-left font-poppins">
                Organizá tus compras de forma simple y rápida con nuestra
                herramienta. Podés crear hasta 3 listas de compras
                personalizadas, agregar categorías para ordenar mejor tus cosas,
                sumar ítems con cantidades y unidades específicas, y marcar lo
                que ya compraste para llevar un control más fácil. Además, podés
                editar los nombres de tus listas y categorías, y eliminar lo que
                no necesitás en un toque: listas, categorías o productos.
              </p>

              <h2 className="mb-10 mt-10 text-center text-naranja-bg font-poppins">
                ¡Todo pensado para que tus compras sean más ágiles y
                organizadas!
              </h2>
            </div>
          </div>
        )}

        <div className="new-list-container mb-10 text-center animate__animated animate__fadeIn">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateList(); // Llama a la función si presiona Enter
              }
            }}
            placeholder="Nombre de la nueva lista"
            className="new-list-input"
          />

          <CustomButton
            text="Crear lista"
            bgColor="bg-naranja-bg"
            textColor="text-white"
            onClick={handleCreateList}
          />
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>

        <div className="shopping-lists-grid ">
          {isLoadingLists ? (
            <LoadingSpinner />
          ) : shoppingLists.length > 0 ? (
            shoppingLists.map((list) => (
              <ShoppingList
                key={list._id}
                list={list}
                onAddCategory={(listId, title) =>
                  handleAddCategory(listId, title)
                }
                onEditCategory={(categoryId, newTitle) =>
                  handleEditCategory(list._id, categoryId, newTitle)
                }
                onDeleteCategory={(categoryId) =>
                  handleDeleteCategory(list._id, categoryId)
                }
                onAddItem={(categoryId, itemData) =>
                  handleAddItem(categoryId, list._id, itemData)
                }
                onDeleteItem={(itemId, categoryId) =>
                  handleDeleteItem(itemId, categoryId, list._id)
                }
                onTogglePurchased={(itemId, categoryId) =>
                  handleTogglePurchased(itemId, categoryId, list._id)
                }
                onDelete={() => handleDeleteList(list._id)}
                onEditName={handleEditName} // Aquí se pasa la función como prop
              />
            ))
          ) : (
            <p className="text-center">No tienes listas de compras aún.</p>
          )}
        </div>
        {/* Agregar el componente BrandCarousel */}
        <BrandCarousel />

        {isModalOpen && (
          <MissingIngredientsModal
            ingredients={missingIngredients}
            onAddToList={handleAddMissingIngredientsToList}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingListsPage;
