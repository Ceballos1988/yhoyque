// controllers/recipeController.js

import Recipe from "../models/Recipe.js";
import { uploadImage } from "../cloudinaryConfig.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Report from "../models/Report.js";
import logger from "../utils/logger.js"; // Importar Winston

// Crear una receta.

export const createRecipe = async (req, res) => {
  try {
    const {
      title,
      servings,
      prepTime,
      difficulty,
      courseType,
      dietType,
      ingredients,
      steps,
    } = req.body;

    // Verificar si el usuario existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Manejar la imagen de la receta (subir a Cloudinary o imagen por defecto)
    let imageUrl =
      req.body.image && req.body.image.trim()
        ? req.body.image
        : "/img/recipe-null.png"; // Imagen por defecto corregida

    if (req.file) {
      const result = await uploadImage(req.file.buffer); // Subir la imagen a Cloudinary
      imageUrl = result.secure_url;
    }

    // Crear el objeto de receta incluyendo solo los campos opcionales si están presentes
    const newRecipe = new Recipe({
      title,
      ...(servings ? { servings } : {}),
      ...(prepTime ? { prepTime } : {}),
      difficulty,
      courseType,
      dietType,
      ingredients: ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        customUnit: ingredient.unit === "otra" ? ingredient.customUnit : null,
      })),
      steps,
      image: imageUrl,
      userId: user._id,
      userName: user.username,
    });

    // Guardar la nueva receta en la base de datos
    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (error) {
    logger.error(`Error al crear la receta: ${error.message}`);
    res.status(500).json({ message: "Error al crear la receta", error });
  }
};

// Obtener todas las recetas con filtros, ordenamiento y paginación
export const getAllRecipes = async (req, res) => {
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    sortOption,
    page = 1,
    limit = 10,
    createdBy,
    savedRecipesOnly,
  } = req.query;

  try {
    const filterConditions = {};

    if (category) filterConditions.courseType = category;
    if (difficulty) filterConditions.difficulty = difficulty;
    if (dietType) filterConditions.dietType = dietType;
    if (createdBy) filterConditions.userId = createdBy;

    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt) {
        filterConditions.prepTime = { $lt: parsedPrepTime.$lt };
      } else if (parsedPrepTime.$gte && parsedPrepTime.$lte) {
        filterConditions.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      } else if (parsedPrepTime.$gt) {
        filterConditions.prepTime = { $gt: parsedPrepTime.$gt };
      }
    }

    if (rating) {
      filterConditions.likes = { $size: { $gte: parseInt(rating, 10) } };
    }

    // Manejar recetas favoritas
    if (savedRecipesOnly === "true" && req.user) {
      const favoriteRecipes = await Favorite.find({
        userId: req.user.id,
      }).select("recipeId");
      const favoriteRecipeIds = favoriteRecipes.map((fav) => fav.recipeId);

      if (favoriteRecipeIds.length > 0) {
        filterConditions._id = { $in: favoriteRecipeIds };
      } else {
        return res.json({ recipes: [], totalCount: 0 });
      }
    }

    const pipeline = [
      { $match: filterConditions },
      {
        $addFields: {
          rating: { $size: "$likes" },
        },
      },
    ];

    if (sortOption) {
      const sortStage = {};
      if (sortOption === "prepTimeAsc") sortStage.prepTime = 1;
      if (sortOption === "prepTimeDesc") sortStage.prepTime = -1;
      if (sortOption === "ratingAsc") sortStage.rating = 1;
      if (sortOption === "ratingDesc") sortStage.rating = -1;
      if (sortOption === "createdAtAsc") sortStage.createdAt = 1;
      if (sortOption === "createdAtDesc") sortStage.createdAt = -1;

      pipeline.push({ $sort: sortStage });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const recipes = await Recipe.aggregate(pipeline);
    const totalCount = await Recipe.countDocuments(filterConditions);

    res.json({ recipes, totalCount });
  } catch (error) {
    logger.error(`Error al obtener recetas: ${error.message}`);
    res.status(500).json({ message: "Error al obtener recetas", error });
  }
};

