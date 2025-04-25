import mongoose from "mongoose";

const schemaAnnonce = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre est obligatoire pour une annonce"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["avis", "communique"],
    default: "communique",
  },
  imageCouverture: {
    type: String,
  },
  status: { type: String, enum: ["actif", "inactif"], default: "actif" },

  contenu: {
    type: String,
    required: [true, "le contenu est obligatoire pour une annonce !"],
  },
  datePublication: {
    type: Date,
    default: Date.now(),
  },
  auteur: {
    required: [true, "l'annonce doit avoir un auteur !"],
    type: mongoose.Schema.ObjectId,
    ref: "Utilisateur",
  },
  nombreDeVues: {
    type: Number,
  },
});

export const Annonce = mongoose.model("Annonce", schemaAnnonce);
