//adminUserRoutes.js
import express from "express";
import {
  getUsersWithPagination,
  updateUser,
  deleteUser,
  getRecipeDietTypeDistribution,
  getRecipeCategoryDistribution,
  
} from "../controllers/adminUserController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

const router = express.Router();

// Ruta con paginación
router.get("/", authMiddleware, authorizeAdmin, getUsersWithPagination);

// Rutas existentes
router.put("/:userId", authMiddleware, authorizeAdmin, updateUser);
router.delete("/:userId", authMiddleware, authorizeAdmin, deleteUser);


router.get(
  "/diet-type-distribution",
  authMiddleware,
  authorizeAdmin,
  getRecipeDietTypeDistribution
);

router.get("/category-distribution", authMiddleware, authorizeAdmin, getRecipeCategoryDistribution);


export default router;