// Obtener recetas del usuario autenticado con filtros
export const getUserRecipes = async (req, res) => {
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    sortOption,
    page = 1,
    limit = 10,
  } = req.query;

  const userId = req.params.userId;

  // Validar si el userId existe
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "El ID del usuario no es válido" });
  }

  try {
    const filterConditions = { userId: new mongoose.Types.ObjectId(userId) };

    // Continuar con los filtros
    if (category) filterConditions.courseType = category;
    if (difficulty) filterConditions.difficulty = difficulty;
    if (dietType) filterConditions.dietType = dietType;

    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt)
        filterConditions.prepTime = { $lt: parsedPrepTime.$lt };
      else if (parsedPrepTime.$gte && parsedPrepTime.$lte)
        filterConditions.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      else if (parsedPrepTime.$gt)
        filterConditions.prepTime = { $gt: parsedPrepTime.$gt };
    }

    if (rating) filterConditions.likes = { $size: { $gte: parseInt(rating) } };

    // Construir pipeline de agregación
    const pipeline = [
      { $match: filterConditions },
      { $addFields: { rating: { $size: "$likes" } } },
    ];

    // Ordenamiento
    if (sortOption) {
      const sortStage = {};
      if (sortOption === "prepTimeAsc") sortStage.prepTime = 1;
      if (sortOption === "prepTimeDesc") sortStage.prepTime = -1;
      if (sortOption === "ratingAsc") sortStage.rating = 1;
      if (sortOption === "ratingDesc") sortStage.rating = -1;
      if (sortOption === "createdAtAsc") sortStage.createdAt = 1;
      if (sortOption === "createdAtDesc") sortStage.createdAt = -1;

      pipeline.push({ $sort: sortStage });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Paginación
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Ejecutar pipeline
    const recipes = await Recipe.aggregate(pipeline);

    // Contar las recetas totales que coinciden con los filtros
    const totalCount = await Recipe.countDocuments(filterConditions);

    res.json({ recipes, totalCount });
  } catch (error) {
    logger.error(`Error al obtener recetas del usuario: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener recetas del usuario", error });
  }
};

// Obtener receta por ID junto con los comentarios
export const getRecipeById = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const comments = await Comment.find({ recipeId });
    res.status(200).json({ recipe, comments });
  } catch (error) {
    logger.error(`Error al obtener la receta: ${error.message}`);
    res.status(500).json({ message: "Error al obtener la receta" });
  }
};

// Obtener recetas por categoría
export const getRecipesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const recipes = await Recipe.find({ courseType: category });

    if (!recipes || recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron recetas para esta categoría" });
    }

    res.json(recipes);
  } catch (error) {
    logger.error(`Error al obtener recetas por categoría: ${error.message}`);
    res.status(500).json({ message: "Error al obtener recetas por categoría" });
  }
};

// Obtener recetas por dificultad
export const getRecipesByDifficulty = async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
    const recipes = await Recipe.find({ difficulty });

    if (!recipes || recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron recetas para esta dificultad" });
    }

    res.json(recipes);
  } catch (error) {
    logger.error(`Error al obtener recetas por dificultad: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener recetas por dificultad" });
  }
};

// Buscar recetas por nombre usando regex para coincidencias parciales e insensibilidad a mayúsculas
export const searchRecipesByName = async (req, res) => {
  const term = req.query.name || ""; // El término de búsqueda
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    sortOption,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    const filterConditions = {};

    if (term.startsWith("@")) {
      // Búsqueda exacta por username (case-insensitive)
      const username = term.slice(1).trim(); // Quitar el "@" del término
      const user = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
      });
      if (!user) {
        // Si no se encuentra el usuario, retornar respuesta indicando que no hay recetas
        return res
          .status(404)
          .json({ message: "No hay recetas para este nombre de usuario." });
      }
      filterConditions.userId = user._id; // Filtro por userId del usuario encontrado
    } else {
      // Búsqueda por nombre de receta
      const keywords = term.split(" ");
      const regexArray = keywords.map((word) => new RegExp(word, "i"));
      filterConditions.$or = regexArray.map((regex) => ({
        title: { $regex: regex },
      }));
    }

    // Añadir filtros adicionales
    if (category) filterConditions.courseType = category;
    if (difficulty) filterConditions.difficulty = difficulty;
    if (dietType) filterConditions.dietType = dietType;

    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt)
        filterConditions.prepTime = { $lt: parsedPrepTime.$lt };
      else if (parsedPrepTime.$gte && parsedPrepTime.$lte) {
        filterConditions.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      } else if (parsedPrepTime.$gt) {
        filterConditions.prepTime = { $gt: parsedPrepTime.$gt };
      }
    }

    if (rating) filterConditions.likes = { $size: { $gte: parseInt(rating) } };

    // Obtener el número total de recetas que coinciden con los filtros
    const totalCount = await Recipe.countDocuments(filterConditions);

    // Construir consulta con filtros, ordenamiento y paginación
    let query = Recipe.find(filterConditions);

    // Aplicar ordenamiento
    if (sortOption) {
      if (sortOption === "prepTimeAsc") query = query.sort({ prepTime: 1 });
      if (sortOption === "prepTimeDesc") query = query.sort({ prepTime: -1 });
      if (sortOption === "ratingAsc") query = query.sort({ likes: 1 });
      if (sortOption === "ratingDesc") query = query.sort({ likes: -1 });
      if (sortOption === "createdAtAsc") query = query.sort({ createdAt: 1 });
      if (sortOption === "createdAtDesc") query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Aplicar paginación
    const recipes = await query
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    // Añadir la cantidad de likes como "rating" a cada receta
    const recipesWithRatings = recipes.map((recipe) => {
      recipe.rating = recipe.likes.length;
      return recipe;
    });

    res.json({ recipes: recipesWithRatings, totalCount });
  } catch (error) {
    logger.error(`Error en searchRecipesByName: ${error.message}`);
    res.status(500).json({ message: "Error en búsqueda", error });
  }
};

