import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";
import favoritesRoutes from "./routes/favorites.js";
import commentsRoutes from "./routes/comments.js";
import shoppingListRoutes from "./routes/shoppingListRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import missingIngredientsRouter from "./routes/missingIngredientsRouter.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

dotenv.config();
const app = express();

// Middleware para habilitar CORS de forma correcta
const allowedOrigins = [
  process.env.FRONTEND_URL,    // URL en producción (Netlify/Vercel)
  "http://localhost:5173",     // Modo desarrollo (Vite)
  "http://localhost:4173",     // Modo preview (Vite)
  "http://127.0.0.1:5173",     // IP alternativa en local
  "http://127.0.0.1:4173"      // IP alternativa en local
];


app.use(
  cors({
      origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
          } else {
              console.warn(`🚫 CORS bloqueó: ${origin}`);
              callback(null, false); // No lanza error, solo bloquea
          }
      },
      credentials: true,
      optionsSuccessStatus: 200
  })
);



// Middleware para analizar cookies y procesar solicitudes JSON
app.use(cookieParser());
app.use(express.json());

// Conexión a la base de datos de MongoDB usando Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error en la conexión con MongoDB:", error);
    process.exit(1);
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
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api", brandRoutes);

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
  console.log(`[\${req.method}] \${req.url}`, req.body);
  next();
});

// Ruta principal
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente en Render 🚀" });
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;
console.log(`🚀 Servidor intentará correr en el puerto: ${PORT}`);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto: ${PORT}`);
});

// Verificación de variables de entorno
console.log(
  "FRONTEND_URL:",
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "❌ No definido"
);
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "Cargado ✅" : "❌ No definido"
);
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "Cargado ✅" : "❌ No definido"
);
