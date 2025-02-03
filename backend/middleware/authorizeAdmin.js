import logger from "../utils/logger.js"; // Importar Winston

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  logger.info(`Intento de acceso con rol: ${req.user.role}`);
  if (req.user.role === "admin") {
    next();
  } else {
    logger.warn(`Acceso denegado para usuario con rol: ${req.user.role}`);
    res
      .status(403)
      .json({ message: "Acceso denegado: no eres administrador." });
  }
};

export default authorizeAdmin;
