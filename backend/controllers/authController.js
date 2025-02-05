// controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerValidation, loginValidation } from "../utils/validations.js";
import cloudinary from "../cloudinaryConfig.js";
import sharp from "sharp";
import streamifier from "streamifier";
import crypto from "crypto"; // Para generar tokens seguros
import nodemailer from "nodemailer"; // Para enviar correos
import logger from "../utils/logger.js"; // Importar Winston

/**
 * Función auxiliar para subir y procesar una imagen.
 * Redimensiona la imagen y la sube a Cloudinary.
 * @param {Buffer} buffer - Buffer de la imagen a procesar.
 * @returns {Promise<string>} URL de la imagen subida a Cloudinary.
 */
export const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .resize(800)
      .jpeg({ quality: 80 })
      .toBuffer((err, processedBuffer) => {
        if (err) return reject("Error al procesar la imagen");

        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => {
            if (error) return reject("Error al subir la imagen a Cloudinary");
            resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(processedBuffer).pipe(uploadStream);
      });
  });
};

/**
 * Registro de usuario.
 * Realiza la validación de los datos, procesa la imagen de perfil si se envía,
 * y guarda el nuevo usuario en la base de datos.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 * @returns {void}
 */
// Registro de usuario
export const register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { firstName, lastName, username, bio, email, password, instagram } =
      req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase(); // ⚠️ Convertir username a minúsculas

    // ⚠️ Verificar si el correo o el username ya están registrados
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res
          .status(409)
          .json({ message: "Correo electrónico ya registrado." });
      }
      if (existingUser.username === normalizedUsername) {
        return res
          .status(409)
          .json({ message: "El nombre de usuario ya está en uso." });
      }
    }

    // Asignar imagen predeterminada si no se sube ninguna
    let imageUrl = "/img/user-icon.png";
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }

    // Encriptar la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo usuario
    const user = new User({
      firstName,
      lastName,
      username: normalizedUsername, // ⚠️ Guardar username en minúsculas
      bio,
      email: normalizedEmail,
      password: hashedPassword,
      role: "consumer",
      profileImage: imageUrl,
      instagram: instagram || "",
    });

    // Guardar el usuario en la base de datos
    await user.save();

    res.status(201).json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    logger.error(`Error en el registro: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error del servidor durante el registro." });
  }
};

/**
 * Inicio de sesión de usuario.
 * Valida las credenciales, genera un token JWT, y responde con el token si es exitoso.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 * @returns {void}
 */
// Inicio de sesión de usuario
export const login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (process.env.NODE_ENV !== "production") {
      logger.info(
        `Usuario encontrado: ${user ? user.username : "No encontrado"}`
      );
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "Correo electrónico o contraseña no válidos" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "Correo electrónico o contraseña no válidos" });
    }

    // Validar que el usuario tenga un rol
    if (!user.role) {
      return res.status(500).json({
        message:
          "El usuario no tiene un rol asignado. Contacta al administrador.",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    if (process.env.NODE_ENV !== "production") {
      logger.info(`Token generado para usuario: ${user.username}`);
    }

    // Enviar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor al iniciar sesión" });
  }
};

/**
 * Obtener información del usuario autenticado.
 * Devuelve la información del usuario autenticado en base al token.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 * @returns {void}
 */
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean(); // Usa lean() para mejorar el rendimiento
    user.profileImage = user.profileImage || "/img/user-icon.png"; // Imagen predeterminada
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error al obtener información del usuario: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al obtener información del usuario" });
  }
};

/**
 * Solicita el restablecimiento de contraseña.
 * Genera un token de recuperación y lo envía por correo electrónico.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar token único con expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora desde ahora

    await user.save(); // 📌 Guarda el usuario con el nuevo token

    // URL del enlace de restablecimiento (cambia localhost si usas producción)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configurar transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Configurar el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Restablecimiento de Contraseña",
      html: `
        <h2>Hola ${user.firstName},</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}" style="background: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Restablecer Contraseña
        </a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    };

    // Enviar correo
    await transporter.sendMail(mailOptions);

    res.json({ message: "Correo de recuperación enviado con éxito." });
  } catch (error) {
    logger.error(`Error en forgotPassword: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

/**
 * Restablecer contraseña usando el token recibido por correo.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "El token es requerido." });
    }

    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "La nueva contraseña es obligatoria." });
    }

    // Buscar usuario con el token y verificar que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token aún válido
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Eliminar el token después de usarlo
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    logger.error(`Error en resetPassword: ${error.message}`);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};