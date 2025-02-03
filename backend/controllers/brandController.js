import Brand from "../models/Brand.js";
import { uploadImage } from "../cloudinaryConfig.js";
import logger from "../utils/logger.js"; // Importar Winston


// Obtener todas las marcas
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    logger.error(`Error al obtener marcas: ${error.message}`);
    res.status(500).json({ message: "Error al obtener las marcas." });
  }
};

// Subir una imagen a Cloudinary y guardar la URL en MongoDB
export const uploadBrand = async (req, res) => {
  try {
    // Verificar que haya un archivo subido
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ninguna imagen." });
    }

    // Subir la imagen a Cloudinary
    const result = await uploadImage(req.file.buffer);

    // Crear una nueva marca con la URL de la imagen
    const newBrand = new Brand({
      name: req.body.name || "Marca sin nombre", // Opcional: nombre de la marca
      imageUrl: result.secure_url, // URL de la imagen subida a Cloudinary
    });

    // Guardar en MongoDB
    await newBrand.save();

    res.status(201).json({ message: "Marca creada con éxito", brand: newBrand });
  } catch (error) {
    logger.error(`Error al subir imagen de marca: ${error.message}`);
    res.status(500).json({ message: "Error al subir la imagen de la marca." });
  }
};


// Eliminar una marca
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Marca no encontrada." });
    }

    res.status(200).json({ message: "Marca eliminada con éxito.", brand: deletedBrand });
  } catch (error) {
    logger.error(`Error al eliminar la marca: ${error.message}`);
    res.status(500).json({ message: "Error al eliminar la marca." });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Marca no encontrada." });
    }

    if (req.body.name) {
      brand.name = req.body.name;
    }

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      brand.imageUrl = result.secure_url;
    }

    await brand.save();
    res.status(200).json({ message: "Marca actualizada con éxito.", brand });
  } catch (error) {
    logger.error(`Error al actualizar la marca: ${error.message}`);
    res.status(500).json({ message: "Error al actualizar la marca." });
  }
};

