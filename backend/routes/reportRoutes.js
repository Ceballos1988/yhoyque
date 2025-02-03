//reportRoutes
import express from "express";
import {
  createReport,
  getReports,
  updateReport,
  deleteReport,
  getReportMotives,
} from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

const router = express.Router();

// Crear un reporte
router.post("/", authMiddleware, createReport);

// Obtener todos los reportes (solo para administradores)
router.get("/", authMiddleware, authorizeAdmin, getReports);

// Actualizar el estado de un reporte
router.put("/:id", authMiddleware, authorizeAdmin, updateReport);

// Eliminar un reporte
router.delete("/:id", authMiddleware, authorizeAdmin, deleteReport);

// Obtener motivos de reportes agrupados por tipo
router.get("/motives", authMiddleware, authorizeAdmin, getReportMotives);

export default router;
