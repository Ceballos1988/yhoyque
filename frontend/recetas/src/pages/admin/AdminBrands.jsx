import { useState, useEffect } from "react";
import Modal from "react-modal";
import "../../styles/admin/adminBrands.css";
import LoadingSpinner from "../../components/LoadingSpinner"; // Ajusta la ruta si es necesario

import axios from "axios";

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: "", image: null });
  const [editBrand, setEditBrand] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [isTableLoading] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true); // Mostrar spinner global
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No estás autenticado.");
        return; // No olvides detener el spinner
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/brands`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBrands(response.data); // Cargar marcas en el estado
    } catch (error) {
      console.error("Error al cargar las marcas:", error);
      setErrorMessage("Error al cargar las marcas. Intenta nuevamente.");
    } finally {
      setLoading(false); // Detener spinner global siempre
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewBrand((prev) => ({ ...prev, image: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setNewBrand((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEditBrand((prev) => ({ ...prev, image: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setEditBrand((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newBrand.name || !newBrand.image) {
      setErrorMessage("Por favor, completa todos los campos.");
      return;
    }

    try {
      setIsAddingBrand(true); // Spinner para agregar marca
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No estás autenticado.");
        return;
      }

      const formData = new FormData();
      formData.append("name", newBrand.name);
      formData.append("image", newBrand.image);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/brands`,
        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(response.data.message || "Marca agregada con éxito.");
      setNewBrand({ name: "", image: null });
      setPreviewImage(null);
      fetchBrands(); // Refrescar la lista de marcas
    } catch (error) {
      console.error("Error al agregar la marca:", error);
      setErrorMessage("Error al agregar la marca. Intenta nuevamente.");
    } finally {
      setIsAddingBrand(false); // Detener el spinner
    }
  };

  const handleEditSubmit = async (e, brand) => {
    e.preventDefault(); // Esto ya no causará un error

    if (!brand.name) {
      setErrorMessage("Por favor, completa el nombre.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No estás autenticado.");
        return;
      }

      const formData = new FormData();
      formData.append("name", brand.name);
      if (brand.image) {
        formData.append("image", brand.image);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/brands/${brand._id}`,
        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Marca actualizada con éxito.");
      fetchBrands(); // Refresca las marcas después de la edición
    } catch (error) {
      console.error("Error al editar la marca:", error);
      setErrorMessage("Error al editar la marca. Intenta nuevamente.");
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No estás autenticado.");
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/brands/${brandToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Marca eliminada con éxito.");
      fetchBrands(); // Refrescar las marcas después de eliminar
    } catch (error) {
      console.error("Error al eliminar la marca:", error);
      setErrorMessage("Error al eliminar la marca. Intenta nuevamente.");
    } finally {
      setBrandToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = (brandId) => {
    setBrandToDelete(brandId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setBrandToDelete(null);
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-brands">
      <h2 className="section-title text-center">Gestión de Marcas</h2>

      <form
        onSubmit={editBrand ? handleEditSubmit : handleSubmit}
        className="brand-form"
      >
        <label>
          Nombre de la marca:
          <input
            type="text"
            name="name"
            value={editBrand ? editBrand.name : newBrand.name}
            onChange={editBrand ? handleEditChange : handleInputChange}
            className="form-input mt-10"
            placeholder="Ejemplo: Coca-Cola"
          />
          <div className=" file-requirements  text-left">
            <span className=" text-red-500 hover:text-red-500">
              * La imagen debe pesar menos de 10MB.
            </span>
          </div>
        </label>

        <div className="button-group-a mt-10">
          <label
            htmlFor="file-upload"
            className=" text-base px-4 py-2 rounded-md  font-bold transition-all duration-300 bg-[#EE8532] hover:bg-[#0f172b]  text-white"
          >
            Seleccionar Imagen
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={editBrand ? handleEditChange : handleInputChange}
            id="file-upload"
            className="hidden"
          />
          <button
            type="submit"
            disabled={isAddingBrand}
            className={`text-base px-4 py-2 rounded-md font-bold transition-all duration-300 ${
              isAddingBrand
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#EE8532] hover:bg-[#0f172b] text-white"
            }`}
          >
            {isAddingBrand ? "Agregando..." : "Agregar +"}
          </button>
        </div>
        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Previsualización" />
          </div>
        )}
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="brands-list flex">
        <h3 className="list-title">Marcas existentes:</h3>
        {isTableLoading ? (
          <div className="spinner-container">
            <LoadingSpinner />
          </div>
        ) : brands.length > 0 ? (
          <div className="brands-table-container flex">
            <table className="brands-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand._id}>
                    <td>
                      <img
                        src={brand.imageUrl}
                        alt={brand.name}
                        className="brand-image"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={brand.name}
                        onChange={(e) =>
                          setBrands((prev) =>
                            prev.map((b) =>
                              b._id === brand._id
                                ? { ...b, name: e.target.value }
                                : b
                            )
                          )
                        }
                        className="form-input"
                      />
                    </td>
                    <td>
                      <button
                        onClick={(event) => handleEditSubmit(event, brand)}
                        className="edit-button"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={() => openDeleteModal(brand._id)}
                        className="delete-button"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-brands-message">
            No hay marcas disponibles. ¡Agrega una nueva marca!
          </p>
        )}
      </div>
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={closeDeleteModal}
        contentLabel="Eliminar Marca"
        className="user-modal-list glass-effect"
        overlayClassName="user-modal-overlay-list"
      >
        <h2 className="modal-session font-bold mb-4 text-naranja-bg">
          ¿Estás seguro?
        </h2>
        <p className="modal-session mb-6 text-white">
          ¿Realmente deseas eliminar esta marca?
        </p>
        <div className="flex justify-center">
          <button
            onClick={closeDeleteModal}
            className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBrands;
