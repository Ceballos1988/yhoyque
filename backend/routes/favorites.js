import express from 'express';
import { addFavorite, removeFavorite, getUserFavorites, searchFavoritesByName, searchFavoritesByIngredients } from '../controllers/favoritesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Agregar receta a favoritos
router.post('/', authMiddleware, addFavorite);

// Eliminar receta de favoritos
router.delete('/:recipeId', authMiddleware, removeFavorite);

// Obtener todas las recetas favoritas del usuario
router.get('/', authMiddleware, getUserFavorites);

// Buscar recetas favoritas por nombre
router.get('/search', authMiddleware, searchFavoritesByName);

// Buscar recetas favoritas por ingredientes
router.post('/searchByIngredients', authMiddleware, searchFavoritesByIngredients);

export default router;
