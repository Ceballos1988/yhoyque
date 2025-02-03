// models/Recipe.js
import mongoose from 'mongoose';

/**
 * Esquema para almacenar la información de las recetas.
 * Cada receta incluye datos sobre el título, el tiempo de preparación, la dificultad, el tipo de dieta, y más.
 * @typedef {Object} Recipe
 * @property {string} title - Título de la receta, requerido.
 * @property {number} servings - Número de porciones que rinde la receta.
 * @property {number} prepTime - Tiempo de preparación en minutos.
 * @property {string} difficulty - Nivel de dificultad (fácil, medio, difícil).
 * @property {string} courseType - Tipo de plato (entrada, plato principal, postre).
 * @property {string} dietType - Tipo de dieta (vegetariano, vegano, libre de gluten, etc.), por defecto es "None".
 * @property {Array<Object>} ingredients - Lista de ingredientes, cada uno con nombre, cantidad y unidad, todos requeridos.
 * @property {Array<string>} steps - Pasos de preparación de la receta, requerido.
 * @property {string} image - URL de la imagen de la receta.
 * @property {Array<ObjectId>} likes - IDs de usuarios que han dado "me gusta" a la receta.
 * @property {ObjectId} userId - ID del usuario que creó la receta, requerido.
 * @property {string} userName - Nombre de usuario del creador de la receta, requerido.
 * @property {number} rating - Calificación de la receta basada en la cantidad de "me gusta", por defecto 0.
 * @property {Date} createdAt - Fecha de creación de la receta.
 * @property {Date} updatedAt - Fecha de la última actualización de la receta.
 */
const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Título de la receta
    servings: { type: Number }, // Número de porciones
    prepTime: { type: Number }, // Tiempo de preparación en minutos
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'], // Niveles de dificultad permitidos
      required: true,
    }, // Dificultad de la receta
    courseType: {
      type: String,
      enum: ['Appetizer', 'Main Course', 'Dessert', 'Side Dish', 'Pastry'], // Agrega los nuevos tipos
      required: true,
    }, // Tipo de plato
    dietType: {
      type: [String], // Cambiado a un array de strings
      enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'None'],
      default: ['None'], // Cambiado a un array con valor por defecto
    }, // Tipo de dieta
    ingredients: [
      {
        name: { type: String, required: true }, // Nombre del ingrediente
        quantity: { type: Number, required: true }, // Cantidad del ingrediente
        unit: { type: String, required: true }, // Unidad de medida
      },
    ], // Lista de ingredientes
    steps: { type: [String], required: true }, // Pasos de la receta
    image: { type: String, default: "/img/recipe-null.png" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Usuarios que dieron "me gusta"
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID del creador
    userName: { type: String, required: true }, // Nombre del creador
    rating: { type: Number, default: 0 }, // Calificación basada en "me gusta"
  },
  { timestamps: true } // Timestamps para fecha de creación y actualización
);

export default mongoose.model('Recipe', recipeSchema);
