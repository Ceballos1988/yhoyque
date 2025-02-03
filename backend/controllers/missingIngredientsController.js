import ShoppingList from "../models/ShoppingList.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js"; // Importar Winston

// Validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Agregar ingredientes faltantes a una lista
export const addMissingIngredients = async (req, res) => {
  const { listId, categoryId } = req.params;
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: "Se requiere una lista de ingredientes válida." });
  }

  try {
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ message: "ID de lista no válido." });
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Lista de compras no encontrada." });
    }

    let category;
    if (categoryId === "new") {
      const { newCategoryName } = req.body;
      if (!newCategoryName || typeof newCategoryName !== "string") {
        return res.status(400).json({ message: "El nombre de la nueva categoría es obligatorio." });
      }
      category = { title: newCategoryName, items: [] };
      list.categories.push(category);
    } else {
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({ message: "ID de categoría no válido." });
      }
      category = list.categories.id(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada." });
      }
    }

    // Agregar ingredientes a la categoría
    ingredients.forEach((ingredient) => {
      if (!ingredient.name || typeof ingredient.name !== "string") {
        throw new Error("El nombre del ingrediente es obligatorio y debe ser un string.");
      }
      category.items.push({
        name: ingredient.name,
        quantity: ingredient.quantity || null,
        unit: ingredient.unit || null,
      });
    });

    await list.save();
    res.status(200).json(category.items); // Devuelve los ítems actualizados
  } catch (error) {
    logger.error(`Error al agregar ingredientes faltantes: ${error.message}`);
    res.status(500).json({ message: "Error al agregar ingredientes faltantes." });
  }
};

// Obtener categorías de una lista específica
export const getCategoriesFromList = async (req, res) => {
  const { listId } = req.params;

  try {
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ message: "ID de lista no válido." });
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Lista de compras no encontrada." });
    }

    res.status(200).json(list.categories || []); // Devuelve las categorías
  } catch (error) {
    logger.error(`Error al obtener categorías: ${error.message}`);
    res.status(500).json({ message: "Error al obtener categorías." });
  }
};

// Crear una nueva categoría para ingredientes faltantes
export const addNewCategoryToMissingIngredients = async (req, res) => {
  const { listId } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "El título de la categoría es obligatorio." });
  }

  try {
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ message: "ID de lista no válido." });
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Lista de compras no encontrada." });
    }

    // Crear la nueva categoría
    const newCategory = { title, items: [] };
    list.categories.push(newCategory);

    // Guardar los cambios
    await list.save();

    // Devolver la nueva categoría creada
    res.status(201).json(list.categories[list.categories.length - 1]);
  } catch (error) {
    logger.error(`Error al crear nueva categoría: ${error.message}`);
    res.status(500).json({ message: "Error al crear nueva categoría." });
  }
};
