import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const schemaUtilsateur = new mongoose.Schema(
  {
    photo: {
      type: String,
      default: "default.webp",
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Inserez une adresse mail valide svp!"],
    },
    numeroPasseport: {
      type: String,
      //  required: [true, "Veuillez inserer votre numero de passeport"],
    },
    lipasa: {
      type: String,
      required: [true, "Veuillez inserer votre numero de passeport"],
    },
    motDePasse: {
      type: String,
      required: [true, "Veuillez inserer un mot de passe"],
      minlength: [6, "le mot de passe doit contenir au minimum 6 characteres"],
    },

    pays: {
      type: String,
      required: [true, "Veuillez inserer votre pays d'origine  "],
    },
    codePays: {
      type: String,
      required: [
        true,
        "Veuillez inserer votre code du  pays d'origine ex:CD,TN  ",
      ],
    },

    confirmationMotDePasse: {
      type: String,
      required: [true, "Veuillez confirmer votre mot de passe"],
      validate: {
        validator: function (val) {
          return val === this.motDePasse;
        },
        message: "Les Mots de passe ne correspondent pas!",
      },
    },
    telephone: {
      type: String,
      // validate: [true, "Veuillez inserer votre telephone "],
    },

    nom: {
      type: String,
      trim: true,
      required: [true, "Veuillez inserez votre nom"],
    },
    role: {
      type: String,
      enum: ["ambassadeur", "etudiant", "agent consulaire", "administrateur"],
      default: "etudiant",
    },
    biographie: {
      type: String,
      default: "-",
    },
    adresse: {
      type: String,
    },
    actif: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
    estVerifie: {
      type: Boolean,
      default: false,
    },
    motDePasseChangeLe: { type: String },

    // Définir l'objet imbriqué directement
    dateNaissance: String,
    telephone: String,

    sexe: String,

    dateEntree: Date,
    nombreVisas: Number,
    numeroCarteSejour: String,
    sejourEnCours: Boolean,

    niveauEtude: String,
    domaine: String,
    etablissement: String,
    anneeUniversitaire: String,

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationTOken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

// ********* MIDDLEWARE to rnu b4 save ********* //

schemaUtilsateur.pre("save", async function (next) {
  //execute si et seulement si le mot de passe a ete modifié
  if (!this.isModified("motDePasse")) return next();

  //crypte le mot de passe
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  // supprime le champ confirmation de mot de passe
  this.confirmationMotDePasse = undefined;
});

schemaUtilsateur.methods.correctMotDePasse = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

schemaUtilsateur.methods.motDePasseChangeApres = function (JWTTimestamp) {
  if (this.motDePasseChangeLe) {
    const passwordChangedTimestamp = parseInt(
      this.motDePasseChangeLe.getTime() / 1000,
      10
    );

    return JWTTimestamp < passwordChangedTimestamp;
  }
  return false;
};
export const Utilisateur = mongoose.model("Utilisateur", schemaUtilsateur);
