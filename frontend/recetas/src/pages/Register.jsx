import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/style.register.css";

/**
 * Componente para registrar un nuevo usuario.
 * @component
 */
function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState(""); // Nuevo estado para Instagram
  const [imageFile, setImageFile] = useState(null); // Estado para la imagen de perfil
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga
  const navigate = useNavigate();

  /**
   * Valida que la contraseña cumpla con los requisitos de seguridad.
   * @returns {boolean} - Devuelve `true` si la contraseña es válida, de lo contrario `false`.
   */
  const validatePassword = () => {
    const passwordRequirements =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRequirements.test(password);
  };

  /**
   * Maneja el proceso de registro del usuario.
   * @param {Event} e - Evento de envío del formulario.
   */
  const register = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword()) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*()-_=+{}[]:;\"'<>,.?/~`|\\)."
      );
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("username", username.toLowerCase()); // ⚠️ Convertir username a minúsculas antes de enviarlo
    formData.append("email", email);
    formData.append("password", password);
    formData.append("passwordConfirmation", confirmPassword);
    formData.append("bio", bio);
    formData.append("instagram", instagram);

    if (imageFile) {
      formData.append("profileImage", imageFile);
    } else {
      formData.append("profileImage", "/img/user-icon.png");
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.message.includes("username")) {
          setErrorMessage("El nombre de usuario no está disponible.");
        } else if (response.status === 409 && data.message.includes("email")) {
          setErrorMessage("El correo electrónico ya está registrado.");
        } else {
          setErrorMessage(data.message || "Error en el registro.");
        }
      } else {
        setSuccessMessage("Registro exitoso");
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/login");
        }, 2000);
      }
    } catch {
      setErrorMessage("Error del servidor. Inténtalo nuevamente.");
    }

    setIsLoading(false);
  };

  /**
   * Maneja el cambio de archivo de imagen para el perfil.
   * @param {Event} e - Evento de cambio de archivo.
   */
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  return (
    <div
      className="register-container flex flex-col items-center justify-center min-h-screen text-white pt-10 pb-20 mt-10"
      role="main"
      aria-labelledby="register-title"
    >
      <h1 id="register-title" className="text-4xl font-bold mb-8 mt-10">
        Crea tu cuenta
      </h1>
      <form
        onSubmit={register}
        className="register-form glass-effect p-8 rounded-lg shadow-lg text-black"
        aria-label="Formulario de registro de usuario"
      >
        <div className="flex gap-4">
          <div className="width-50">
            <label
              htmlFor="first-name"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Nombre:
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
              required
              aria-required="true"
            />
          </div>
          <div className="width-50">
            <label
              htmlFor="last-name"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Apellido:
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input-field"
              placeholder="Tu apellido"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="width-50">
            <label
              htmlFor="username"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Usuario:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Nombre de usuario"
              required
              aria-required="true"
            />
          </div>
          <div className="width-50">
            <label
              htmlFor="email"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Correo electrónico:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tucorreo@ejemplo.com"
              required
              aria-required="true"
              autoComplete="username"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="width-50">
            <label
              htmlFor="password"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Contraseña:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Contraseña"
              required
              aria-required="true"
              autoComplete="new-password"
            />
          </div>
          <div className="width-50">
            <label
              htmlFor="confirm-password"
              className="block font-semibold mb-2 text-naranja-bg"
            >
              Confirmar:
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Repite la contraseña"
              required
              aria-required="true"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Requisitos de contraseña en una línea completa */}
        <p className="text-xs text-red-500 mt-2 mb-2 w-full">
          *La contraseña debe cumplir con los siguientes requisitos:
        </p>
        <ul className="list-disc text-xs text-red-500 w-full">
          <li>
            Al menos <strong>8 caracteres</strong>.
          </li>
          <li>
            Al menos <strong>una mayúscula</strong>.
          </li>
          <li>
            Al menos <strong>una minúscula</strong>.
          </li>
          <li>
            Al menos <strong>un número</strong>.
          </li>
          <li>
            Al menos <strong>un carácter especial</strong> (permitidos:{" "}
            <strong>
              ! @ # $ % ^ &amp; * ( ) - _ = + {} [ ] : ; &quot; &apos; &lt; &gt;
              , . ? / ~ | &#92;
            </strong>
            ).
          </li>
        </ul>

        <label
          htmlFor="bio"
          className="block font-semibold mb-2 text-naranja-bg"
        >
          Biografía (opcional):
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-field"
          placeholder="Cuéntanos sobre ti"
        />

        <label
          htmlFor="instagram"
          className="block font-semibold mb-2 text-naranja-bg"
        >
          Instagram (opcional):
        </label>
        <input
          id="instagram"
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="input-field"
          placeholder="Tu cuenta de Instagram (opcional)"
        />

        <label
          htmlFor="profileImage"
          className="block font-semibold mb-2 text-naranja-bg"
        >
          Imagen de perfil (opcional):
        </label>
        {/* Aviso de tamaño de imagen máximo permitido */}
        <p className="text-xs text-red-500 mt-2 mb-5">
          *La imagen de perfil debe pesar menos de 10MB.
        </p>
        <div className="profile-image-upload flex flex-col items-left mb-4">
          <input
            id="profileImage"
            type="file"
            onChange={handleImageChange}
            name="profileImage" // Asegúrate de que el nombre coincida
            className="input-field"
            aria-label="Subir imagen de perfil"
          />
          <label
            htmlFor="profileImage"
            className="upload-button flex items-center cursor-pointer"
          >
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Vista previa de la imagen de perfil"
                className="profile-image-preview rounded-full w-20 h-20 object-cover mr-2"
              />
            ) : (
              <img
                src="/img/user-icon.png"
                alt="Imagen de perfil predeterminada"
                className="profile-image-preview rounded-full w-30 h-30 object-cover"
              />
            )}
            <span className="text-naranja-bg font-semibold">
              Seleccionar imagen
            </span>
          </label>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mt-10">
            <CustomButton
              text={isLoading ? <LoadingSpinner /> : "Crear cuenta"}
              bgColor="bg-naranja-bg"
              textColor="text-white"
              disabled={isLoading} // Deshabilitar el botón mientras está cargando
            />
          </div>
          {/* Mensaje de error */}
          {errorMessage && (
            <p
              className="error-message-profile font-semibold text-center "
              role="alert"
            >
              {errorMessage}
            </p>
          )}
          {/* Mensaje de éxito */}
          {successMessage && (
            <div
              className="success-message-profile font-semibold text-center"
              role="alert"
            >
              {successMessage}
            </div>
          )}
        </div>
      </form>

      {/* Enlace para iniciar sesión si ya tiene cuenta */}
      <p className="mt-10 text-lg mb-2 flex flex-wrap justify-center text-white">
        ¿Ya tienes cuenta?
      </p>
      <button>
        <Link to="/login" className="text-naranja-bg">
          Inicia sesión
        </Link>
      </button>
    </div>
  );
}

export default Register;
