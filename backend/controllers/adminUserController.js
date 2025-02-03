//adminUserController
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Report from "../models/Report.js";
import moment from "moment"; // Para formatear fechas
import Comment from "../models/Comment.js";
import logger from "../utils/logger.js"; // Importar Winston

// Obtener todos los usuarios (función para listar usuarios)
export const getAllUsers = async (req, res) => {
  try {
    // Busca todos los usuarios, excluyendo la contraseña
    const users = await User.find({}, "-password").lean();
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

// Actualizar un usuario por su ID (función para editar)
export const updateUser = async (req, res) => {
  const { userId } = req.params; // ID del usuario a actualizar
  const { firstName, lastName, role } = req.body; // Campos que se pueden actualizar

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, role }, // Datos que se actualizan
      { new: true, runValidators: true } // Devuelve el documento actualizado
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Error al actualizar el usuario: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar el usuario." });
  }
};

// Eliminar un usuario por su ID (función para eliminar)
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Verificar si el usuario existe
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 2️⃣ Eliminar todas las recetas creadas por el usuario
    const deletedRecipes = await Recipe.deleteMany({ userId });
    logger.info(`Recetas eliminadas: ${deletedRecipes.deletedCount}`);

    // 3️⃣ Eliminar todos los comentarios hechos por el usuario
    const deletedComments = await Comment.deleteMany({ userId });
    logger.info(`Comentarios eliminados: ${deletedComments.deletedCount}`);

    res
      .status(200)
      .json({
        message: "Usuario, recetas y comentarios eliminados correctamente.",
      });
  } catch (error) {
    logger.error(`Error al eliminar el usuario y sus datos: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al eliminar el usuario y sus datos." });
  }
};

export const getUsersWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const searchQuery = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } }, // Búsqueda parcial en username
            { email: { $regex: search, $options: "i" } }, // Búsqueda parcial en email
          ],
        }
      : {}; // Si no hay búsqueda, devuelve todos los usuarios

    const totalUsers = await User.countDocuments(searchQuery); // Contar usuarios filtrados
    const users = await User.find(searchQuery, "-password") // Excluir contraseña
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.status(200).json({
      users,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

/**
 * Obtener estadísticas generales para el administrador
 */
export const getAdminStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalReports = await Report.countDocuments();

    const totalLikesData = await Recipe.aggregate([
      { $project: { likes: { $size: "$likes" } } }, // Cambia `likeCount` a `likes`
      { $group: { _id: null, total: { $sum: "$likes" } } }, // Suma todos los likes
    ]);

    const totalLikes = totalLikesData[0]?.total || 0;

    res.json({
      totalUsers,
      totalRecipes,
      totalReports,
      totalLikes,
    });
  } catch (error) {
    logger.error(`Error al obtener estadísticas: ${error.message}`);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

// Obtener las recetas más populares (por número de likes)
export const getTopRecipesByLikes = async (req, res) => {
  try {
    const popularRecipes = await Recipe.aggregate([
      {
        $project: {
          title: 1,
          image: 1,
          likes: { $size: "$likes" }, // Cambia `likesCount` a `likes` para que el frontend lo entienda
        },
      },
      {
        $sort: { likes: -1 }, // Ordena por la cantidad de likes en orden descendente
      },
      {
        $limit: 5, // Devuelve solo las 5 recetas más populares
      },
    ]);

    res.status(200).json(popularRecipes);
  } catch (error) {
    logger.error(`Error al obtener recetas más populares: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener recetas más populares." });
  }
};

// Obtener las recetas más reportadas
export const getTopRecipesByReports = async (req, res) => {
  try {
    const recipes = await Recipe.find({})
      .select("_id title reportCount image") // Incluye el campo `image`
      .sort({ reportCount: -1 }) // Ordenar por reportes en orden descendente
      .limit(5); // Limitar a las 5 más reportadas

    res.status(200).json(recipes);
  } catch (error) {
    logger.error(`Error al obtener recetas más reportadas: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener recetas más reportadas." });
  }
};

// Obtener usuarios y recetas por mes/año
export const getUsersAndRecipesByMonth = async (req, res) => {
  try {
    const { year } = req.query;

    // Convertir el año a entero
    const yearNumber = parseInt(year, 10);

    // Definir el rango de fechas
    const startDate = new Date(`${yearNumber}-01-01`);
    const endDate = new Date(`${yearNumber}-12-31T23:59:59.999Z`);

    // Obtener usuarios por mes
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } }, // Agrupa solo por mes
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } }, // Ordena por mes
    ]);

    // Obtener recetas por mes
    const recipesByMonth = await Recipe.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Ordena por año y mes
    ]);

    // Mapear los datos para simplificar el formato
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const mappedUsersByMonth = usersByMonth.map((item) => ({
      year: item._id.year,
      month: months[item._id.month - 1],
      total: item.total,
    }));
    const mappedRecipesByMonth = recipesByMonth.map((item) => ({
      year: item._id.year,
      month: months[item._id.month - 1],
      total: item.total,
    }));

    // Enviar los datos procesados
    res.status(200).json({
      usersByMonth: mappedUsersByMonth,
      recipesByMonth: mappedRecipesByMonth,
    });
  } catch (error) {
    logger.error(`Error al obtener usuarios y recetas por mes/año: ${error.message}`);
    res.status(500).json({ message: "Error al obtener datos." });
  }
};

// Obtener distribución de recetas por categoría
export const getRecipeDistribution = async (req, res) => {
  try {
    const recipeDistribution = await Recipe.aggregate([
      {
        $group: {
          _id: "$category", // Cambia "category" si tu campo tiene otro nombre
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } }, // Opcional: Ordenar por cantidad
    ]);

    res.status(200).json(recipeDistribution);
  } catch (error) {
    logger.error(`Error al obtener la distribución de recetas por categoría: ${error.message}`);
    res.status(500).json({ message: "Error al obtener distribución." });
  }
};

export const getRecipeCategoryDistribution = async (req, res) => {
  try {
    const categoryDistribution = await Recipe.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$courseType", "Sin Categoría"] }, // Si `courseType` es null, asigna "Sin Categoría"
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } }, // Ordenar por la cantidad de recetas
    ]);

    res.status(200).json(
      categoryDistribution.map((item) => ({
        courseType: item._id,
        total: item.total,
      }))
    );
  } catch (error) {
    logger.error(`Error al obtener la distribución de categorías: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener la distribución de categorías." });
  }
};

/**
 * Obtener la distribución de recetas por tipo de dieta
 */
export const getRecipeDietTypeDistribution = async (req, res) => {
  try {
    const dietTypeDistribution = await Recipe.aggregate([
      {
        $unwind: "$dietType", // Descompone los arrays de dietType en múltiples documentos
      },
      {
        $group: {
          _id: "$dietType", // Agrupar por tipo de dieta
          total: { $sum: 1 }, // Contar el número de recetas por tipo de dieta
        },
      },
      { $sort: { total: -1 } }, // Ordenar por cantidad descendente
    ]);

    res.status(200).json(
      dietTypeDistribution.map((item) => ({
        dietType: item._id,
        total: item.total,
      }))
    );
  } catch (error) {
    logger.error(`Error al obtener la distribución por tipo de dieta: ${error.message}`);
    res.status(500).json({
      message: "Error al obtener la distribución por tipo de dieta.",
    });
  }
};