// Buscar recetas por ingredientes utilizando regex para coincidencias parciales e insensibilidad a mayúsculas
export const searchRecipesByIngredients = async (req, res) => {
  const ingredients = req.body.ingredients || [];
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    sortOption,
    page = 1,
    limit = 10,
  } = req.body.filters || {};

  try {
    console.log("Received ingredients:", ingredients);
    console.log("Received filters:", req.body.filters);

    // Construir filtros de ingredientes
    const ingredientRegexArray = ingredients.map(
      (ingredient) => new RegExp(ingredient, "i")
    );

    // Crear el pipeline para MongoDB
    const pipeline = [
      { $match: { "ingredients.name": { $in: ingredientRegexArray } } },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: "$ingredients",
                as: "ingredient",
                cond: { $in: ["$$ingredient.name", ingredients] },
              },
            },
          },
        },
      },
    ];

    // Condiciones adicionales de filtro
    const additionalFilters = {};
    if (category) additionalFilters.courseType = category;
    if (difficulty) additionalFilters.difficulty = difficulty;
    if (dietType) additionalFilters.dietType = dietType;

    // Filtro de tiempo de preparación
    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt)
        additionalFilters.prepTime = { $lt: parsedPrepTime.$lt };
      else if (parsedPrepTime.$gte && parsedPrepTime.$lte)
        additionalFilters.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      else if (parsedPrepTime.$gt)
        additionalFilters.prepTime = { $gt: parsedPrepTime.$gt };
    }

    // Filtro de calificación
    if (rating) additionalFilters.likes = { $size: { $gte: parseInt(rating) } };

    // Aplicar filtros adicionales al pipeline si están presentes
    if (Object.keys(additionalFilters).length > 0) {
      pipeline.push({ $match: additionalFilters });
    }

    // Contar el número total de recetas que coinciden con los filtros antes de aplicar la paginación
    const countPipeline = [...pipeline, { $count: "totalCount" }];
    const countResult = await Recipe.aggregate(countPipeline);
    const totalCount = countResult[0] ? countResult[0].totalCount : 0;

    // Configuración de ordenamiento
    const sortStage = {};
    if (sortOption) {
      if (sortOption === "prepTimeAsc") sortStage.prepTime = 1;
      if (sortOption === "prepTimeDesc") sortStage.prepTime = -1;
      if (sortOption === "ratingAsc") sortStage.likes = 1;
      if (sortOption === "ratingDesc") sortStage.likes = -1;
      if (sortOption === "createdAtAsc") sortStage.createdAt = 1;
      if (sortOption === "createdAtDesc") sortStage.createdAt = -1;
    } else {
      sortStage.matchCount = -1; // Ordenar por cantidad de coincidencias de ingredientes por defecto
    }

    pipeline.push({ $sort: sortStage });

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Ejecutar el pipeline
    const recipes = await Recipe.aggregate(pipeline);

    // Enviar la respuesta con las recetas y el total de recetas encontradas
    res.json({ recipes, totalCount });
  } catch (error) {
    logger.error(`Error en búsqueda por ingredientes: ${error.message}`);
    res.status(500).json({ error: "Error in ingredient search with filters" });
  }
};

