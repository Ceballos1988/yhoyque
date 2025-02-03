import User from "../models/User.js";
import cloudinary from "../cloudinaryConfig.js";
import bcrypt from "bcrypt"; // Para manejar el hash de contraseñas
import streamifier from "streamifier";
import Comment from "../models/Comment.js"; // Importa el modelo de comentario
import Recipe from "../models/Recipe.js"; // Agregar esta línea
import mongoose from "mongoose";
import logger from "../utils/logger.js"; // Importar Winston

/**
 * Obtiene todos los usuarios (solo para administradores).
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/**
 * Obtiene la información de un usuario por su ID.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const getUserById = async (req, res) => {
  const { userId } = req.params; // Extrae el userId de los parámetros de la ruta

  try {
    const user = await User.findById(userId).select(
      "username firstName lastName bio instagram profileImage" // Agrega los campos necesarios
    );
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user); // Devuelve todos los datos del usuario necesarios para el modal
  } catch (error) {
    logger.error(`Error al obtener el usuario: ${error.message}`);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

/**
 * Actualiza solo la imagen de perfil de un usuario.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ninguna imagen" });
    }

    const uploadResult = await uploadImage(req.file.buffer); // Sube la imagen y obtiene la URL
    const profileImage = uploadResult;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({
      message: "Imagen de perfil actualizada",
      profileImage: user.profileImage,
    });
  } catch (error) {
    logger.error(`Error al actualizar la imagen de perfil: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error al actualizar la imagen de perfil" });
  }
};

/**
 * Obtiene el perfil completo de un usuario.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "firstName lastName username email bio profileImage instagram" // Agregado instagram a la selección de campos
    );
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    logger.error(`Error al obtener perfil: ${error.message}`);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

/**
 * Actualiza los datos del perfil de un usuario.
 * Permite actualizar nombre, apellido, biografía, nombre de usuario, instagram, contraseña e imagen de perfil.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      username,
      bio,
      instagram,
      password,
      currentPassword,
    } = req.body;
    const file = req.file;

    // Encontrar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar la contraseña si se proporciona
    if (password && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Contraseña actual incorrecta" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Actualizar otros datos del perfil si están presentes
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (instagram) user.instagram = instagram;

    // Actualizar la imagen de perfil si se ha enviado una nueva
    if (file) {
      if (user.profileImage && user.profileImage.public_id) {
        // Eliminar la imagen anterior de Cloudinary si existe
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }

      // Subir la nueva imagen a Cloudinary
      const result = await uploadImage(file.buffer);
      user.profileImage = result.secure_url;
    }

    // Guardar los cambios
    await user.save();

    res.json({
      message: "Perfil actualizado con éxito.",
      profileImage: user.profileImage.url,
    });
  } catch (error) {
    logger.error(`Error al actualizar el perfil: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};

/**
 * Elimina la cuenta de un usuario de la base de datos.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    await Recipe.deleteMany({ userId });
    await Comment.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Usuario y sus recetas eliminados" });
  } catch (error) {
    logger.error(`Error al eliminar usuario y recetas: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

/**
 * Sube una imagen de perfil a Cloudinary y devuelve la URL.
 * @param {Buffer} buffer - Buffer de la imagen a subir.
 * @returns {Promise<string>} - URL de la imagen subida.
 */
export const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_pics" },
      (error, result) => {
        if (error) {
          logger.error(`Error al subir imagen a Cloudinary: ${error.message}`);
          reject(error);
        } else {
          resolve(result); // Cambiar para devolver el objeto completo con `secure_url` y `public_id`
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
