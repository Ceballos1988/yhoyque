import express from 'express';
import { addComment, getCommentsByRecipe, deleteComment } from '../controllers/commentsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware de validación
const validateAddComment = (req, res, next) => {
  const { content } = req.body;
  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ message: "El contenido del comentario es obligatorio" });
  }
  next();
};



/**
 * Ruta para agregar un comentario a una receta específica.
 * @name POST /recipe/:recipeId
 * @access Privado - Requiere autenticación
 * @param {string} recipeId - ID de la receta a la que se agregará el comentario.
 * @param {Express.Request} req - La solicitud del cliente con el contenido del comentario.
 * @param {Express.Response} res - La respuesta del servidor con el estado de la creación del comentario.
 */
router.post('/recipe/:recipeId', authMiddleware, validateAddComment, addComment);

/**
 * Ruta para obtener todos los comentarios de una receta.
 * @name GET /recipe/:recipeId
 * @access Público o Privado dependiendo de los requerimientos
 * @param {string} recipeId - ID de la receta cuyos comentarios se van a obtener.
 * @param {Express.Request} req - La solicitud del cliente.
 * @param {Express.Response} res - La respuesta del servidor con la lista de comentarios de la receta.
 */
router.get('/recipe/:recipeId', getCommentsByRecipe); // O agregar authMiddleware si lo necesitas

/**
 * Ruta para eliminar un comentario específico.
 * @name DELETE /:commentId
 * @access Privado - Requiere autenticación
 * @param {string} commentId - ID del comentario que se va a eliminar.
 * @param {Express.Request} req - La solicitud del cliente.
 * @param {Express.Response} res - La respuesta del servidor confirmando la eliminación.
 */
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