// Buscar recetas por nombre para un usuario específico
export const getUserRecipesByName = async (req, res) => {
  const { userId } = req.params;
  const title = req.query.name || "";
  const { category, difficulty, prepTime, dietType, rating, sortOption } =
    req.query;

  try {
    const keywords = title.split(" ");
    const regexArray = keywords.map((word) => new RegExp(word, "i"));

    const filterConditions = {
      userId,
      $or: regexArray.map((regex) => ({ title: { $regex: regex } })),
    };

    if (category) filterConditions.courseType = category;
    if (difficulty) filterConditions.difficulty = difficulty;
    if (dietType) filterConditions.dietType = dietType;
    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt)
        filterConditions.prepTime = { $lt: parsedPrepTime.$lt };
      else if (parsedPrepTime.$gte && parsedPrepTime.$lte) {
        filterConditions.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      } else if (parsedPrepTime.$gt)
        filterConditions.prepTime = { $gt: parsedPrepTime.$gt };
    }
    if (rating) filterConditions.likes = { $size: { $gte: parseInt(rating) } };

    let query = Recipe.find(filterConditions);
    if (sortOption === "prepTimeAsc") query = query.sort({ prepTime: 1 });
    if (sortOption === "prepTimeDesc") query = query.sort({ prepTime: -1 });
    if (sortOption === "ratingAsc") query = query.sort({ likes: 1 });
    if (sortOption === "ratingDesc") query = query.sort({ likes: -1 });
    if (sortOption === "createdAtAsc") query = query.sort({ createdAt: 1 });
    if (sortOption === "createdAtDesc") query = query.sort({ createdAt: -1 });

    const recipes = await query.exec();
    const recipesWithRatings = recipes.map((recipe) => {
      recipe.rating = recipe.likes.length;
      return recipe;
    });

    res.json({ recipes: recipesWithRatings });
  } catch (error) {
    logger.error(`Error en getUserRecipesByName: ${error.message}`);
    res
      .status(500)
      .json({ error: "Error al buscar recetas por nombre para el usuario" });
  }
};

// Buscar recetas por ingredientes para un usuario específico
export const getUserRecipesByIngredients = async (req, res) => {
  const { userId } = req.params;
  const ingredients = req.body.ingredients || [];
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    sortOption,
    page,
    limit,
  } = req.body.filters || {};

  try {
    // Crear expresiones regulares para los ingredientes
    const ingredientRegexArray = ingredients.map(
      (ingredient) => new RegExp(ingredient, "i")
    );

    // Construir condiciones de filtro
    const matchConditions = {
      userId: new mongoose.Types.ObjectId(userId), // Usar 'new' aquí
      "ingredients.name": { $in: ingredientRegexArray },
    };

    if (category) matchConditions.courseType = category;
    if (difficulty) matchConditions.difficulty = difficulty;
    if (dietType) matchConditions.dietType = dietType;

    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      if (parsedPrepTime.$lt)
        matchConditions.prepTime = { $lt: parsedPrepTime.$lt };
      if (parsedPrepTime.$gte && parsedPrepTime.$lte) {
        matchConditions.prepTime = {
          $gte: parsedPrepTime.$gte,
          $lte: parsedPrepTime.$lte,
        };
      }
      if (parsedPrepTime.$gt)
        matchConditions.prepTime = { $gt: parsedPrepTime.$gt };
    }

    if (rating) matchConditions.likes = { $size: { $gte: parseInt(rating) } };

    // Pipeline de agregación
    const pipeline = [
      { $match: matchConditions },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: "$ingredients",
                as: "ingredient",
                cond: {
                  $or: ingredientRegexArray.map((regex) => ({
                    $regexMatch: { input: "$$ingredient.name", regex },
                  })),
                },
              },
            },
          },
        },
      },
    ];

    // Configuración de ordenamiento
    if (sortOption) {
      const sortStage = {};
      if (sortOption === "prepTimeAsc") sortStage.prepTime = 1;
      if (sortOption === "prepTimeDesc") sortStage.prepTime = -1;
      if (sortOption === "ratingAsc") sortStage.likes = 1;
      if (sortOption === "ratingDesc") sortStage.likes = -1;
      if (sortOption === "createdAtAsc") sortStage.createdAt = 1;
      if (sortOption === "createdAtDesc") sortStage.createdAt = -1;
      pipeline.push({ $sort: sortStage });
    } else {
      // Ordenar por matchCount descendente por defecto
      pipeline.push({ $sort: { matchCount: -1 } });
    }

    // Paginación
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: pageSize });

    // Ejecutar la agregación
    const recipes = await Recipe.aggregate(pipeline);

    // Obtener el total de recetas que coinciden con los filtros (para la paginación)
    const countPipeline = [
      { $match: matchConditions },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: "$ingredients",
                as: "ingredient",
                cond: {
                  $or: ingredientRegexArray.map((regex) => ({
                    $regexMatch: { input: "$$ingredient.name", regex },
                  })),
                },
              },
            },
          },
        },
      },
      { $count: "totalCount" },
    ];

    const countResult = await Recipe.aggregate(countPipeline);
    const totalCount = countResult[0] ? countResult[0].totalCount : 0;

    // Mapear recetas con ratings
    const recipesWithRatings = recipes.map((recipe) => {
      recipe.rating = recipe.likes.length;
      return recipe;
    });

    res.json({ recipes: recipesWithRatings, totalCount });
  } catch (error) {
    logger.error(`Error en getUserRecipesByIngredients: ${error.message}`);
    res.status(500).json({
      error: "Error al buscar recetas por ingredientes para el usuario",
    });
  }
};

