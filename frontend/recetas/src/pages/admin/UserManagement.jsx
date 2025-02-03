import { useEffect, useState, useCallback } from "react";
import "../../styles/admin/userManagement.css";
import LoadingSpinner from "../../components/LoadingSpinner"; // Importa el componente del spinner

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Estado para el spinner inicial
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
  });

  const fetchUsers = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users?page=${currentPage}&limit=10&search=${searchQuery}`,
        {

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios.");
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error al cargar los usuarios:", err);
      setError("Error al cargar los usuarios.");
    } finally {
      setInitialLoading(false); // Detenemos el spinner inicial
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {

          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
        setMessage("Usuario eliminado correctamente.");
        setMessageType("success");
      } else {
        setMessage("No se pudo eliminar el usuario.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error al intentar eliminar el usuario.");
      setMessageType("error");
    } finally {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const startEditing = (user) => {
    setEditingUser(user._id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  };

  const saveUser = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {

          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(
          users.map((user) => (user._id === userId ? updatedUser : user))
        );
        setEditingUser(null);
        setMessage("Usuario actualizado correctamente.");
        setMessageType("success");
      } else {
        setMessage("Error al actualizar el usuario.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error al intentar actualizar el usuario.");
      setMessageType("error");
    } finally {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const getPaginationArray = () => {
    const pagesToShow = 3;
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const paginationArray = getPaginationArray();

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reinicia la página al realizar una búsqueda
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchUsers();
  };

  // Mostrar el spinner inicial
  if (initialLoading) {
    return (
      <div className="spinner-container mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="user-management">
      <h2 className="section-title text-center mb-20">Gestión de Usuarios</h2>
      {error && <div className="message error">{error}</div>}
      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="container-search flex">
        <div className="search-bar-container">
          <label htmlFor="searchBar" className="search-bar-label text-white">
            Buscar por username o email:
          </label>
          <div className="flex">
            <input
              type="text"
              id="searchBar"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Escribe aquí..."
              className="search-bar"
            />
            <button
              className="icon-button-borrar clear-button"
              onClick={clearSearch}
              title="Borrar búsqueda"
            >
              <img src="/img/delete.png" alt="Borrar búsqueda" />
            </button>
          </div>
        </div>
      </div>

      <table className="user-table mb-10 mt-20">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Username</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              {editingUser === user._id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="input-edit"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="input-edit"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.username}
                      className="input-edit bg-gray-300 cursor-not-allowed"
                      disabled={true} // 🔹 Bloquea la edición del username
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={editForm.email}
                      className="input-edit bg-gray-300 cursor-not-allowed"
                      disabled={true} // 🔹 Bloquea la edición del email
                    />
                  </td>
                  <td>
                    <select
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value })
                      }
                      className="select-edit"
                    >
                      <option value="admin">Admin</option>
                      <option value="consumer">Consumer</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="save-btn"
                      onClick={() => saveUser(user._id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => startEditing(user)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination flex justify-center mt-10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        {paginationArray.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`mx-2 px-4 py-2 rounded ${
              pageNum === currentPage
                ? "active"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {totalPages > paginationArray[paginationArray.length - 1] && (
          <span className="mx-2">...</span>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="mx-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
