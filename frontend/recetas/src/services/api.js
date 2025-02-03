import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

// 🔹 Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔹 Interceptor de respuestas para manejar errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      alert("🔴 No tienes conexión a Internet. Algunas funciones pueden no estar disponibles.");
    }
    return Promise.reject(error);
  }
);

// Función para buscar receta por ID
export const searchRecipeById = async (id, token) => {
  try {
    const response = await api.get(`/api/recipes/admin/searchById`, {
      params: { id },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.recipe;
  } catch (error) {
    console.error("Error al buscar receta por ID:", error);
    throw error;
  }
};

// 🔹 Reemplazar axios.get por api.get en las funciones existentes
export const getAdminStatistics = async (token) => {
  const response = await api.get(`${API_BASE_URL}/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTopRecipesByLikes = async (token) => {
  const response = await api.get(`${API_BASE_URL}/top-likes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTopRecipesByReports = async (token) => {
  const response = await api.get(`${API_BASE_URL}/top-reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getReportMotives = async (token) => {
  const response = await api.get(`/api/reports/motives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUsersAndRecipesByMonth = async (year, token) => {
  const response = await api.get(`${API_BASE_URL}/users-recipes-by-month`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { year },
  });
  return response.data;
};

export const getRecipeDistribution = async (token) => {
  const response = await api.get(`${API_BASE_URL}/recipe-distribution`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Obtener distribución por categoría
export const getRecipeCategoryDistribution = async (token) => {
  try {
    const response = await api.get(`${API_BASE_URL}/category-distribution`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución por categoría:", error);
    throw new Error("Error al obtener la distribución por categoría.");
  }
};

// Obtener distribución por tipo de dieta
export const getRecipeDietTypeDistribution = async (token) => {
  try {
    const response = await api.get(`${API_BASE_URL}/diet-type-distribution`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución por tipo de dieta:", error);
    throw new Error("Error al obtener la distribución por tipo de dieta.");
  }
};
