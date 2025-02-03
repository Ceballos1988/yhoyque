import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import "../styles/components/style.forgot-reset-password.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isMessageError, setIsMessageError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    

      const data = await response.json();

      if (!response.ok) {
        console.error("Error en forgotPassword:", data);
        setMessage(`Error: ${data.message}`);
        setIsMessageError(true);
        return;
      }

      setMessage(data.message);
      setIsMessageError(false);
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error);
      setMessage("Error al solicitar restablecimiento.");
      setIsMessageError(true);
    }
  };

  return (
    <div className="forgot-password-container flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="forgot-password-title text-white">Recuperar Contraseña</h1>

      <form
        onSubmit={handleSubmit}
        className="forgot-password-form glass-effect p-8 rounded-lg shadow-lg text-black w-96"
      >
        <label htmlFor="email" className="block font-semibold mb-2 text-naranja-bg">
          Correo Electrónico:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />

        <div className="flex flex-col items-center mt-4">
          <CustomButton text="Enviar Enlace de Recuperación" bgColor="bg-naranja-bg" textColor="text-white" />
        </div>

        {message && (
          <p className={`mt-4 text-center font-semibold ${isMessageError ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </form>

      <button onClick={() => navigate("/login")} className="mt-4 text-naranja-bg">
        Volver al inicio de sesión
      </button>
    </div>
  );
};

export default ForgotPassword;
