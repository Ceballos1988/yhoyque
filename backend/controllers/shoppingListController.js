import ShoppingList from "../models/ShoppingList.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js"; // Importar Winston

// Crear una nueva lista de compras
export const createShoppingList = async (req, res) => {
  const { name, categories } = req.body; // Extraer categorías opcionales
  const userId = req.user.id; // Asegúrate de usar `req.user.id`

  try {
    // Verificar si el usuario ya tiene 3 listas
    const existingLists = await ShoppingList.find({ userId });
    if (existingLists.length >= 3) {
      return res.status(400).json({
        message: "Solo puedes tener un máximo de 3 listas de compras.",
      });
    }

    // Crear una nueva lista de compras
    const newShoppingList = new ShoppingList({ userId, name, categories });
    await newShoppingList.save();

    res.status(201).json(newShoppingList);
  } catch (error) {
    logger.error(`Error en createShoppingList: ${error.message}`);
    res.status(500).json({ message: "Error al crear la lista de compras." });
  }
};

// Obtener todas las listas de compras del usuario actual
export const getShoppingLists = async (req, res) => {
  const userId = req.user.id;

  try {
    const shoppingLists = await ShoppingList.find({ userId });
    res.status(200).json(shoppingLists);
  } catch (error) {
    logger.error(`Error al obtener las listas de compras: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener las listas de compras." });
  }
};

// Actualizar una lista de compras
export const updateShoppingList = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "El nombre no puede estar vacío." });
  }

  try {
    const updatedList = await ShoppingList.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      return res
        .status(404)
        .json({ message: "Lista de compras no encontrada." });
    }

    res.status(200).json(updatedList);
  } catch (error) {
    logger.error(`Error al actualizar la lista: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar la lista." });
  }
};

// Eliminar una lista de compras
export const deleteShoppingList = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedList = await ShoppingList.findByIdAndDelete(id);

    if (!deletedList) {
      return res
        .status(404)
        .json({ message: "Lista de compras no encontrada." });
    }

    res.status(200).json({ message: "Lista de compras eliminada con éxito." });
  } catch (error) {
    logger.error(`Error al eliminar la lista de compras: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar la lista de compras." });
  }
};

// Agregar una categoría a una lista
export const addCategoryToList = async (req, res) => {
  const { listId } = req.params;
  const { title } = req.body;

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    // Agregar la categoría a la lista
    list.categories.push({ title, items: [] });
    await list.save();

    res.status(201).json(list.categories); // Devolver todas las categorías actualizadas
  } catch (error) {
    logger.error(`Error al agregar categoría: ${error.message}`);
    res.status(500).json({ message: "Error al agregar categoría." });
  }
};

// Agregar un ítem a una categoría
export const addItemToCategory = async (req, res) => {
  const { listId, categoryId } = req.params;
  const { name, quantity, unit } = req.body;

  // Validación del nombre del ítem
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "El nombre del ítem es obligatorio." });
  }

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    // Buscar la categoría por ID (es obligatorio que exista)
    const category = list.categories.id(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    // Agregar el ítem a la categoría
    category.items.push({ name, quantity, unit });
    await list.save();

    res.status(201).json(category.items); // Devolver los ítems actualizados
  } catch (error) {
    logger.error(`Error al agregar ítem a la categoría: ${error.message}`);
    res.status(500).json({ message: "Error al agregar ítem." });
  }
};

// Eliminar un ítem de una categoría
export const deleteItemFromCategory = async (req, res) => {
  const { listId, categoryId, itemId } = req.params;

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    const category = list.categories.id(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    // Eliminar el ítem de la categoría
    category.items = category.items.filter(
      (item) => item._id.toString() !== itemId
    );
    await list.save();

    res.status(200).json(category.items); // Devolver todos los ítems restantes
  } catch (error) {
    logger.error(`Error al eliminar ítem: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar ítem." });
  }
};

// Alternar el estado de comprado de un ítem
export const toggleItemPurchased = async (req, res) => {
  const { listId, categoryId, itemId } = req.params;

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    const category = list.categories.id(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    const item = category.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Ítem no encontrado." });
    }

    // Alternar el estado de comprado
    item.isPurchased = !item.isPurchased;
    await list.save();

    res.status(200).json(item); // Devolver el ítem actualizado
  } catch (error) {
    logger.error(`Error al alternar estado de comprado: ${error.message}`);
    res.status(500).json({ message: "Error al alternar estado de comprado." });
  }
};

// Editar una categoría
export const editCategory = async (req, res) => {
  const { listId, categoryId } = req.params;
  const { title } = req.body;

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    const category = list.categories.id(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    // Actualizar el título de la categoría
    category.title = title || category.title; // Si no se proporciona un nuevo título, mantener el actual
    await list.save();

    res.status(200).json(category); // Devolver la categoría actualizada
  } catch (error) {
    logger.error(`Error al editar categoría: ${error.message}`);
    res.status(500).json({ message: "Error al editar categoría." });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
  const { listId, categoryId } = req.params;

  try {
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Lista no encontrada." });
    }

    // Eliminar la categoría
    list.categories = list.categories.filter(
      (category) => category._id.toString() !== categoryId
    );
    await list.save();

    res.status(200).json(list.categories); // Devolver las categorías restantes
  } catch (error) {
    logger.error(`Error al eliminar categoría: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar categoría." });
  }
};
