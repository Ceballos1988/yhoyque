import mongoose from 'mongoose';

/**
 * Esquema de comentario para almacenar los comentarios realizados en las recetas.
 * Cada comentario está asociado a un usuario y a una receta específicos.
 * @typedef {Object} Comment
 * @property {ObjectId} userId - ID del usuario que realiza el comentario, referenciado en el modelo 'User'.
 * @property {ObjectId} recipeId - ID de la receta sobre la que se realiza el comentario, referenciado en el modelo 'Recipe'.
 * @property {string} userName - Nombre del usuario que realiza el comentario.
 * @property {string} content - Contenido del comentario.
 * @property {Date} createdAt - Fecha y hora en la que se creó el comentario, se establece por defecto a la fecha actual.
 */
const commentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // ID del usuario que realiza el comentario
  recipeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe', 
    required: true 
  }, // ID de la receta sobre la que se comenta
  userName: { 
    type: String, 
    required: true 
  }, // Nombre del usuario que hizo el comentario
  content: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 1, 
    maxlength: 500 
  }, // Contenido del comentario
  createdAt: { 
    type: Date, 
    default: Date.now 
  } // Fecha de creación del comentario, por defecto la fecha actual
});

export default mongoose.model('Comment', commentSchema);
