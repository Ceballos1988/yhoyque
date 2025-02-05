import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext(); // Se mantiene el contexto sin exportación directa

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://yhoyque.onrender.com";

/**
 * Proveedor de contexto de autenticación para manejar la información del usuario autenticado.
 * Incluye funciones para obtener la información del usuario, manejar el logout y gestionar el estado de autenticación.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que serán envueltos por el proveedor de autenticación.
 * @returns {JSX.Element} - Proveedor de contexto con las funciones y estados de autenticación.
 */
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Obtiene la información del usuario autenticado desde la API.
   * Si no hay token en el localStorage, limpia el estado de usuario.
   */
  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      setCurrentUser(null);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/user-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser({
        id: response.data._id,
        role: response.data.role,
        email: response.data.email,
      });
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpia los datos del usuario y el token del almacenamiento local al hacer logout.
   * También dispara un evento para actualizar otros componentes que dependan de la autenticación.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear(); // Opcional: limpiar toda la sesión
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChanged"));
  };

  // Memoizamos handleAuthChange para evitar recrearla en cada render
  const handleAuthChange = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [handleAuthChange]);

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, isLoading, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ✅ Exportamos el contexto de forma nombrada y el provider como default
export { AuthContext };
export default AuthProvider;
