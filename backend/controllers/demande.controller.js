import { Demande } from "../models/demande.model.js";
import catchAsync from "../utils/catchAsync.js";
import { Ambassade } from "../models/ambassade.model.js";
import AppError from "../utils/appError.js";
import multer from "multer";
import { notifier } from "../utils/notifier.js";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/demandes/");
  },
  filename: (req, file, cb) => {
    // const extName = file.mimetype.split('/')[1]
    const fileName = file.originalname;
    cb(null, `${fileName.toLowerCase()}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError("Uniquement le format PNG, JPG et PDF sont autorisées", 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 500000 },
});
export const uploadDocument = upload.single("document");

// Création de la demande d'accompagnement (étudiant confirmé) 🟩
export const creerDemandeAccompagnement = catchAsync(async (req, res, next) => {
  const etuId = req.user._id;
  const codePaysEtudiant = req.user.codePays;
  const { type, message } = req.body;

  if (!type || !message)
    return next(
      new AppError(
        "Veuillez renseigner le type et le message de la demande",
        400
      )
    );

  let document;
  if (req.file) document = req.file.filename;

  const ambassade = await Ambassade.findOne({
    codePays: codePaysEtudiant,
  });

  const etudiantConfirme = ambassade?.listeEtudiants?.some(
    (item) => item.etudiant.toString() === etuId.toString() && item.estConfirme
  );

  if (!etudiantConfirme) {
    return next(
      new AppError(
        "Vous devez être confirmé dans l'ambassade pour faire une demande",
        403
      )
    );
  }

  // Vérifier qu'il n'a pas déjà une demande en attente ou en cours
  const exist = await Demande.findOne({
    etudiant: etuId,
    statut: { $in: ["en attente", "en cours"] },
  });

  if (exist) {
    return next(
      new AppError("Vous avez déjà une demande en attente ou en cours", 400)
    );
  }

  const demande = await Demande.create({
    etudiant: etuId,
    ambassadeDestinataire: ambassade._id,
    type,
    message,
    document,
  });
  await notifier({
    destinataire: ambassade.ambassadeur,
    type: "demande_accompagnement",
    message: `Nouvelle demande d'accompagnement de ${req.user.nom}`,
  });

  res.status(201).json({
    status: "success",
    message: "Demande envoyée avec succès",
    data: demande,
  });
});

// lister toutes les demandes du system
export const listerDemandes = catchAsync(async (req, res, next) => {
  // si l'utilisateur est un ambassadeur, on renvoie toute les demandes
  // sinon, on renvoie celle de l'utilisateur connecté.

  if (req.user.role === "ambassadeur" || "agent consulaire") {
    const demandes = await Demande.find();
    res.status(200).json({
      status: "succes",
      data: demandes,
    });
  } else {
    const demandes = await Demande.find({ etudiant: req.user.id });
    res.status(200).json({
      status: "succes",
      data: demandes,
    });
  }
});

// Lister les demandes d'accompagnement pour l'étudiant
export const listerMesDemandes = catchAsync(async (req, res) => {
  const demandes = await Demande.find({ etudiant: req.user._id });
  res.status(200).json({ status: "success", data: demandes });
});

export const changerStatusDemande = catchAsync(async (req, res, next) => {
  const { demandeId } = req.params;

  const { status } = req.body;

  // verification que le nouveau statut est valide et peut etre ajouter ici

  await Demande.findByIdAndUpdate(demandeId, { status });

  res.status(200).json({
    status: "suces",
    message: "Le statut de votre demande a été mise à jour",
  });
});

//on va creer une nouvelle demande si il ya pas de
// on va creer si l'ambassade a accepté notre inscription
// on va creer si
