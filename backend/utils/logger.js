import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Nivel de log: "info" para mensajes generales, "error" para errores
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ // Para ver logs en la terminal durante el desarrollo
      format: winston.format.colorize(),
      silent: process.env.NODE_ENV === "production" // Oculta logs en producción
    }),
    new winston.transports.File({ // Guardar logs en un archivo
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ // Guardar todos los logs en otro archivo
      filename: "logs/combined.log",
      level: "info",
    }),
  ],
});

export default logger;
