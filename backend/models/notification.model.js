import mongoose from "mongoose";

// Définition du schéma de la notification

const notificationSchema = new mongoose.Schema(
  {
    destinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "nouvelle_inscription",
        "demande_accompagnement",
        "validation_demande",
        "rejet_demande",
        "autre",
      ],
      default: "autre",
    },
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
    lien: {
      type: String, // lien vers la page liée à la notification
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
