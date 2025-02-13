// src/pages/Profile.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/style.profile.css";
import Modal from "react-modal";

/**
 * Componente Profile que permite a los usuarios ver y actualizar su perfil.
 * @component
 * @returns {JSX.Element} Página de perfil renderizada.
 */
function Profile() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState(""); // Estado para Instagram
  const [currentPassword, setCurrentPassword] = useState(""); // Estado para contraseña actual
  const [password, setPassword] = useState(""); // Estado para nueva contraseña
  const [profileImage, setProfileImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true); // Estado para controlar la carga de la imagen
  const [isSaving, setIsSaving] = useState(false); // Estado para controlar la carga al guardar cambios
  const [showPasswordField, setShowPasswordField] = useState(false); // Estado para mostrar/ocultar el campo de contraseña
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  /**
   * Obtiene los datos del perfil de usuario desde la API.
   */
  const fetchUserData = async () => {
    if (!navigator.onLine) {
      const cachedData = JSON.parse(localStorage.getItem("cachedUserProfile"));
      if (cachedData) {
        setUser(cachedData);
        setFirstName(cachedData.firstName || "");
        setLastName(cachedData.lastName || "");
        setEmail(cachedData.email || "");
        setUsername(cachedData.username || "");
        setBio(cachedData.bio || "");
        setInstagram(cachedData.instagram || "");
        setProfileImage(cachedData.profileImage);
        setIsLoading(false);
      } else {
        setErrorMessage("No hay datos disponibles para mostrar sin conexión.");
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setInstagram(data.instagram || "");
        setProfileImage(data.profileImage);

        // Guardar datos en localStorage para el modo offline
        localStorage.setItem("cachedUserProfile", JSON.stringify(data));
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Error al obtener los datos del usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Maneja la actualización del perfil del usuario.
   * @param {Event} e - Evento de envío del formulario.
   */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("instagram", instagram); // Incluir Instagram en el formulario
    if (currentPassword) formData.append("currentPassword", currentPassword); // Añadir contraseña actual si está presente
    if (password) formData.append("password", password); // Añadir nueva contraseña si está presente
    if (profileImage && profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Perfil actualizado con éxito.");
        window.dispatchEvent(new Event("authChanged"));
        await fetchUserData(); // Refresca el perfil para mostrar los cambios
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Error al actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  /**
   * Maneja el cambio de archivo para la carga de imagen de perfil.
   * @param {Event} e - Evento de cambio de input de archivo.
   */
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setIsImageLoading(false);
    } else {
      setProfileImage(null); // Manejar si no se selecciona un archivo
    }
  };

  /**
   * Solicita la eliminación de la cuenta de usuario.
   */
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/delete`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/");
      } else {
        const data = await response.json();
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Error al eliminar la cuenta.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  /**
   * Abre el modal de confirmación para eliminar la cuenta.
   */
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  /**
   * Cierra el modal de confirmación para eliminar la cuenta.
   */
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <div
      className="profile-container min-h-screen flex flex-col items-center justify-center text-white pb-20 pt-10"
      role="main"
    >
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
          {/* Encabezado principal */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-10 mt-10 text-white">
              ¡Bienvenido a tu espacio personal!
            </h1>
          </div>

          {/* Contenido del mensaje */}
          <div className="text-left">
            <p className="parrafo mb-5 text-left font-poppins">
              Acá podés personalizar tu <strong>perfil</strong> como más te
              guste. Actualizá tu nombre, apellido, biografía o foto de perfil
              para que la comunidad te conozca mejor. Si querés, podés agregar
              también tu cuenta de Instagram para compartir un poquito más de
              vos. ¿Cambiaste de contraseña o querés actualizarla? Todo eso lo
              podés manejar desde este mismo espacio, rápido y fácil.
            </p>

            {/* Mensaje destacado */}
            <h2 className="mb-10 mt-10 text-center text-naranja-bg font-poppins">
              ¡Dale tu estilo al perfil y que la comunidad te reconozca!
            </h2>
          </div>
        </div>
      )}

      <div className="form-container p-6 rounded-lg ">
        {isLoading ? (
          <LoadingSpinner />
        ) : user ? (
          <>
            {isOffline && (
              <div className="bg-red-500 text-white p-4 rounded mb-4">
                Estás sin conexión. Solo puedes ver la información de tu perfil.
                Conéctate a Internet para hacer cambios.
              </div>
            )}

            <form
              className="profile-form glass-effect p-8 rounded-lg text-white w-full"
              onSubmit={handleProfileUpdate}
              aria-label="Formulario de perfil"
            >
              {/* Imagen de perfil */}
              <div className="profile-image flex justify-center items-center flex-col mb-8">
                {isImageLoading && <LoadingSpinner />}
                <img
                  src={
                    profileImage instanceof File
                      ? URL.createObjectURL(profileImage)
                      : user?.profileImage || "/img/user-icon.png"
                  }
                  alt="Imagen de perfil"
                  className="profile-img-circle"
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    e.target.src = "/img/user-icon.png";
                    setIsImageLoading(false);
                  }}
                  style={{ display: isImageLoading ? "none" : "block" }}
                />
                <label className="exception px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-[#EE8532] mt-5 hover:bg-[#0f172b] hover:text-white">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    aria-label="Seleccionar archivo de imagen de perfil"
                    accept="image/*"
                    disabled={isOffline}
                  />
                  Seleccionar archivo
                </label>
                <div className="mt-5 span-real">
                  <span className="text-sx text-left text-red-500 hover:text-red-500 mt-2">
                    *La imagen de perfil debe pesar menos de 10MB.
                  </span>
                </div>
              </div>

              {/* Fila: Nombre y Apellido */}
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label
                    htmlFor="firstName"
                    className="block font-semibold mb-2"
                  >
                    Nombre:
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field text-black"
                    placeholder="Nombre registrado"
                    disabled={isOffline}
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="lastName"
                    className="block font-semibold mb-2"
                  >
                    Apellido:
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field text-black"
                    placeholder="Apellido registrado"
                    disabled={isOffline}
                  />
                </div>
              </div>

              {/* Fila: Nombre de usuario e Instagram */}
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label
                    htmlFor="username"
                    className="block font-semibold mb-2"
                  >
                    Usuario:
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field text-black"
                    placeholder="Nombre de usuario"
                    disabled={isOffline}
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="instagram"
                    className="block font-semibold mb-2"
                  >
                    Instagram:
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="input-field text-black"
                    placeholder="Tu cuenta de Instagram"
                    disabled={isOffline}
                  />
                </div>
              </div>

              {/* Biografía */}
              <div className="mb-4">
                <label htmlFor="bio" className="block font-semibold mb-2">
                  Biografía:
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field text-black"
                  placeholder="Escribe algo sobre ti"
                  disabled={isOffline}
                />
              </div>

              {/* E-mail */}
              <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-2">
                  E-mail:
                </label>
                <div className="span-real">
                  <span className="text-xs text-red-500 hover:text-red-500 ">
                    *No se pueden hacer cambios al e-mail
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="input-field text-black mt-2"
                />
              </div>

              {/* Checkbox para cambiar contraseña */}
              <div className="mt-4 custom-checkbox">
                <input
                  type="checkbox"
                  id="changePasswordCheckbox"
                  checked={showPasswordField}
                  onChange={() => setShowPasswordField((prev) => !prev)}
                  disabled={isOffline}
                />
                <label
                  htmlFor="changePasswordCheckbox"
                  className="font-semibold cursor-pointer"
                >
                  Quiero cambiar mi contraseña
                </label>
              </div>

              {/* Campos de contraseña */}
              {showPasswordField && (
                <div className="mt-4">
                  <label
                    htmlFor="currentPassword"
                    className="block font-semibold mb-2"
                  >
                    Contraseña Actual:
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field text-black"
                    placeholder="Contraseña actual"
                    disabled={isOffline}
                  />

                  <label
                    htmlFor="password"
                    className="block font-semibold mb-2 mt-4"
                  >
                    Nueva Contraseña:
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field text-black"
                    placeholder="Nueva contraseña"
                    disabled={isOffline}
                  />
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col items-center mt-8">
                <CustomButton
                  text={isSaving ? <LoadingSpinner /> : "Guardar Cambios"}
                  bgColor="bg-naranja-bg hover:text-white"
                  textColor="text-white"
                  disabled={isSaving || isOffline}
                />
                <button
                  type="button"
                  className={`text-red-500 mt-4 font-bold ${
                    isOffline ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={openDeleteModal}
                  aria-label="Eliminar cuenta"
                  disabled={isOffline}
                >
                  Eliminar Cuenta
                </button>
              </div>

              {/* Mensaje de éxito */}
              {successMessage && (
                <p
                  className="success-message-profile font-semibold text-center"
                  role="alert"
                >
                  {successMessage}
                </p>
              )}

              {/* Mensaje de error */}
              {errorMessage && (
                <p
                  className="error-message-profile font-semibold text-center"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}
            </form>
          </>
        ) : (
          <p className="text-red-500">Error al cargar el perfil.</p>
        )}

        {/* Modal de confirmación para eliminar cuenta */}
        <Modal
          isOpen={showDeleteModal}
          onRequestClose={closeDeleteModal}
          contentLabel="Eliminar Cuenta"
          className="user-modal-list glass-effect"
          overlayClassName="user-modal-overlay-list"
        >
          <h2 className="modal-session text-naranja-bg font-bold mb-4">
            ¿Estás seguro?
          </h2>
          <p className="modal-session mb-6">
            ¿Realmente deseas eliminar tu cuenta?
          </p>
          <p className="text-xs text-red-400 mb-2">
            *Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center">
            <button
              className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500  hover:bg-red-700 hover:text-naranja-bg"
              onClick={closeDeleteModal}
              aria-label="Cancelar eliminación de cuenta"
            >
              Cancelar
            </button>
            <button
              className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
              onClick={handleDeleteAccount}
              aria-label="Confirmar eliminación de cuenta"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Profile;
