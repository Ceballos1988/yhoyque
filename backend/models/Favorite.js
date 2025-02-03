import mongoose from 'mongoose';

/**
 * Esquema de favoritos para almacenar las recetas marcadas como favoritas por los usuarios.
 * Cada favorito está asociado a un usuario y a una receta específicos.
 * @typedef {Object} Favorite
 * @property {ObjectId} userId - ID del usuario que ha marcado la receta como favorita, referenciado en el modelo 'User'.
 * @property {ObjectId} recipeId - ID de la receta marcada como favorita, referenciado en el modelo 'Recipe'.
 * @property {Date} createdAt - Fecha en la que se agregó la receta a favoritos, se establece por defecto a la fecha actual.
 */
const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo de usuario
    required: true,
  }, // ID del usuario que marca como favorita la receta
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe', // Referencia al modelo de receta
    required: true,
  }, // ID de la receta marcada como favorita
  createdAt: {
    type: Date,
    default: Date.now,
  }, // Fecha de creación del favorito, por defecto la fecha actual
});

export default mongoose.model('Favorite', favoriteSchema);
