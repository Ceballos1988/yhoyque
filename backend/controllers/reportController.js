// reportController.js

import Report from "../models/Report.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js"; // Asegúrate de que la ruta sea correcta
import User from "../models/User.js";
import logger from "../utils/logger.js"; // Importar Winston


/**
 * Crear un nuevo reporte
 */
export const createReport = async (req, res) => {
  try {
    const { recipeId, commentId, reason, details } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ message: "El motivo del reporte es obligatorio." });
    }

    let referencedItem = null;

    // Verificar si es un reporte de receta o comentario
    if (recipeId) {
      referencedItem = await Recipe.findById(recipeId);
      if (!referencedItem) {
        return res.status(404).json({ message: "Receta no encontrada." });
      }
    } else if (commentId) {
      referencedItem = await Comment.findById(commentId).populate("recipeId");
      if (!referencedItem) {
        return res.status(404).json({ message: "Comentario no encontrado." });
      }
      // Asignar el ID de la receta del comentario al reporte
      if (referencedItem.recipeId) {
        req.body.recipeId = referencedItem.recipeId._id;
      }
    } else {
      return res.status(400).json({
        message:
          "Se debe especificar una receta o un comentario para reportar.",
      });
    }

    // Crear el reporte
    const newReport = new Report({
      recipeId: req.body.recipeId,
      commentId,
      reason,
      details,
      commentContent: commentId ? referencedItem.content : null, // Almacenar el contenido del comentario
      reportedBy: req.user.id,
    });

    await newReport.save();
    res
      .status(201)
      .json({ message: "Reporte creado con éxito.", report: newReport });
  } catch (error) {
    logger.error(`Error al crear el reporte: ${error.message}`);
    res.status(500).json({ message: "Error al crear el reporte." });
  }
};

/**
 * Obtener todos los reportes (con paginación y filtros)
 */
export const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      recipeId,
      sort = "dateDesc",
    } = req.query;

    // Convertir a números enteros válidos
    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.max(parseInt(limit, 10), 1);

    // Definir opciones de ordenamiento
    const sortOptions = {
      dateDesc: { createdAt: -1 }, // 🔹 Más reciente primero
      dateAsc: { createdAt: 1 }, // 🔹 Más antiguo primero
    };

    const order = sortOptions[sort] || sortOptions.dateDesc; // Usa el orden seleccionado o el predeterminado

    // Filtros iniciales
    const filter = {};
    if (status && status !== "Todos") filter.status = status;
    if (recipeId) filter.recipeId = recipeId;

    console.log("Aplicando filtros:", filter, "Ordenando por:", order);

    // Obtener el total de reportes con ese filtro
    const totalReports = await Report.countDocuments(filter);

    // Obtener reportes con paginación
    const reports = await Report.find(filter)
      .sort(order) // 🔹 Se aplica el orden dinámicamente según la selección del usuario
      .populate("recipeId", "title _id")
      .populate("reportedBy", "username")
      .populate("resolvedBy", "username")
      .select(
        "recipeId commentId commentContent reason status reportedBy resolvedBy details createdAt"
      )
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    // Verificar si la receta o comentario están eliminados
    for (const report of reports) {
      report.recipeDeleted = report.recipeId
        ? !(await Recipe.exists({ _id: report.recipeId._id }))
        : true;
      report.commentDeleted = report.commentId
        ? !(await Comment.exists({ _id: report.commentId }))
        : false;
    }

    // Calcular total de páginas
    const totalPages = Math.ceil(totalReports / limitNumber);

    // Devolver resultados con paginación
    res
      .status(200)
      .json({ reports, totalReports, totalPages, currentPage: pageNumber });
  } catch (error) {
    logger.error(`Error al obtener los reportes: ${error.message}`);
    res.status(500).json({ message: "Error al obtener los reportes." });
  }
};

/**
 * Actualizar el estado de un reporte
 */
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionDetails } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "El estado es obligatorio para actualizar el reporte.",
      });
    }

    console.log("Actualizando reporte con ID:", id);
    console.log("Datos recibidos:", { status, resolutionDetails });

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Reporte no encontrado." });
    }

    // Actualizar los campos del reporte
    report.status = status;
    report.resolutionDetails = resolutionDetails || report.resolutionDetails;
    report.resolvedBy = req.user.id;

    await report.save();

    // Buscar el usuario que resolvió el reporte
    const resolvedByUser = await User.findById(req.user.id).select("username");
    console.log("Usuario que resolvió el reporte:", resolvedByUser);

    res.status(200).json({
      message: "Reporte actualizado con éxito.",
      report: {
        ...report.toObject(),
        resolvedBy: resolvedByUser,
      },
    });
  } catch (error) {
    logger.error(`Error en updateReport: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar el reporte." });
  }
};

/**
 * Eliminar un reporte
 */
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ message: "Reporte no encontrado." });
    }

    res.status(200).json({ message: "Reporte eliminado con éxito." });
  } catch (error) {
    logger.error(`Error al eliminar el reporte: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar el reporte." });
  }
};

/**
 * Obtener motivos de reportes agrupados por tipo
 */
export const getReportMotives = async (req, res) => {
  try {
    // Agrupar motivos de reportes por recetas
    const recipeMotives = await Report.aggregate([
      { $match: { recipeId: { $exists: true } } }, // Solo reportes de recetas
      { $group: { _id: "$reason", count: { $sum: 1 } } }, // Agrupar por motivo
      { $project: { motive: "$_id", count: 1, _id: 0 } }, // Formatear la respuesta
    ]);

    // Agrupar motivos de reportes por comentarios
    const commentMotives = await Report.aggregate([
      { $match: { commentId: { $exists: true } } }, // Solo reportes de comentarios
      { $group: { _id: "$reason", count: { $sum: 1 } } }, // Agrupar por motivo
      { $project: { motive: "$_id", count: 1, _id: 0 } }, // Formatear la respuesta
    ]);

    res.status(200).json({ recipeMotives, commentMotives });
  } catch (error) {
    logger.error(`Error al obtener motivos de reportes: ${error.message}`);
    res.status(500).json({ message: "Error al obtener motivos de reportes." });
  }
};
