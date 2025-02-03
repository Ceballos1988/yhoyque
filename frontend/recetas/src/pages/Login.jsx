import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/style.login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Unificamos mensajes de error y éxito
  const [isMessageError, setIsMessageError] = useState(false); // Determina si el mensaje es de error
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmailFormat = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      setIsMessageError(true);
      setIsLoading(false);
      return;
    }
    if (!validateEmailFormat(email)) {
      setMessage("El formato del correo electrónico no es válido.");
      setIsMessageError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          localStorage.setItem("token", data.token);
          setMessage("Inicio de sesión exitoso");
          setIsMessageError(false);

          window.dispatchEvent(new Event("authChanged"));

          setTimeout(() => {
            window.scrollTo(0, 0);
            navigate("/recipe-wall");
          }, 2000);
        } else {
          setMessage("Token no recibido");
          setIsMessageError(true);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Error en el inicio de sesión");
        setIsMessageError(true);
      }
    } catch (error) {
      setMessage("Error en el inicio de sesión: " + error.message);
      setIsMessageError(true);
    }
    setIsLoading(false);
  };

  return (
    <div
      className="login-container flex flex-col items-center justify-center min-h-screen text-white"
      role="main"
    >
      <h1 className="font-bold mb-8 mt-10">Iniciar Sesión</h1>

      <form
        onSubmit={login}
        className="login-form glass-effect p-8 rounded-lg shadow-lg text-black w-96"
        aria-label="Formulario de inicio de sesión"
      >
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
          autoComplete="email"
          required
          aria-required="true"
        />

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
          autoComplete="current-password"
          required
          aria-required="true"
        />

        <div className="flex flex-col items-center">
          <CustomButton
            text={isLoading ? <LoadingSpinner /> : "Iniciar Sesión"}
            bgColor="bg-naranja-bg"
            textColor="text-white"
            disabled={isLoading}
          />
        </div>

        {/* Mensaje de éxito o error */}
        {message && (
          <p
            className={`mt-4 text-center font-semibold ${
              isMessageError ? "text-red-500" : "text-green-500"
            }`}
            role="alert"
          >
            {message}
          </p>
        )}
      </form>

      <div className="flex flex-col items-center mt-4">
        <button onClick={() => navigate("/forgot-password")}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <p className="mt-10 text-lg mb-2 flex flex-wrap justify-center">
        ¿No tienes cuenta?
      </p>
      <button onClick={() => navigate("/register")} className="text-naranja-bg">
        Regístrate
      </button>
    </div>
  );
}

export default Login;
