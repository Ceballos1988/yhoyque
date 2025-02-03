import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import axios from "axios";
import "../styles/components/ReportButton.css";

const ReportButton = ({ recipeId, commentId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  const reasons = [
    "Información incorrecta",
    "Contenido ofensivo",
    "Spam",
    
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReason("");
    setDetails("");
    setMessage("");
  };

  const handleReport = async () => {
    if (!selectedReason) {
      setMessage("Por favor, selecciona un motivo para el reporte.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (import.meta.env.MODE === "development") {
      console.log("Datos enviados al backend:", {
        recipeId,
        commentId,
        reason: selectedReason,
        details,
      });
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports`,

        { recipeId, commentId, reason: selectedReason, details },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Reporte enviado con éxitosamente.");
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error(
        "Error al enviar el reporte:",
        error.response?.data || error.message || error
      );
      setMessage("Hubo un error al enviar el reporte. Inténtalo nuevamente.");
    }
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="text-red-500 hover:underline focus:outline-none mt-2 ml-5"
        title={commentId ? "Reportar este comentario" : "Reportar esta receta"}
      >
        Reportar
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={commentId ? "Reportar Comentario" : "Reportar Receta"}
        className="user-modal-list glass-effect"
        overlayClassName="user-modal-overlay-list"
      >
        <h2 className="modal-session font-bold mb-4 text-naranja-bg">
          {commentId ? "Reportar Comentario" : "Reportar Receta"}
        </h2>
        <p className="modal-session mb-4 text-white">
          {commentId
            ? "¿Por qué deseas reportar este comentario?"
            : "¿Por qué deseas reportar esta receta?"}
        </p>
        <div className="report-reasons ml-7">
          {reasons.map((reason) => (
            <label key={reason} className="reason-item">
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              {reason}
            </label>
          ))}
        </div>

       
        {message && (
         <p className={`mt-2 ${message.includes("exitosamente") ? "text-success" : "text-error"}`}>

            {message}
          </p>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={closeModal}
            className="modal-button cancel px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleReport}
            className="modal-button add px-4 py-2 rounded-md bg-red-500 hover:bg-red-700"
          >
            Enviar Reporte
          </button>
        </div>
      </Modal>
    </div>
  );
};

ReportButton.propTypes = {
  recipeId: PropTypes.string,
  commentId: PropTypes.string, // Ahora es opcional, dependiendo de lo que se quiera reportar
};

export default ReportButton;
