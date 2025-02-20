import PropTypes from "prop-types";
import { useState } from "react";
import Modal from "react-modal";
import "../styles/components/style.ShoppingList.css";

const ShoppingList = ({
  list,
  onAddCategory = () => {},
  onEditCategory = () => {},
  onDeleteCategory = () => {},
  onAddItem = () => {},
  onDeleteItem = () => {},
  onTogglePurchased = () => {},
  onDelete = () => {}, // Parámetro predeterminado para eliminar lista
  onEditName = () => {}, // Nueva función para editar el nombre de la lista
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [newListName, setNewListName] = useState(list.name);

  const [editingCategoryId, setEditingCategoryId] = useState(null); // ID de la categoría que se está editando
  const [newCategoryName, setNewCategoryName] = useState(""); // Nuevo nombre de la categoría

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  // Abrir el modal para agregar ítems
  const openModal = (categoryId) => {
    setModalCategoryId(categoryId);
    setIsModalOpen(true);
  };

  // Cerrar el modal para agregar ítems
  const closeModal = () => {
    setItemName("");
    setItemQuantity("");
    setItemUnit("");
    setModalCategoryId(null);
    setIsModalOpen(false);
  };

  // Agregar un ítem a la categoría
  const handleAddItem = () => {
    if (!itemName.trim()) {
      alert("El nombre del ítem es obligatorio.");
      return;
    }

    const newItem = {
      _id: `local-item-${Date.now()}`, // ID temporal para ítem
      name: itemName.trim(),
      quantity: itemQuantity.trim() ? Number(itemQuantity) : null,
      unit: itemUnit.trim() || null,
      isPurchased: false,
    };

    if (!navigator.onLine) {
      onAddItem(modalCategoryId, newItem); // Enviar ítem al padre
      closeModal();
      return;
    }

    // Si hay conexión, usar el comportamiento original
    onAddItem(modalCategoryId, newItem);
    closeModal();
  };

  // Guardar el nombre editado de la lista
  const handleNameEdit = () => {
    if (!newListName.trim()) {
      alert("El nombre de la lista no puede estar vacío.");
      return;
    }
    onEditName(list._id, newListName.trim()); // Llama al callback para guardar el nuevo nombre
    setIsEditingName(false); // Sal del modo edición
  };

  // Guardar el nuevo nombre de la categoría
  const handleEditCategoryName = (categoryId, newName) => {
    if (!newName.trim()) {
      alert("El nombre de la categoría no puede estar vacío.");
      return;
    }
    onEditCategory(categoryId, newName.trim()); // Pasar al callback
    setEditingCategoryId(null);
    setNewCategoryName("");
  };

  // Cancelar la edición de la categoría
  const cancelEditCategory = () => {
    setEditingCategoryId(null); // Salir del modo edición
    setNewCategoryName(""); // Limpiar el nombre temporal
  };

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
    setNewCategoryTitle(""); // Limpiar el campo
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryTitle("");
  };

  const handleAddCategory = () => {
    if (!newCategoryTitle.trim()) {
      alert("El nombre de la categoría no puede estar vacío.");
      return;
    }

    if (!navigator.onLine) {
      // Crear categoría localmente con ID temporal
      const nuevaCategoria = {
        _id: `local-cat-${Date.now()}`, // ID temporal
        title: newCategoryTitle.trim(),
        items: [],
      };

      onAddCategory(list._id, nuevaCategoria); // Enviar al callback del padre para actualizar el estado
      closeCategoryModal();
      return;
    }

    // Si hay conexión, usar el comportamiento original
    onAddCategory(list._id, newCategoryTitle.trim());
    closeCategoryModal();
  };

  return (
    <div className="shopping-list-card  p-4   rounded-lg shadow-md">
      <div className="flex justify-between  items-center mb-4">
        {/* Contenido para editar nombre */}
        <div className="flex items-center space-x-2 ">
          {isEditingName ? (
            <>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="text-xl p-1 w-full font-josefin  text-black  rounded"
                autoFocus
              />
              <button
                onClick={handleNameEdit}
                className="ico-hover"
                aria-label="Guardar nombre"
              >
                <img
                  src="/img/ok-icon.png" // Ruta de tu imagen PNG
                  alt="Guardar"
                  className="w-10 h-8"
                  title="Guardar cambios"
                />
              </button>
              <button
                onClick={() => {
                  setNewListName(list.name);
                  setIsEditingName(false);
                }}
                className=""
                aria-label="Cancelar edición"
              >
                <img
                  src="/img/delete-icon.png" // Ruta de tu imagen PNG
                  alt="Cancelar"
                  className="w-10 h-8 ico-hover"
                  title="Cancelar edición"
                />
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-lg font-josefin mt-2">
                {list.name}
              </h2>
              {/* Botón Editar con imagen */}
              <button
                onClick={() => setIsEditingName(true)}
                className="ico-hover"
                aria-label="Editar nombre"
              >
                <img
                  src="/img/edit.png" // Ruta de tu imagen PNG
                  alt="Editar"
                  className="w-10 h-10"
                  title="Editar nombre de lista"
                />
              </button>
            </>
          )}
        </div>
        {/* Botón Eliminar con imagen */}
        <button
          onClick={onDelete}
          className="ico-hover"
          aria-label="Eliminar lista"
        >
          <img
            src="/img/delete.png" // Ruta de tu imagen PNG
            alt="Eliminar lista"
            className="w-9 h-10"
            title="Eliminar lista"
          />
        </button>
      </div>

      <p className="text-gray-500 create">
        Creado: {new Date(list.createdAt).toLocaleDateString()}
      </p>

      <div>
        {list.categories.length > 0 ? (
          list.categories.map((category) => {
            // Asegurar que category.items sea siempre un array
            const safeItems = Array.isArray(category.items)
              ? category.items
              : [];
            return (
              <div key={category._id || category.title} className="mb-4">
                <div className="flex justify-between items-center ">
                  {editingCategoryId === category._id ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nombre de la categoría"
                        className="w-full p-3 mb-2 rounded-lg bg-transparent border-2 border-naranja-bg text-white placeholder-gray-300 focus:outline-none focus:border-azul-bg transition-all"
                        autoFocus
                      />
                      <button
                        onClick={() =>
                          handleEditCategoryName(category._id, newCategoryName)
                        }
                        className="ico-hover"
                        aria-label="Guardar categoría"
                      >
                        <img
                          src="/img/ok-icon.png"
                          alt="Guardar"
                          className="w-8 h-8"
                          title="Guardar cambios"
                        />
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        className="ico-hover"
                        aria-label="Cancelar edición"
                      >
                        <img
                          src="/img/delete-icon.png"
                          alt="Cancelar"
                          className="w-8 h-8"
                          title="Cancelar edición"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-naranja-bg mt-2">
                        {category.title}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingCategoryId(category._id);
                          setNewCategoryName(category.title);
                        }}
                        className="ico-hover"
                        aria-label="Editar categoría"
                      >
                        <img
                          src="/img/edit.png"
                          alt="Editar"
                          className="w-10 h-10"
                          title="Editar categoría"
                        />
                      </button>
                    </div>
                  )}
                  {/* Ícono Eliminar SIEMPRE visible */}
                  <button
                    onClick={() => onDeleteCategory(category._id, list._id)}
                    className="ico-hover"
                    aria-label="Eliminar categoría"
                  >
                    <img
                      src="/img/delete.png"
                      alt="Eliminar"
                      className="w-9 h-10"
                      title="Eliminar categoría"
                    />
                  </button>
                </div>

                {/* Ítems de la categoría */}
                <ul className="custom-list">
                  {safeItems.length > 0 ? (
                    safeItems.map((item) => (
                      <li
                        key={item._id || item.name}
                        className="flex justify-between items-center mb-2"
                      >
                        <div className="flex space-x-2">
                          <span
                            className={`item-text ${
                              item.isPurchased
                                ? "line-through text-gray-400"
                                : ""
                            }`}
                          >
                            {item.quantity && `${item.quantity} `}
                            {item.unit && `${item.unit} `}
                            {item.name}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              onTogglePurchased(
                                item._id,
                                category._id,
                                list._id
                              )
                            }
                            className="text-azul-bg hover:underline"
                          >
                            {item.isPurchased ? "Desmarcar" : "Marcar"}
                          </button>
                          <button
                            onClick={() =>
                              onDeleteItem(item._id, category._id, list._id)
                            }
                            className="text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No hay ítems en esta categoría.
                    </p>
                  )}
                </ul>

                {/* Botón Agregar Ítem */}
                <button
                  onClick={() => openModal(category._id)} // Solo agrega ítem a una categoría existente
                  className="mt-2 text-naranja-bg hover:underline"
                >
                  + Agregar ítem
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No hay categorías en esta lista.</p>
        )}
      </div>

      {/* Botón Agregar Categoría */}
      <div className="mt-4 flex justify-between">
        {/* Botón para agregar categoría */}
        <button
          onClick={openCategoryModal}
          className="category bg-naranja-bg font-bold hover:text-white mt-4"
        >
          + Agregar categoría
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Agregar Ítem"
        className="user-modal-list glass-effect"
        overlayClassName="user-modal-overlay-list"
      >
        <h2 className="text-2xl font-bold mb-4 text-naranja-bg">
          Agregar Ítem
        </h2>
        <input
          type="text"
          placeholder="Nombre del ítem"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Cantidad (opcional)"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
        />
        <select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}>
          <option value="">Seleccionar unidad</option>
          <option value="kg">Kilogramos</option>
          <option value="g">Gramos</option>
          <option value="l">Litros</option>
          <option value="ml">Mililitros</option>
          <option value="pieza">Pieza</option>
          <option value="unidad">Unidad</option>
          <option value="taza">Taza</option>
          <option value="cucharada">Cucharada</option>
          <option value="cucharadita">Cucharadita</option>
          <option value="pizca">Pizca</option>
        </select>
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddItem}
            className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
          >
            Agregar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onRequestClose={closeCategoryModal}
        contentLabel="Agregar Categoría"
        className="user-modal-list glass-effect"
        overlayClassName="user-modal-overlay-list"
      >
        <h2 className="text-2xl font-bold mb-4 text-naranja-bg">
          Agregar Categoría
        </h2>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          className="w-full p-3 mb-2 rounded-lg bg-transparent border-2 border-naranja-bg text-white placeholder-gray-300 focus:outline-none focus:border-azul-bg transition-all"
        />
        <div className="flex justify-end">
          <button
            onClick={closeCategoryModal}
            className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddCategory}
            className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
          >
            Agregar
          </button>
        </div>
      </Modal>
    </div>
  );
};

ShoppingList.propTypes = {
  list: PropTypes.shape({
    _id: PropTypes.string, // Ya no es requerido para listas locales
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string, // Ya no es requerido para categorías locales
        title: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            _id: PropTypes.string, // Ya no es requerido para ítems locales
            name: PropTypes.string.isRequired,
            quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            unit: PropTypes.string,
            isPurchased: PropTypes.bool,
          })
        ),
      })
    ).isRequired,
  }).isRequired,
  onAddCategory: PropTypes.func.isRequired,
  onEditCategory: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onTogglePurchased: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEditName: PropTypes.func.isRequired,
};

export default ShoppingList;
