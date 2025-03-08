import axios from "axios";

// 🔹 Configuración de la base URL de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://yhoyque.onrender.com";

// 🔹 Crear una instancia de Axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // Solo si usas cookies
});

// 🔹 Interceptor de respuestas para manejar errores de red y recuperar desde caché
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!navigator.onLine) {
      console.warn("⚠️ Sin conexión: Intentando obtener datos desde la caché...");
      const cache = await caches.open("api-cache");
      const cachedResponse = await cache.match(error.config.url);

      if (cachedResponse) {
        return cachedResponse.clone().json(); // 🔹 Evita errores de conversión
      }

      alert("🔴 No tienes conexión y no hay datos en caché.");
    }
    return Promise.reject(error);
  }
);

// 🔹 Función genérica para manejar peticiones y caché
const fetchWithCache = async (url, options = {}, token) => {
  const cache = await caches.open("api-cache");
  const cachedResponse = await cache.match(url);

  if (!navigator.onLine && cachedResponse) {
    console.log("📂 Obteniendo datos desde caché:", url);
    return cachedResponse.clone().json();
  }

  try {
    const response = await api.get(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}` },
    });

    cache.put(url, new Response(JSON.stringify(response.data))); // 🔹 Guarda en caché
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener datos de ${url}:`, error);
    throw error;
  }
};

// 🔹 Funciones API optimizadas con caché

// Buscar receta por ID
export const searchRecipeById = async (id, token) => {
  try {
    const response = await api.get(`/api/recipes/admin/searchById`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });
    return response.data.recipe;
  } catch (error) {
    console.error("Error en searchRecipeById:", error);
    throw error;
  }
};

// Obtener estadísticas de administrador
export const getAdminStatistics = (token) => fetchWithCache(`/api/admin/statistics`, {}, token);

// Recetas con más likes
export const getTopRecipesByLikes = (token) => fetchWithCache(`/api/admin/top-likes`, {}, token);

// Recetas más reportadas
export const getTopRecipesByReports = (token) => fetchWithCache(`/api/admin/top-reports`, {}, token);

// Motivos de reportes
export const getReportMotives = (token) => fetchWithCache(`/api/reports/motives`, {}, token);

// Usuarios y recetas por mes
export const getUsersAndRecipesByMonth = (year, token) => fetchWithCache(`/api/admin/users-recipes-by-month?year=${year}`, {}, token);

// Distribución de recetas
export const getRecipeDistribution = (token) => fetchWithCache(`/api/admin/recipe-distribution`, {}, token);

// Distribución por categoría
export const getRecipeCategoryDistribution = (token) => fetchWithCache(`/api/admin/users/category-distribution`, {}, token);

// Distribución por tipo de dieta
export const getRecipeDietTypeDistribution = (token) => fetchWithCache(`/api/admin/users/diet-type-distribution`, {}, token);
