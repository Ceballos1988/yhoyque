import express from "express";
import {
  createShoppingList,
  getShoppingLists,
  updateShoppingList,
  deleteShoppingList,
  addCategoryToList,
  addItemToCategory,
  toggleItemPurchased,
  deleteItemFromCategory,
  editCategory,
  deleteCategory,
} from "../controllers/shoppingListController.js"; // Asegúrate de tener estas funciones
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD para listas de compras
router.post("/", authMiddleware, createShoppingList); // Crear lista
router.get("/", authMiddleware, getShoppingLists); // Obtener todas las listas
router.put("/:id", authMiddleware, updateShoppingList); // Actualizar lista
router.delete("/:id", authMiddleware, deleteShoppingList); // Eliminar lista

// Categorías en listas de compras
router.post("/:listId/categories", authMiddleware, addCategoryToList); // Agregar categoría a una lista

// Ítems dentro de una categoría
router.post(
  "/:listId/categories/:categoryId/items",
  authMiddleware,
  addItemToCategory
);
// Agregar ítem a una categoría
router.patch("/:listId/categories/:categoryId", authMiddleware, editCategory);
// Alternar estado comprado de un ítem
router.delete(
  "/:listId/categories/:categoryId/items/:itemId",
  authMiddleware,
  deleteItemFromCategory
); // Eliminar ítem de una categoría
router.patch(
  "/:listId/categories/:categoryId/items/:itemId",
  authMiddleware,
  toggleItemPurchased
);

// Eliminar categoría
router.delete("/:listId/categories/:categoryId", deleteCategory);

export default router;
