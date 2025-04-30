import mongoose from "mongoose";
//  demande des docs que la prs pour les demarches administrative
const schemaDemande = new mongoose.Schema(
  {
    etudiant: {
      type: mongoose.Schema.ObjectId,
      ref: "Utilisateur",
      required: [true, "une demande doit provenir d'un etudiant"],
    },
    type: {
      type: String,
      required: [true, "vous devez specifier le type de demande"],
    },
    message: {
      type: String,
      trim:true,
      required: [true, "veuillez ecrire votre demande"],
    },
    document: {
      type: String,
    },

    ambassadeDestinataire: {
      type: mongoose.Schema.ObjectId,
      required: [true, "vous devez specifier l'ambassade destinataire"],
    },

    status: {
      type: String,
      enum: ["en attente", "approuvée", "rejetée", "en cours"],
      default: "en attente",
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateTraitement: {
      type: Date,       
    },
  },
  { timestamps: true }
);
export const Demande = mongoose.model('Demande', schemaDemande)
