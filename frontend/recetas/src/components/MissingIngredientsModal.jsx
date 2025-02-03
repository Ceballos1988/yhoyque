import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/components/style.MissingIngredientsModal.css";

const MissingIngredientsModal = ({ ingredients, onClose, onAddToList }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newListName, setNewListName] = useState(""); // Estado para el nombre de la nueva lista

  // Fetch existing shopping lists
  useEffect(() => {
    const fetchShoppingLists = async () => {
      setIsLoadingLists(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shopping-lists`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setShoppingLists(response.data);
      } catch (error) {
        console.error("Error fetching shopping lists:", error);
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchShoppingLists();
  }, []);

  // Fetch categories for the selected list
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedListId) return;

      setIsLoadingCategories(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/missing-ingredients/${selectedListId}/categories`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedListId]);

  // Handle adding ingredients to a list and category
  const handleAddToList = async () => {
    if (!selectedListId) {
      alert("Por favor, selecciona una lista.");
      return;
    }

    if (selectedIngredients.length === 0) {
      alert("Selecciona al menos un ingrediente.");
      return;
    }

    try {
      let categoryId = selectedCategoryId;

      // Crear una nueva categoría si se seleccionó "new"
      if (selectedCategoryId === "new" && newCategoryName.trim()) {
        const categoryResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/missing-ingredients/${selectedListId}/categories`,
          { title: newCategoryName },
        
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        categoryId = categoryResponse.data._id; // Obtener el ID de la nueva categoría creada
        setCategories((prev) => [...prev, categoryResponse.data]); // Actualizar las categorías disponibles
        setNewCategoryName(""); // Limpiar el campo de nombre de categoría
      }

      // Validar que el `categoryId` se haya establecido correctamente
      if (!categoryId) {
        alert("Por favor, selecciona una categoría o crea una nueva.");
        return;
      }

      // Agregar ingredientes a la lista y categoría seleccionada
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/missing-ingredients/${selectedListId}/categories/${categoryId}/items`,
        {
      
          ingredients: selectedIngredients.map((ingredient) => ({
            name: ingredient.name,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccessMessage("¡Ingredientes añadidos correctamente!");

      // Limpiar el estado después de la acción
      setTimeout(() => setSuccessMessage(""), 3000);
      setSelectedIngredients([]);
      setSelectedCategoryId("");
      onAddToList(selectedIngredients); // Ejecutar callback para actualizar el estado principal
    } catch (error) {
      console.error("Error adding ingredients to the list:", error);
      alert(
        "Hubo un problema al añadir los ingredientes. Inténtalo nuevamente."
      );
    }
  };

  const handleCreateCategory = async () => {
    if (!selectedListId) {
      setSuccessMessage("Por favor, selecciona una lista primero.");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (!newCategoryName.trim()) {
      setSuccessMessage("El nombre de la categoría no puede estar vacío.");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const categoryResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/missing-ingredients/${selectedListId}/categories`,
        { title: newCategoryName },
      
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newCategory = categoryResponse.data;
      setCategories((prev) => [...prev, newCategory]); // Añadir la nueva categoría a la lista de categorías
      setSelectedCategoryId(newCategory._id); // Seleccionar automáticamente la nueva categoría
      setNewCategoryName(""); // Limpiar el campo de entrada
      setSuccessMessage("Categoría creada con éxito.");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    } catch (error) {
      console.error("Error al crear nueva categoría:", error);
      setSuccessMessage("No se pudo crear la categoría. Inténtalo nuevamente.");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  // Función para crear una nueva lista
  const handleCreateNewList = async () => {
    if (!newListName.trim()) {
      setSuccessMessage("El nombre de la lista no puede estar vacío.");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shopping-lists`,
      
        { name: newListName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newList = response.data;
      setShoppingLists((prevLists) => [...prevLists, newList]);
      setSelectedListId(newList._id); // Selecciona automáticamente la nueva lista creada
      setNewListName(""); // Limpia el campo del input

      setSuccessMessage("¡Lista creada con éxito!");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar mensaje después de 3 segundos
    } catch (error) {
      console.error("Error al crear la lista de compras:", error);
      setSuccessMessage("No se pudo crear la lista. Inténtalo nuevamente.");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar mensaje después de 3 segundos
    }
  };

  // JSX para crear una nueva lista
  {
    !isLoadingLists && shoppingLists.length === 0 && (
      <div>
        <input
          type="text"
          placeholder="Nombre de la nueva lista"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button onClick={handleCreateNewList} className="btn-primary">
          Crear Lista
        </button>
      </div>
    );
  }

  // Handle checkbox changes
  const handleCheckboxChange = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.find((item) => item.name === ingredient.name)
        ? prev.filter((item) => item.name !== ingredient.name)
        : [...prev, ingredient]
    );
  };

  return (
    <div className="modal-overlay-ingredients">
      <div className="modal-content-ingredients glass-effect">
        <h3>Ingredientes faltantes</h3>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <ul>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient) => (
              <li key={ingredient.name}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedIngredients.some(
                      (item) => item.name === ingredient.name
                    )}
                    onChange={() => handleCheckboxChange(ingredient)}
                  />
                  {ingredient.name}
                </label>
              </li>
            ))
          ) : (
            <p>No hay ingredientes faltantes.</p>
          )}
        </ul>

        {/* Shopping Lists Dropdown */}
        {/* Mostrar input para crear una nueva lista si no hay listas disponibles */}
        {isLoadingLists ? (
          <p>Cargando listas de compras...</p>
        ) : shoppingLists.length > 0 ? (
          <select
            value={selectedListId}
            onChange={(e) => {
              setSelectedListId(e.target.value);
              setSelectedCategoryId(""); // Reset category selection
            }}
          >
            <option value="">Selecciona una lista</option>
            {shoppingLists.map((list) => (
              <option key={list._id} value={list._id}>
                {list.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-5">
            <p className="text-bold mb-5">
              No tienes listas de compras disponibles. Créala:
            </p>
            <input
              type="text"
              placeholder="Nombre de la nueva lista"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <button onClick={handleCreateNewList} className="btn-primary">
              Crear Lista
            </button>
          </div>
        )}

        {/* Categories Dropdown */}
        {selectedListId && (
          <>
            {isLoadingCategories ? (
              <p>Cargando categorías...</p>
            ) : categories.length > 0 ? (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
                <option value="new">+ Crear nueva categoría</option>
              </select>
            ) : (
              <div>
                <p className="text-bold ">
                  No hay categorías disponibles. Créala:
                </p>
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button onClick={handleCreateCategory} className="btn-primary">
                  Crear Categoría
                </button>
              </div>
            )}
          </>
        )}

        {/* Input for New Category Name */}
        {selectedCategoryId === "new" && (
          <input
            type="text"
            placeholder="Nombre de la nueva categoría"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        )}

        <div className="modal-actions">
          <button
            onClick={handleAddToList}
            className="btn-primary font-poppins"
            disabled={
              !selectedListId ||
              (!selectedCategoryId && !newCategoryName.trim()) ||
              selectedIngredients.length === 0
            }
          >
            Añadir
          </button>
          <button onClick={onClose} className="btn-secondary font-poppins">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

MissingIngredientsModal.propTypes = {
  ingredients: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToList: PropTypes.func.isRequired,
};

export default MissingIngredientsModal;
