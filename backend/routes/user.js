import express from 'express';
import {
  getAllUsers,
  updateProfileImage,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserById
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../multerConfig.js';

const router = express.Router();

/**
 * @route GET /user/all
 * @description Obtener todos los usuarios (solo accesible para administradores)
 * @access Privado
 */
router.get('/all', authMiddleware, getAllUsers);

/**
 * @route GET /user/profile
 * @description Obtener el perfil del usuario autenticado
 * @access Privado
 */
router.get('/profile', authMiddleware, getUserProfile);

/**
 * @route GET /user/:userId
 * @description Obtener el perfil de un usuario por su ID
 * @access Público
 */
router.get('/:userId', getUserById); // Eliminamos el `authMiddleware` para permitir acceso público

/**
 * @route DELETE /user/delete
 * @description Eliminar la cuenta del usuario autenticado
 * @access Privado
 */
router.delete('/delete', authMiddleware, deleteUser);

/**
 * @route PUT /user/update
 * @description Actualizar perfil del usuario autenticado, incluyendo su imagen de perfil
 * @access Privado
 */
router.put('/update', authMiddleware, upload.single('profileImage'), updateUserProfile);

/**
 * @route PUT /user/updateProfileImage
 * @description Actualizar solo la imagen de perfil del usuario autenticado
 * @access Privado
 */
router.put('/updateProfileImage', authMiddleware, upload.single('profileImage'), updateProfileImage);

export default router;
