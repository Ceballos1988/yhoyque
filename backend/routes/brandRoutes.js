import express from "express";
import { getBrands, uploadBrand, deleteBrand, updateBrand } from "../controllers/brandController.js";
import upload from "../multerConfig.js"; // Configuración de multer
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware de autenticación
import authorizeAdmin from "../middleware/authorizeAdmin.js"; // Middleware para verificar si es admin

const router = express.Router();

// Ruta para obtener todas las marcas (sin restricciones de rol)
router.get("/brands", authMiddleware, getBrands);

// Ruta para subir una imagen y crear una marca (solo administradores)
router.post("/brands", authMiddleware, authorizeAdmin, upload.single("image"), uploadBrand);

// Ruta para eliminar una marca (solo administradores)
router.delete("/brands/:id", authMiddleware, authorizeAdmin, deleteBrand);

router.put("/brands/:id", authMiddleware, authorizeAdmin, upload.single("image"), updateBrand);

export default router;
