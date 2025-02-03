import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js"; // Importar Winston

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el encabezado de autorización
    const authHeader = req.header("Authorization");
    console.log("Encabezado de autorización recibido:", authHeader); // Log para depuración

    if (!authHeader) {
      logger.warn("Encabezado de autorización no encontrado.");
      return res.status(401).json({
        error: "AuthorizationHeaderMissing",
        message: "No se encontró el encabezado de autorización.",
      });
    }

    // Extraer y verificar el token
    const token = authHeader.replace("Bearer ", "").trim();
    console.log("Token extraído:", token); // Log para depuración

    if (!token) {
      logger.warn("Token no proporcionado.");
      return res.status(401).json({
        error: "TokenMissing",
        message: "El token no fue proporcionado.",
      });
    }

    // Decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error(`Error al verificar el token: ${error.message}`);
      throw error;
    }

    console.log("Token decodificado:", decoded); // Log para depuración

    if (!decoded || !decoded.id) {
      logger.warn(`Token inválido o corrupto: ${JSON.stringify(decoded)}`);
      return res.status(401).json({
        error: "InvalidToken",
        message: "El token proporcionado no es válido o está corrupto.",
      });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id);
    console.log("Usuario encontrado en la base de datos:", user); // Log para depuración

    if (!user) {
      logger.warn("Usuario no encontrado en la base de datos.");
      return res.status(404).json({
        error: "UserNotFound",
        message: "Usuario no encontrado. Por favor, inicia sesión nuevamente.",
      });
    }

    // Verificar si el usuario está activo (si tienes ese campo en tu modelo)
    if (user.status && user.status !== "active") {
      logger.warn(`Usuario inactivo detectado: ${user.status}`);
      return res.status(403).json({
        error: "UserInactive",
        message:
          "Tu cuenta está inactiva. Contacta al soporte para más información.",
      });
    }

    // Adjuntar la información del usuario a la solicitud
    req.user = {
      id: user._id.toString(),
      role: user.role || "consumer",
      email: user.email || null,
      username: user.username || null, // Asegúrate de que esto no sea null
    };

    logger.info(
      `Información del usuario adjuntada a la solicitud: ${JSON.stringify(
        req.user
      )}`
    );

    // Pasar al siguiente middleware o controlador
    next();
  } catch (error) {
    logger.error(`Error en authMiddleware: ${error.message}`, {
      authHeader: req.header("Authorization"),
      token: authHeader ? authHeader.replace("Bearer ", "").trim() : "No token",
    });

    // Manejo de errores específicos de JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "TokenExpired",
        message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "InvalidToken",
        message: "El token es inválido. Por favor, inicia sesión nuevamente.",
      });
    }

    // Manejo de errores generales
    return res.status(500).json({
      error: "InternalServerError",
      message: "Hubo un problema al procesar tu solicitud.",
    });
  }
};

export default authMiddleware;
