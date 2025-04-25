import mongoose from "mongoose";

const schemaAmbassade = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est  obligatoire pour une ambassade"],
      trim: true,
    },
    pays: {
      type: String,
      unique: [true, "l'ambassade ne doit avoir que un pays d'origine  !"],

      required: [true, "l'ambassade doit avoir un pays d'origine  !"],
    },
    codePays: {
      type: String,
      required: [true, "l'ambassade doit avoir un code de pays d'origine  !"],
    },

    adresse: {
      type: String,
      required: [true, "l'ambassade doit avoir une adresse  !"],
    },

    ambassadeur: {
      required: [true, "l'ambassade  doit avoir un ambassadeur  !"],
      type: mongoose.Schema.ObjectId,
      ref: "Utilisateur",
    },
    listeEtudiants: [
      {
        etudiant: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
        estConfirme: { type: Boolean, default: false },
        dateDemande: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Ambassade = mongoose.model("Ambassade", schemaAmbassade);
