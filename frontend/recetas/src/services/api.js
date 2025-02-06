import axios from "axios";

// 🔹 Aseguramos que la baseURL siempre esté bien configurada
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://yhoyque.onrender.com";

// 🔹 Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,  // Aquí usamos la variable que ya tiene el fallback
  withCredentials: true,  // Solo si usas cookies
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

// 🔹 Funciones usando la instancia de axios sin repetir la baseURL

// Buscar receta por ID
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

// Obtener estadísticas de administrador
export const getAdminStatistics = async (token) => {
  const response = await api.get(`/api/admin/statistics`, { 
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Recetas con más likes
export const getTopRecipesByLikes = async (token) => {
  const response = await api.get(`/api/admin/top-likes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Recetas más reportadas
export const getTopRecipesByReports = async (token) => {
  const response = await api.get(`/api/admin/top-reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Motivos de reportes
export const getReportMotives = async (token) => {
  const response = await api.get(`/api/reports/motives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Usuarios y recetas por mes
export const getUsersAndRecipesByMonth = async (year, token) => {
  const response = await api.get(`/api/admin/users-recipes-by-month`, {  
    headers: { Authorization: `Bearer ${token}` },
    params: { year },
  });
  return response.data;
};

// Distribución de recetas
export const getRecipeDistribution = async (token) => {
  const response = await api.get(`/api/admin/recipe-distribution`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Distribución por categoría
export const getRecipeCategoryDistribution = async (token) => {
  const response = await api.get(`/api/admin/users/category-distribution`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Distribución por tipo de dieta
export const getRecipeDietTypeDistribution = async (token) => {
  const response = await api.get(`/api/admin/users/diet-type-distribution`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
