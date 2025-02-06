import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://yhoyque.onrender.com"; // Fallback

// 🔹 Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  const response = await api.get(`${API_BASE_URL}/api/admin/statistics`, { 
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const getTopRecipesByLikes = async (token) => {
  const response = await api.get(`${API_BASE_URL}/api/admin/top-likes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTopRecipesByReports = async (token) => {
  const response = await api.get(`${API_BASE_URL}/api/admin/top-reports`, {
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
  const response = await api.get(`${API_BASE_URL}/api/admin/users-recipes-by-month`, {  // ✅ Correcto
    headers: { Authorization: `Bearer ${token}` },
    params: { year },
  });
  return response.data;
};


export const getRecipeDistribution = async (token) => {
  const response = await api.get(`${API_BASE_URL}/api/admin/recipe-distribution`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Obtener distribución por categoría
export const getRecipeCategoryDistribution = async (token) => {
  const response = await api.get(`${API_BASE_URL}/api/admin/users/category-distribution`, { // ✅ Correcto
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};



// Obtener distribución por tipo de dieta
export const getRecipeDietTypeDistribution = async (token) => {
  const response = await api.get(`${API_BASE_URL}/api/admin/users/diet-type-distribution`, { // ✅ Correcto
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
