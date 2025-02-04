import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";
import favoritesRoutes from "./routes/favorites.js"; // Ruta de favoritos
import commentsRoutes from "./routes/comments.js";
import shoppingListRoutes from "./routes/shoppingListRoutes.js"; // Importa las rutas de listas de compras
import brandRoutes from "./routes/brandRoutes.js";
import missingIngredientsRouter from "./routes/missingIngredientsRouter.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

dotenv.config();
const app = express();

// Middleware para habilitar CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"], // Asegúrate de tener la URL correcta en tu .env
    credentials: true, // Permite el uso de cookies para autenticación
  })
);

// Middleware para analizar cookies y procesar solicitudes JSON
app.use(cookieParser());
app.use(express.json());

// Conexión a la base de datos de MongoDB usando Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Conectar a MongoDB sin opciones obsoletas
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error en la conexión con MongoDB:", error);
    process.exit(1); // Finalizar la aplicación en caso de error
  }
};

connectDB();

// Rutas para los diferentes módulos de la aplicación
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/shopping-lists", shoppingListRoutes);
app.use("/api/missing-ingredients", missingIngredientsRouter);

// Rutas específicas de administración
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api", brandRoutes); // Rutas de marcas

// Ruta de prueba
app.get("/api/test/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

// Middleware para registrar logs de solicitudes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// Configuración del puerto en el que correrá el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

console.log("MONGO_URI:", process.env.MONGO_URI ? "Cargado ✅" : "No definido ❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Cargado ✅" : "No definido ❌");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Cargado ✅" : "No definido ❌");
