// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde un archivo .env
dotenv.config();

// Configuración de Cloudinary con credenciales de acceso obtenidas de variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Sube una imagen a Cloudinary usando un flujo de datos (buffer) con transformaciones de calidad.
 * @function
 * @param {Buffer} buffer - Buffer que contiene la imagen en formato binario.
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la subida en caso de éxito.
 * @throws {Error} Devuelve un error si ocurre un problema durante la carga de la imagen.
 */
export const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image',
        transformation: [
          {
            width: 500,               // Redimensiona la imagen a un ancho máximo de 500px
            crop: 'limit',            // Limita el tamaño para evitar deformaciones
            quality: 'auto:eco',      // Ajusta la calidad automáticamente a un nivel económico
            fetch_format: 'auto',     // Convierte la imagen al mejor formato disponible (e.g., WebP si es compatible)
          }
        ],
      },
      (error, result) => {
        if (error) {
          reject(error); // Error al cargar la imagen
        } else {
          resolve(result); // Devuelve el resultado en caso de éxito
        }
      }
    );
    stream.end(buffer); // Finaliza el stream enviando el buffer de imagen
  });
};

export default cloudinary;
