import mongoose from "mongoose";

/**
 * Esquema para representar una lista de compras.
 */
const ShoppingListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Ítems directamente agregados a la lista sin categoría (se eliminará más adelante si no se usa)
    items: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          default: null,
          min: 0,
        },
        unit: {
          type: String,
          default: null,
          trim: true,
          enum: [
            null,
            "kg",
            "g",
            "l",
            "ml",
            "pieza",
            "unidad",
            "taza",
            "cucharada",
            "cucharadita",
            "pizca",
            "a gusto",
          ],
        },
        isPurchased: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Categorías que contienen ítems
    categories: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        items: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            quantity: {
              type: Number,
              default: null,
              min: 0,
            },
            unit: {
              type: String,
              default: null,
              trim: true,
              enum: [
                null,
                "kg",
                "g",
                "l",
                "ml",
                "pieza",
                "unidad",
                "taza",
                "cucharada",
                "cucharadita",
                "pizca",
                "a gusto",
              ],
            },
            isPurchased: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("ShoppingList", ShoppingListSchema);
