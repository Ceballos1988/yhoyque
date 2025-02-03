import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import {
  getAdminStatistics,
  getTopRecipesByLikes,
  getTopRecipesByReports,
  getUsersAndRecipesByMonth,
  getRecipeDistribution,
} from "../controllers/adminUserController.js";

const router = express.Router();

// Ruta de prueba para el administrador
router.get("/test", authMiddleware, authorizeAdmin, (req, res) => {
  res.json({ message: "Acceso concedido. Eres un administrador." });
});


router.get("/statistics", authMiddleware, authorizeAdmin, getAdminStatistics);

// Nuevas rutas
router.get("/top-likes", authMiddleware, authorizeAdmin, getTopRecipesByLikes);
router.get(
  "/top-reports",
  authMiddleware,
  authorizeAdmin,
  getTopRecipesByReports
);

router.get(
  "/users-recipes-by-month",
  authMiddleware,
  authorizeAdmin,
  getUsersAndRecipesByMonth
);
router.get(
  "/recipe-distribution",
  authMiddleware,
  authorizeAdmin,
  getRecipeDistribution
);

export default router;
