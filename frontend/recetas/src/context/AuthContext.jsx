import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";

export const AuthContext = createContext();

/**
 * Proveedor de contexto de autenticación para manejar la información del usuario autenticado.
 * Incluye funciones para obtener la información del usuario, manejar el logout y gestionar el estado de autenticación.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que serán envueltos por el proveedor de autenticación.
 * @returns {JSX.Element} - Proveedor de contexto con las funciones y estados de autenticación.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga

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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/user-info`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    localStorage.removeItem("token"); // Limpiar el token de localStorage
    setCurrentUser(null); // Limpiar el estado del usuario
    window.dispatchEvent(new Event("authChanged")); // Disparar evento para actualizar otros componentes
  };

  // Memoizamos handleAuthChange para evitar recrearla en cada render
  const handleAuthChange = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(); // Reintentar obtener el usuario si se detecta un token
    } else {
      setCurrentUser(null); // Si no hay token, limpiar el usuario actual
    }
  }, []); // Dependencias vacías porque no depende de ninguna variable externa

  useEffect(() => {
    // Llamar a fetchUser al montar el componente
    fetchUser();

    // Escuchar cambios en el evento 'authChanged' para detectar cambios de autenticación
    window.addEventListener("authChanged", handleAuthChange);

    // Escuchar el almacenamiento local para detectar cambios entre pestañas (multi-tab)
    window.addEventListener("storage", handleAuthChange);

    // Limpiar los listeners cuando el componente se desmonte
    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [handleAuthChange]); // Ahora handleAuthChange está memoizada y no cambia entre renders

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
