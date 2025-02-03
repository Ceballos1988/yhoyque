import express from 'express';
import upload from '../multerConfig.js'; // Configuración de multer para subir imágenes
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeAdmin from '../middleware/authorizeAdmin.js'; // Middleware de autenticación
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  getRecipesByCategory,
  getRecipesByDifficulty,
  searchRecipesByName,
  searchRecipesByIngredients,
  getRecipesByPage,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  getUserRecipes,
  getUserRecipesByName,
  getUserRecipesByIngredients,
  getRecipeByIdForAdmin,
} from '../controllers/recipeController.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get('/search', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /search:", req.user);
  next();
}, searchRecipesByName); // Buscar recetas por nombre (fuzzy search)

router.post('/searchByIngredients', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /searchByIngredients:", req.user);
  next();
}, searchRecipesByIngredients); // Buscar recetas por lista de ingredientes

router.get('/category/:category', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /category/:category:", req.user);
  next();
}, getRecipesByCategory); // Obtener recetas por categoría

router.get('/difficulty/:difficulty', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /difficulty/:difficulty:", req.user);
  next();
}, getRecipesByDifficulty); // Obtener recetas por dificultad

router.get('/page', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /page:", req.user);
  next();
}, getRecipesByPage); // Obtener recetas con paginación

router.get('/:recipeId', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /:recipeId:", req.user);
  next();
}, getRecipeById); // Obtener una receta por ID

router.get('/', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /:", req.user);
  next();
}, getAllRecipes); // Obtener todas las recetas con filtros opcionales

router.post('/create', authMiddleware, upload.single('image'), (req, res, next) => {
  console.log("Usuario autenticado en /create:", req.user);
  next();
}, createRecipe); // Crear una receta con subida de imagen

router.put('/:recipeId', authMiddleware, upload.single('image'), (req, res, next) => {
  console.log("Usuario autenticado en /:recipeId (PUT):", req.user);
  next();
}, updateRecipe);

router.delete('/:id', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /:id (DELETE):", req.user);
  next();
}, deleteRecipe); // Eliminar receta por ID

router.put('/like/:recipeId', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /like/:recipeId:", req.user);
  next();
}, toggleLikeRecipe); // Dar o quitar "me gusta" a una receta

// Rutas de usuario autenticado
router.get('/user/:userId', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /user/:userId:", req.user);
  next();
}, getUserRecipes); 

// Obtener recetas de un usuario autenticado

router.get('/user/:userId/search', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /user/:userId/search:", req.user);
  next();
}, getUserRecipesByName); 

// Búsqueda por nombre del usuario

router.post('/user/:userId/searchByIngredients', authMiddleware, (req, res, next) => {
  console.log("Usuario autenticado en /user/:userId/searchByIngredients:", req.user);
  next();
}, getUserRecipesByIngredients); // Búsqueda por ingredientes del usuario

router.get('/admin/searchById', authMiddleware, authorizeAdmin, getRecipeByIdForAdmin);

export default router;
