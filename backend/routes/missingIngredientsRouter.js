import express from "express";
import {
  addMissingIngredients,
  getCategoriesFromList,
  addNewCategoryToMissingIngredients,
} from "../controllers/missingIngredientsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas específicas para ingredientes faltantes
router.get("/:listId/categories", authMiddleware, getCategoriesFromList); // Obtener categorías de una lista
router.post("/:listId/categories/:categoryId/items", authMiddleware, addMissingIngredients); // Agregar ingredientes faltantes
router.post("/:listId/categories", authMiddleware, addNewCategoryToMissingIngredients); // Crear nueva categoría para ingredientes faltantes


export default router;
