import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/components/style.comments.css";

const Comments = ({
  comments,
  recipeId,
  currentUserId,
  onAddComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [message, setMessage] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(2);
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    comment: null,
  });
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [offlineComments, setOfflineComments] = useState([]);

  // Cargar comentarios desde localStorage si está offline
  useEffect(() => {
    if (!navigator.onLine) {
      const storedComments =
        JSON.parse(localStorage.getItem(`comments-${recipeId}`)) || [];
      setOfflineComments(storedComments);
    } else {
      // Guardar los comentarios en localStorage si estamos online
      localStorage.setItem(`comments-${recipeId}`, JSON.stringify(comments));
    }
  }, [comments, recipeId]);

  // Función para agregar comentarios
  const handleAddComment = async () => {
    const token = localStorage.getItem("token");

    if (!newComment.trim()) {
      setMessage("El comentario no puede estar vacío.");
      return;
    }

    if (!navigator.onLine) {
      setMessage("No puedes agregar comentarios mientras estás offline.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments/recipe/${recipeId}`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { comment } = res.data;
      onAddComment(comment);
      setNewComment(""); // Limpia el campo de texto

      // Actualiza localStorage después de agregar un comentario
      const updatedComments = [...comments, comment];
      localStorage.setItem(
        `comments-${recipeId}`,
        JSON.stringify(updatedComments)
      );
    } catch (error) {
      console.error(
        "Error al agregar el comentario:",
        error.response?.data || error
      );
      setMessage("Hubo un error al agregar el comentario.");
    }
  };

  // Función para eliminar un comentario
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "No estás autenticado. Inicia sesión para eliminar comentarios."
      );
      return;
    }

    if (!navigator.onLine) {
      setMessage("No puedes eliminar comentarios mientras estás offline.");
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onDeleteComment) {
        onDeleteComment(commentId);
      }

      // Actualiza localStorage después de eliminar un comentario
      const updatedComments = comments.filter(
        (comment) => comment._id !== commentId
      );
      localStorage.setItem(
        `comments-${recipeId}`,
        JSON.stringify(updatedComments)
      );
    } catch (error) {
      console.error("Error al eliminar el comentario:", error);
      setMessage("Hubo un error al eliminar el comentario.");
    }
  };

  // Función para cargar más comentarios
  const handleLoadMoreComments = () => {
    setVisibleCommentsCount((prev) => prev + 2);
  };

  // Función para abrir el modal de reporte
  const handleReportComment = (comment) => {
    if (!navigator.onLine) {
      setMessage("No puedes reportar comentarios sin conexión.");
      return;
    }

    if (!reportModal.isOpen) {
      setReportModal({ isOpen: true, comment });
    }
  };

  // Función para cerrar el modal de reporte
  const closeReportModal = () => {
    setReportModal({ isOpen: false, comment: null });
    setReportReason("");
    setReportDetails("");
    setMessage("");
  };

  // Función para enviar un reporte
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      setReportMessage("Por favor, selecciona un motivo para el reporte.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setReportMessage("Debes iniciar sesión para reportar comentarios.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        {
          commentId: reportModal.comment._id,
          reason: reportReason,
          details: reportDetails.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReportMessage("Reporte enviado con éxito.");
      setTimeout(() => closeReportModal(), 2000); // Cierra el modal tras 2 segundos
    } catch (error) {
      console.error(
        "Error al enviar el reporte:",
        error.response?.data || error
      );
      setReportMessage("Hubo un error al enviar el reporte.");
    }
  };

  const displayedComments = navigator.onLine ? comments : offlineComments;

  return (
    <div className="custom-comments-section">
      {(Array.isArray(displayedComments) ? displayedComments : [])
        .slice(0, visibleCommentsCount)
        .map((comment) => (
          <div key={comment._id} className="custom-comment">
            <div className="custom-comment-content">
              <p>
                <strong>{comment.userName || "Usuario desconocido"}</strong>
              </p>
              <p>{comment.content || "Comentario no disponible"}</p>
              <p className="text-xs">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : "Fecha no disponible"}
              </p>
            </div>
            <div className="custom-comment-actions">
              {comment.userId === currentUserId && (
                <button
                  className="custom-delete-button font-semibold"
                  onClick={() => handleDeleteComment(comment._id)}
                  title="Eliminar comentario"
                >
                  X
                </button>
              )}
              <button
                className="text-red-500 hover:underline focus:outline-none font-semibold"
                onClick={() => handleReportComment(comment)}
                title="Reportar comentario"
              >
                Reportar
              </button>
            </div>
          </div>
        ))}

      {Array.isArray(displayedComments) &&
        displayedComments.length > visibleCommentsCount && (
          <button
            className="bg-transparent text-orange-500 mt-2"
            onClick={handleLoadMoreComments}
          >
            Cargar más
          </button>
        )}

      <label htmlFor="new-comment" className="sr-only">
        Nuevo comentario
      </label>
      <textarea
        id="new-comment"
        className="custom-textarea text-black"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Escribe un comentario..."
        disabled={!navigator.onLine}
      />
      <button
        className="custom-add-comment-button font-poppins mb-5"
        onClick={handleAddComment}
        disabled={!navigator.onLine}
      >
        Agregar
      </button>

      {message && <p className="custom-error-message">{message}</p>}

      <Modal
        isOpen={reportModal.isOpen}
        onRequestClose={closeReportModal}
        contentLabel="Reportar Comentario"
        className="user-modal-list glass-effect"
        overlayClassName="user-modal-overlay-list"
      >
        <h2 className="modal-session font-bold mb-4 text-naranja-bg">
          Reportar Comentario
        </h2>
        <p className="modal-session mb-4 text-white">
          ¿Por qué deseas reportar este comentario?
        </p>

        <div className="report-reasons">
          {["Spam", "Contenido ofensivo"].map((reason) => (
            <label
              key={reason}
              className="reason-item text-white flex items-center"
            >
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={reportReason === reason}
                onChange={() => setReportReason(reason)}
                className="mr-2 mt-3"
              />
              {reason}
            </label>
          ))}
        </div>

        {reportMessage && (
          <p
            className={`mt-2 ${
              reportMessage.includes("éxito")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {reportMessage}
          </p>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={closeReportModal}
            className="modal-button cancel px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmitReport}
            className="modal-button add px-4 py-2 rounded-md bg-red-500 hover:bg-red-700"
            disabled={!navigator.onLine}
          >
            Enviar Reporte
          </button>
        </div>
      </Modal>
    </div>
  );
};

Comments.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      userName: PropTypes.string,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  recipeId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
};

export default Comments;
