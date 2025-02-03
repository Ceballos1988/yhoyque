// utils/validations.js
import Joi from 'joi';

/**
 * Validación de datos para el registro de usuario.
 * @function
 * @param {Object} data - Objeto que contiene los datos del usuario.
 * @param {string} data.firstName - Primer nombre del usuario (obligatorio).
 * @param {string} data.lastName - Apellido del usuario (obligatorio).
 * @param {string} data.username - Nombre de usuario (obligatorio).
 * @param {string} data.bio - Biografía del usuario (opcional).
 * @param {string} data.email - Correo electrónico del usuario (obligatorio).
 * @param {string} data.password - Contraseña del usuario que debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial (obligatorio).
 * @param {string} data.passwordConfirmation - Confirmación de la contraseña que debe coincidir con el campo de contraseña (obligatorio).
 * @param {string} [data.role] - Rol del usuario, puede ser 'consumer' o 'admin' (opcional).
 * @param {string} [data.instagram] - Instagram del usuario (opcional).
 * @returns {Object} Resultado de la validación, incluyendo error si falla.
 */
export const registerValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().messages({
      'any.required': 'El campo nombre es obligatorio.',
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'El campo apellido es obligatorio.',
    }),
    username: Joi.string().required().messages({
      'any.required': 'El campo nombre de usuario es obligatorio.',
    }),
    bio: Joi.string().optional().allow(""), // Biografía es opcional
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El correo electrónico debe tener un formato válido.',
        'any.required': 'El campo correo electrónico es obligatorio.',
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$'))
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres.',
        'string.pattern.base': 'La contraseña debe tener al menos una letra mayúscula, un número y un símbolo especial.',
        'any.required': 'El campo contraseña es obligatorio.',
      }),
    passwordConfirmation: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden.',
        'any.required': 'La confirmación de la contraseña es obligatoria.',
      }),
    role: Joi.string().valid('consumer', 'admin').optional(),
    instagram: Joi.string().optional().allow(""), // Instagram es opcional
    profileImage: Joi.string().optional().allow(""), // Imagen de perfil es opcional
  });

  return schema.validate(data);
};

/**
 * Validación de datos para la actualización del perfil de usuario.
 * @function
 * @param {Object} data - Objeto que contiene los datos del usuario a actualizar.
 * @param {string} [data.firstName] - Primer nombre del usuario (opcional).
 * @param {string} [data.lastName] - Apellido del usuario (opcional).
 * @param {string} [data.username] - Nombre de usuario (opcional).
 * @param {string} [data.bio] - Biografía del usuario (opcional).
 * @param {string} [data.instagram] - Instagram del usuario (opcional).
 * @param {string} [data.password] - Nueva contraseña del usuario (opcional).
 * @param {string} [data.currentPassword] - Contraseña actual del usuario (requerida si se cambia la contraseña).
 * @returns {Object} Resultado de la validación, incluyendo error si falla.
 */
export const updateProfileValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    username: Joi.string().optional(),
    bio: Joi.string().optional().allow(""),
    instagram: Joi.string().optional().allow(""),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$'))
      .optional()
      .messages({
        'string.min': 'La nueva contraseña debe tener al menos 8 caracteres.',
        'string.pattern.base': 'La nueva contraseña debe tener al menos una letra mayúscula, un número y un símbolo especial.',
      }),
    currentPassword: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.required().messages({
        'any.required': 'La contraseña actual es obligatoria para cambiar la contraseña.',
      }),
    }),
  });

  return schema.validate(data);
};

/**
 * Validación de datos para el login de usuario.
 * @function
 * @param {Object} data - Objeto que contiene el correo electrónico y contraseña.
 * @param {string} data.email - Correo electrónico del usuario (obligatorio).
 * @param {string} data.password - Contraseña del usuario, debe tener al menos 8 caracteres (obligatorio).
 * @returns {Object} Resultado de la validación, incluyendo error si falla.
 */
export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El correo electrónico debe tener un formato válido.',
        'any.required': 'El campo correo electrónico es obligatorio.',
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres.',
        'any.required': 'El campo contraseña es obligatorio.',
      }),
  });

  return schema.validate(data);
};
