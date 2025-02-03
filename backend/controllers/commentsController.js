// controllers/commentController.js

import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import logger from "../utils/logger.js"; // Importar Winston


/**
 * Añadir un comentario a una receta.
 * Verifica si la receta y el usuario existen antes de crear el comentario.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void}
 */
export const addComment = async (req, res) => {
  const { recipeId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (process.env.NODE_ENV !== "production") {
    logger.info(`Datos recibidos: ${JSON.stringify({ recipeId, content, userId })}`);
  }
  
  if (!content || content.trim() === "") {
    return res
      .status(400)
      .json({ message: "El contenido del comentario es obligatorio." });
  }

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const newComment = new Comment({
      userId,
      recipeId,
      userName: user.username,
      content: content.trim(),
      createdAt: Date.now(),
    });

    await newComment.save();

    res.status(201).json({
      message: "Comentario agregado con éxito.",
      comment: {
        _id: newComment._id,
        userName: newComment.userName,
        content: newComment.content,
        createdAt: newComment.createdAt,
        userId: newComment.userId,
      },
    });
  } catch (error) {
    logger.error(`Error al agregar comentario: ${error.message}`);
    res.status(500).json({ message: "Error al agregar comentario.", error });
  }
};

/**
 * Obtener los comentarios de una receta, incluyendo los nombres de usuario.
 * Recupera todos los comentarios asociados con una receta.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void}
 */
export const getCommentsByRecipe = async (req, res) => {
  const { recipeId } = req.params;

  try {
    // Obtener los comentarios asociados a la receta directamente
    const comments = await Comment.find({ recipeId }).lean(); // lean() para mejorar la performance

    res.status(200).json({ comments });
  } catch (error) {
    logger.error(`Error al obtener los comentarios: ${error.message}`);
    res.status(500).json({ message: "Error al obtener los comentarios" });
  }
};

/**
 * Eliminar un comentario por su ID.
 * Asegura que el comentario exista antes de intentar eliminarlo.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void}
 */

// Función para eliminar un comentario

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Verificar si el comentario existe
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado." });
    }

    // Eliminar el comentario
    await Comment.findByIdAndDelete(commentId);

    // Actualizar el estado de los reportes relacionados
    await Report.updateMany(
      { commentId },
      {
        $set: {
          status: "resolved",
          commentDeleted: true,
          resolvedBy: req.user.id, // Adjunta el administrador actual
        },
      }
    );

    // Buscar el administrador que resolvió el reporte
    const resolvedByUser = await User.findById(req.user.id).select("username");

    res.status(200).json({
      message: "Comentario eliminado con éxito.",
      resolvedBy: resolvedByUser, // Devuelve información del administrador
    });
  } catch (error) {
    logger.error(`Error al eliminar el comentario: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar el comentario." });
  }
};
