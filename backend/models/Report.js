import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: function () {
        return !this.commentId; // Es requerido si no hay commentId
      },
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: function () {
        return !this.recipeId; // Es requerido si no hay recipeId
      },
    },
    commentContent: {
      type: String, // Almacena el contenido del comentario reportado
    },
    reason: {
      type: String,
      required: [true, "El motivo del reporte es obligatorio."],
    },
    details: {
      type: String,
      maxlength: 500, // Limitar a 500 caracteres (puedes ajustar según tus necesidades)
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario que reporta es obligatorio."],
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    resolutionDetails: {
      type: String,
      maxlength: 1000, // Detalles de resolución limitados a 1000 caracteres
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Relación con el modelo de usuarios
      default: null,
    },
    
  },
  { timestamps: true } // Incluye createdAt y updatedAt automáticamente
);

// Índices para mejorar consultas frecuentes
reportSchema.index({ recipeId: 1 });
reportSchema.index({ commentId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportedBy: 1 });

export default mongoose.model("Report", reportSchema);
