import multer from 'multer';

/**
 * Configuración de almacenamiento en memoria para los archivos subidos.
 * Usado para almacenar temporalmente las imágenes en el servidor antes de enviarlas a un servicio de almacenamiento.
 */
const storage = multer.memoryStorage();

/**
 * Filtro de archivos que valida si el archivo subido es una imagen permitida.
 * @function
 * @param {Object} req - Solicitud HTTP que contiene el archivo.
 * @param {Object} file - Archivo a ser validado.
 * @param {Function} cb - Callback que decide si el archivo cumple los requisitos.
 */
const fileFilter = (req, file, cb) => {
  if (!file) {
    // Si no se proporciona archivo, continúa sin error.
    return cb(null, true);
  }

  // Lista de tipos MIME permitidos para imágenes
  const allowedTypes = [
    'image/jpeg',  // JPEG
    'image/png',   // PNG
    'image/webp',  // WEBP
    'image/gif',   // GIF
    'image/tiff',  // TIFF
    'image/bmp',   // BMP
    'image/svg+xml' // SVG
  ];

  // Verifica si el tipo de archivo es permitido
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Acepta el archivo si cumple el tipo MIME permitido
  } else {
    // Rechaza el archivo y lanza un error si no es una imagen válida
    const error = new Error('Tipo de archivo no permitido. Solo se permiten imágenes en formato JPEG, PNG, WEBP, GIF, TIFF, BMP o SVG.');
    error.status = 400;
    cb(error, false);
  }
};

/**
 * Configuración de Multer para la carga de archivos con almacenamiento en memoria,
 * límite de tamaño de archivo ampliado a 20MB.
 * @const {multer}
 */
const upload = multer({
  storage: storage, // Almacena el archivo en memoria
  fileFilter: fileFilter, // Aplica filtro para tipos de archivo permitidos
  // Quita el límite de tamaño de archivo
});

export default upload;
