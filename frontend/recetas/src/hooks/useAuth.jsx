import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook personalizado para acceder a la información del usuario autenticado.
 * Este hook proporciona el usuario actual almacenado en el contexto de autenticación.
 * 
 * @returns {Object} - Objeto que contiene el usuario actual (si está autenticado).
 */
export const useAuth = () => {
  const { currentUser, isLoading } = useContext(AuthContext);

  return { user: currentUser, isLoading };
};

export default useAuth;