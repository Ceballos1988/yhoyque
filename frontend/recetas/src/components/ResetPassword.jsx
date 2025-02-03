import { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/components/style.forgot-reset-password.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setMessage("Por favor, ingresa una nueva contraseña.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }), // Asegurar que se está enviando correctamente
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error en resetPassword:", data);
        setMessage(`Error: ${data.message}`);
        return;
      }

      setMessage("Contraseña restablecida con éxito.");
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      setMessage("Error al restablecer la contraseña.");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-container">
        <h2>Crear Nueva Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="reset-password-input"
          />
          <button type="submit" className="reset-password-button">
            Restablecer Contraseña
          </button>
        </form>
        {message && <p className={`reset-password-message ${message.includes("éxito") ? "success" : "error"}`}>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
