import { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import "../../styles/admin/adminReports.css";
import LoadingSpinner from "../../components/LoadingSpinner"; // Ajusta la ruta si es necesario

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Estado para la carga inicial
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [sortOption, setSortOption] = useState("dateDesc"); // Por defecto: Fecha descendente
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Reportes por página
  const [totalPages, setTotalPages] = useState(1);

  // Fetch de reportes
  const fetchReports = useCallback(async () => {
    setError("");
    setInitialLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/reports?page=${page}&limit=${limit}&status=${filterStatus}&sort=${sortOption}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar los reportes.");
      }

      const data = await response.json();

      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error al cargar los reportes:", err);
      setError("Error al cargar los reportes. Inténtalo nuevamente.");
    } finally {
      setInitialLoading(false);
    }
  }, [page, limit, filterStatus, sortOption]); // 🔹 Se asegura de recargar al cambiar `sortOption`

  useEffect(() => {
    fetchReports();
  }, [fetchReports]); // ✅ CORRECTO: Se pasa la función como dependencia

  const getPaginationArray = () => {
    const pagesToShow = 3;
    const pages = [];
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const paginationArray = getPaginationArray();

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Resolver un reporte
  const resolveReport = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "resolved" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al resolver el reporte.");
      }

      const updatedReport = await response.json();
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === id
            ? {
                ...report,
                status: "resolved",
                resolvedBy: updatedReport.report.resolvedBy,
              }
            : report
        )
      );
    } catch {
      setError("Error al resolver el reporte. Inténtalo nuevamente.");
    }
  };

  // Eliminar una receta
  const deleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}`,

        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la receta.");
      }

      const data = await response.json();
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.recipeId?._id === recipeId
            ? {
                ...report,
                recipeDeleted: true,
                status: "resolved",
                resolvedBy: data.resolvedBy,
              }
            : report
        )
      );
    } catch (err) {
      console.error("Error al eliminar la receta:", err.message);
      setError("Error al eliminar la receta. Inténtalo nuevamente.");
    }
  };

  // Eliminar un comentario
  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,

        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el comentario.");
      }

      const data = await response.json();
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.commentId === commentId
            ? {
                ...report,
                commentDeleted: true,
                status: "resolved",
                resolvedBy: data.resolvedBy,
              }
            : report
        )
      );
    } catch (error) {
      console.error("Error al eliminar el comentario:", error.message);
      setError("Error al eliminar el comentario. Inténtalo nuevamente.");
    }
  };

  const openCommentModal = (commentContent) => {
    setSelectedComment(commentContent);
  };

  const closeCommentModal = () => {
    setSelectedComment(null);
  };

  // Mostrar spinner inicial
  if (initialLoading) {
    return (
      <div className="spinner-container  mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <h2 className="section-title mb-20 text-center">Gestión de Reportes</h2>
      {error && <div className="message error">{error}</div>}

      <div className="filter-container">
        <label htmlFor="filterStatus" className="search-bar-label text-white">
          Filtrar por estado:
        </label>
        <div className="flex">
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-dropdown search-bar"
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="resolved">Resueltos</option>
          </select>
          <button
            className="icon-button-borrar clear-button"
            onClick={() => setFilterStatus("")}
            title="Borrar filtro"
          >
            <img src="/img/delete.png" alt="Borrar filtro" />
          </button>
        </div>

        <label htmlFor="sortOption" className="search-bar-label text-white">
          Ordenar por:
        </label>
        <select
          id="sortOption"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)} // 🔹 Actualiza la opción de ordenamiento
          className="filter-dropdown"
        >
          <option value="dateDesc">Fecha (Reciente primero)</option>
          <option value="dateAsc">Fecha (Antiguo primero)</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <p className="no-reports-message">
          {filterStatus
            ? "No se encontraron reportes para el filtro seleccionado."
            : "No hay reportes disponibles en este momento."}
        </p>
      ) : (
        <>
          <table className="report-table mt-20">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>ID Receta</th>
                <th>Título</th>
                <th>Tipo de Reporte</th>
                <th>ID Comentario</th>
                <th>Comentario</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString("es-ES")
                      : "-"}
                  </td>
                  <td>{report.recipeId?._id || "-"}</td>
                  <td>{report.recipeId?.title || "Receta eliminada"}</td>
                  <td>{report.commentId ? "Comentario" : "Receta"}</td>
                  <td>
                    {report.commentId || (
                      <span className="deleted-text text-white">-</span>
                    )}
                  </td>
                  <td>
                    {report.commentContent ? (
                      <button
                        className="view-comment-btn"
                        onClick={() => openCommentModal(report.commentContent)}
                      >
                        Ver Comentario
                      </button>
                    ) : (
                      <span className="deleted-text text-white">-</span>
                    )}
                  </td>
                  <td>{report.reason}</td>
                  <td>
                    {report.status === "pending" ? (
                      <button
                        onClick={() => resolveReport(report._id)}
                        className="resolve-btn"
                      >
                        Resolver
                      </button>
                    ) : (
                      <>
                        <span className="resolved-text">Resuelto por:</span>
                        <br />
                        {report.resolvedBy?.username ? (
                          <span className="resueltox text-green-500 hover:text-green-500">
                            {report.resolvedBy.username}
                          </span>
                        ) : (
                          <span className="text-gray-600 hover:text-gray-600">
                            Sin información
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    {!report.commentDeleted && report.commentId ? (
                      <button
                        onClick={() => deleteComment(report.commentId)}
                        className="delete-btn"
                      >
                        Eliminar Comentario
                      </button>
                    ) : report.commentDeleted ? (
                      <span className="deleted-text">Comentario eliminado</span>
                    ) : report.recipeDeleted ? (
                      <span className="deleted-text">Receta eliminada</span>
                    ) : (
                      <button
                        onClick={() => deleteRecipe(report.recipeId?._id)}
                        className="delete-btn"
                      >
                        Eliminar Receta
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Modal
        isOpen={!!selectedComment}
        onRequestClose={closeCommentModal}
        contentLabel="Comentario Reportado"
        className="modal-class"
        overlayClassName="modal-overlay"
      >
        <h2>Comentario Reportado</h2>
        <p>{selectedComment}</p>
        <button onClick={closeCommentModal} className="close-modal-btn">
          Cerrar
        </button>
      </Modal>

      <div className="pagination flex justify-center mt-10">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        {paginationArray.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`mx-2 px-4 py-2 rounded ${
              pageNum === page ? "active" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {totalPages > paginationArray[paginationArray.length - 1] && (
          <span className="mx-2">...</span>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AdminReports;
