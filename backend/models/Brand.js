import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  imageUrl: { type: String, required: true }, // URL de la imagen
});

export default mongoose.model("Brand", BrandSchema);
