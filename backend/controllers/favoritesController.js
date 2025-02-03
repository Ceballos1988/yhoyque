import Favorite from "../models/Favorite.js";
import Recipe from "../models/Recipe.js";
import logger from "../utils/logger.js"; // Importar Winston

/**
 * Agregar una receta a favoritos.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const addFavorite = async (req, res) => {
  const userId = req.user.id; // El usuario autenticado
  const { recipeId } = req.body; // El ID de la receta que se va a agregar

  if (!userId || !recipeId) {
    return res
      .status(400)
      .json({ message: "El ID del usuario y de la receta son obligatorios." });
  }

  try {
    // Verificar si la receta existe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    // Verificar si el usuario ya tiene esta receta en sus favoritos
    const existingFavorite = await Favorite.findOne({ userId, recipeId });
    if (existingFavorite) {
      return res
        .status(400)
        .json({ message: "La receta ya está en tus favoritos" });
    }

    // Crear un nuevo favorito
    const newFavorite = new Favorite({ userId, recipeId });
    await newFavorite.save();

    // Devolver los favoritos actualizados
    const userFavorites = await Favorite.find({ userId }).populate("recipeId");

    res.status(200).json({
      message: "Receta añadida a favoritos",
      favorites: userFavorites,
    });
  } catch (error) {
    logger.error(`Error al agregar receta a favoritos: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al agregar receta a favoritos", error });
  }
};

/**
 * Eliminar una receta de favoritos.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const removeFavorite = async (req, res) => {
  const userId = req.user.id; // El usuario autenticado
  const { recipeId } = req.params; // ID de la receta a eliminar

  if (!userId || !recipeId) {
    return res
      .status(400)
      .json({ message: "El ID del usuario y de la receta son obligatorios." });
  }

  try {
    // Buscar el favorito por usuario y receta
    const favorite = await Favorite.findOneAndDelete({ userId, recipeId });
    if (!favorite) {
      return res
        .status(404)
        .json({ message: "Receta no encontrada en tus favoritos" });
    }

    // Devolver los favoritos actualizados
    const userFavorites = await Favorite.find({ userId }).populate("recipeId");

    res.status(200).json({
      message: "Receta eliminada de favoritos",
      favorites: userFavorites,
    });
  } catch (error) {
    logger.error(`Error al eliminar receta de favoritos: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al eliminar receta de favoritos", error });
  }
};

/**
 * Obtener todas las recetas favoritas del usuario con filtros y opciones de ordenamiento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const getUserFavorites = async (req, res) => {
  const {
    category,
    difficulty,
    prepTime,
    dietType,
    rating,
    page = 1,
    limit = 10, // Ajusta el límite según tus necesidades
    sortOption,
  } = req.query;
  const userId = req.user.id;

  try {
    // Define las condiciones de filtro para las recetas favoritas
    const filterConditions = {};

    if (category) filterConditions.courseType = category;
    if (difficulty) filterConditions.difficulty = difficulty;
    if (dietType) filterConditions.dietType = dietType;

    if (prepTime) {
      const parsedPrepTime = JSON.parse(prepTime);
      filterConditions.prepTime = {};
      if (parsedPrepTime.$lt)
        filterConditions.prepTime.$lt = parsedPrepTime.$lt;
      if (parsedPrepTime.$gte)
        filterConditions.prepTime.$gte = parsedPrepTime.$gte;
      if (parsedPrepTime.$lte)
        filterConditions.prepTime.$lte = parsedPrepTime.$lte;
    }

    if (rating) {
      filterConditions.$expr = {
        $gte: [{ $size: "$likes" }, parseInt(rating)],
      };
    }

    // Configurar las condiciones de ordenamiento
    let sortConditions = {};
    if (sortOption) {
      switch (sortOption) {
        case "prepTimeAsc":
          sortConditions = { prepTime: 1 };
          break;
        case "prepTimeDesc":
          sortConditions = { prepTime: -1 };
          break;
        case "ratingAsc":
        case "ratingDesc":
          // Ordenar manualmente después de obtener las recetas
          break;
        case "createdAtAsc":
          sortConditions = { createdAt: 1 };
          break;
        case "createdAtDesc":
          sortConditions = { createdAt: -1 };
          break;
        default:
          break;
      }
    }

    // Obtener todos los favoritos del usuario
    const allFavorites = await Favorite.find({ userId }).populate({
      path: "recipeId",
      match: filterConditions,
      select:
        "title image prepTime courseType ingredients steps difficulty userId createdAt rating likes servings",
      options: { sort: sortConditions },
    });

    // Filtrar recetas que no cumplen con el filtro
    const validRecipes = allFavorites.filter((fav) => fav.recipeId);

    // Ordenar manualmente por calificación si es necesario
    if (sortOption === "ratingAsc") {
      validRecipes.sort(
        (a, b) => a.recipeId.likes.length - b.recipeId.likes.length
      );
    } else if (sortOption === "ratingDesc") {
      validRecipes.sort(
        (a, b) => b.recipeId.likes.length - a.recipeId.likes.length
      );
    }

    // Aplicar paginación manualmente después de filtrar
    const totalCount = validRecipes.length;
    const paginatedRecipes = validRecipes
      .slice((page - 1) * limit, page * limit)
      .map((fav) => fav.recipeId);

    // Enviar la respuesta
    res.status(200).json({
      recipes: paginatedRecipes,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    logger.error(`Error al obtener recetas favoritas: ${error.message}`);
    res.status(500).json({ message: "Error al obtener recetas favoritas" });
  }
};

/**
 * Buscar recetas favoritas por nombre.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const searchFavoritesByName = async (req, res) => {
  const { name = "" } = req.query;
  const userId = req.user.id;

  try {
    const nameRegex = new RegExp(name, "i");

    const favorites = await Favorite.find({ userId }).populate({
      path: "recipeId",
      match: { title: { $regex: nameRegex } },
    });

    const filteredRecipes = favorites
      .filter((fav) => fav.recipeId)
      .map((fav) => fav.recipeId);

    res.json({ recipes: filteredRecipes });
  } catch (error) {
    logger.error(`Error en searchFavoritesByName: ${error.message}`);
    res.status(500).json({ error: "Error al buscar recetas favoritas" });
  }
};

/**
 * Buscar recetas favoritas por ingredientes.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const searchFavoritesByIngredients = async (req, res) => {
  const userId = req.user.id;
  const { ingredients, filters } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res
      .status(400)
      .json({ message: "Se requieren ingredientes para la búsqueda." });
  }

  try {
    // Crear expresiones regulares para los ingredientes
    const ingredientRegexArray = ingredients.map(
      (ingredient) => new RegExp(ingredient, "i")
    );

    // Obtener los IDs de las recetas favoritas del usuario
    const favoriteRecipes = await Favorite.find({ userId }).select("recipeId");
    const favoriteRecipeIds = favoriteRecipes.map((fav) => fav.recipeId);

    // Definir condiciones para filtrar recetas
    const recipeMatchConditions = {
      _id: { $in: favoriteRecipeIds },
      "ingredients.name": { $in: ingredientRegexArray },
    };

    if (filters) {
      if (filters.category) recipeMatchConditions.courseType = filters.category;
      if (filters.difficulty)
        recipeMatchConditions.difficulty = filters.difficulty;
      if (filters.dietType) recipeMatchConditions.dietType = filters.dietType;
    }

    // Crear el pipeline de agregación
    const pipeline = [
      { $match: recipeMatchConditions },
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
      { $sort: { matchCount: -1 } }, // Ordenar por cantidad de coincidencias en orden descendente
    ];

    const recipes = await Recipe.aggregate(pipeline);

    res.status(200).json({ recipes });
  } catch (error) {
    logger.error(`Error en searchFavoritesByIngredients: ${error.message}`);
    res
      .status(500)
      .json({ error: "Error al buscar recetas favoritas por ingredientes" });
  }
};