// Buscar recetas por página (paginación)
export const getRecipesByPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const recipes = await Recipe.find().skip(skip).limit(limit);
    res.json(recipes);
  } catch (error) {
    logger.error(`Error al obtener recetas paginadas: ${error.message}`);
    res.status(500).json({ message: "Error al obtener recetas paginadas" });
  }
};

// Actualizar receta
export const updateRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const {
      title,
      servings,
      prepTime,
      difficulty,
      courseType,
      dietType,
      steps,
      ingredients,
    } = req.body;

    // Verificar si la receta existe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    // Manejar la imagen de la receta si se proporciona
    let imageUrl = recipe.image; // Mantener la imagen actual por defecto
    if (req.file) {
      try {
        const result = await uploadImage(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error al subir la imagen", error });
      }
    } else if (req.body.image === "/img/recipe-null.svg") {
      imageUrl = "/img/recipe-null.svg"; // Actualizar a la imagen por defecto si se elimina
    }

    // Actualizar los campos de la receta solo si los nuevos valores son válidos
    recipe.title = title || recipe.title;
    recipe.servings = servings !== undefined ? servings : recipe.servings;
    recipe.prepTime = prepTime !== undefined ? prepTime : recipe.prepTime;
    recipe.difficulty = difficulty || recipe.difficulty;
    recipe.courseType = courseType || recipe.courseType;
    recipe.dietType = dietType || recipe.dietType;
    recipe.steps = steps && steps.length > 0 ? steps : recipe.steps;
    recipe.ingredients =
      ingredients && ingredients.length > 0 ? ingredients : recipe.ingredients;
    recipe.image = imageUrl;

    // Guardar los cambios
    await recipe.save();

    res.json({ message: "Receta actualizada con éxito", recipe });
  } catch (error) {
    logger.error(`Error al actualizar receta: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar receta", error });
  }
};

// Eliminar receta
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la receta existe antes de eliminar
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    // Eliminar la receta
    await Recipe.findByIdAndDelete(id);

    // Actualizar el estado de los reportes relacionados a "resuelto"
    const adminId = req.user.id; // ID del administrador que realiza la acción
    await Report.updateMany(
      { recipeId: id },
      {
        $set: {
          status: "resolved",
          recipeDeleted: true,
          resolvedBy: adminId, // Agregar el administrador que resolvió
        },
      }
    );

    // Obtener el username del administrador
    const resolvedByUser = await User.findById(adminId).select("username");

    res.json({
      message: "Receta eliminada con éxito",
      resolvedBy: resolvedByUser, // Adjuntar la información del administrador en la respuesta
    });
  } catch (error) {
    logger.error(`Error al eliminar receta: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar receta" });
  }
};

// Dar like o quitar like a una receta
export const toggleLikeRecipe = async (req, res) => {
  const { recipeId } = req.params;
  const userId = new mongoose.Types.ObjectId(req.user.id);

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const hasLiked = recipe.likes.some((id) => id.equals(userId));
    if (hasLiked) {
      recipe.likes = recipe.likes.filter((id) => !id.equals(userId));
    } else {
      recipe.likes.push(userId);
    }

    recipe.rating = recipe.likes.length;

    await recipe.save();

    return res.status(200).json({ likes: recipe.likes, rating: recipe.rating });
  } catch (error) {
    logger.error(`Error en toggleLikeRecipe: ${error.message}`);
    return res.status(500).json({ message: "Error procesando el like", error });
  }
};

// Obtener receta por ID solo para administrador
export const getRecipeByIdForAdmin = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "ID de receta no proporcionado" });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    res.status(200).json({ recipe });
  } catch (error) {
    logger.error(`Error al buscar receta por ID para administrador: ${error.message}`);
    res.status(500).json({ message: "Error al buscar la receta", error });
  }
};

