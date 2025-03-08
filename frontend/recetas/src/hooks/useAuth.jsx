import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook personalizado para acceder a la información del usuario autenticado.
 * Este hook proporciona el usuario actual almacenado en el contexto de autenticación.
 * 
 * @returns {Object} - Objeto que contiene el usuario actual (si está autenticado).
 */
export const useAuth = () => {
  const { currentUser, isLoading, fetchUser } = useContext(AuthContext);

  useEffect(() => {
    const handleAuthChange = () => {
      fetchUser(); // 🔹 Refresca el usuario cuando cambie la sesión
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [fetchUser]); // 🔹 Se ejecuta solo si `fetchUser` cambia

  return { user: currentUser, isLoading };
};

export default useAuth;
