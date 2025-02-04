import mongoose from "mongoose";

/**
 * Esquema del modelo de usuario
 */
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // ⚠️ Fuerza que los usernames sean siempre minúsculas
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // ⚠️ Asegura que el email sea guardado en minúsculas
    },
    password: { type: String, required: true },
    profileImage: { type: String, default: "/img/user-icon.png" },
    bio: { type: String, default: "" },
    instagram: { type: String, default: "" },
    role: { type: String, default: "consumer" },

    // 🔹 Campos para restablecimiento de contraseña
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
