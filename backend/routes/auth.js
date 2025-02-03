// routes/auth.js
import express from 'express';
import { 
  register, 
  login, 
  getUserInfo, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import upload from '../multerConfig.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Ruta para registrar un nuevo usuario.
 * @name POST /register
 */
router.post('/register', upload.single('profileImage'), register);

/**
 * Ruta para iniciar sesión.
 * @name POST /login
 */
router.post('/login', login);

/**
 * Ruta para obtener información del usuario autenticado.
 * @name GET /user-info
 */
router.get('/user-info', authMiddleware, getUserInfo);

/**
 * Ruta para verificar autenticación.
 * @name GET /check
 */
router.get('/check', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Usuario autenticado' });
});

/**
 * Ruta para solicitar restablecimiento de contraseña.
 * @name POST /forgot-password
 */
router.post('/forgot-password', forgotPassword);

/**
 * Ruta para restablecer la contraseña con el token enviado por correo.
 * @name POST /reset-password/:token
 */
router.post('/reset-password/:token', resetPassword);

export default router;
