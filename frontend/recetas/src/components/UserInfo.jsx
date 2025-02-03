import { useState, useEffect, useCallback } from "react";
import logger from "../utils/logger"; // Importa winston para el manejo de logs

/**
 * Hook personalizado que obtiene la información del usuario autenticado.
 * Realiza una solicitud al endpoint de información del usuario para obtener el nombre.
 * @returns {Object} - Contiene el nombre del usuario en mayúsculas.
 */
function UserInfo() {
  const [userName, setUserName] = useState("");

  // Memoizamos la función fetchUserInfo para evitar que se vuelva a crear en cada render
  const fetchUserInfo = useCallback(async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/user-info`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No autorizado");
      }

      const data = await response.json();
      if (data && data.username) {
        setUserName(data.username.toUpperCase()); // Convertimos a mayúsculas para mostrar un formato consistente
      }
    } catch (error) {
      logger.error("Error al obtener el nombre de usuario:", { error });
    }
  }, []); // No necesita dependencias adicionales, ya que no accede a valores fuera de la función

  // Efecto para cargar la información del usuario cuando el componente se monta
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo(token);
    }
  }, [fetchUserInfo]); // Añadir fetchUserInfo como dependencia

  return { userName };
}

export default UserInfo;
