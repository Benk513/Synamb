import { Annonce } from "../models/annonce.model.js";
import multer from "multer";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Utilisateur } from "../models/utilisateur.model.js";
import { Ambassade } from "../models/ambassade.model.js";
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/annonces/");
  },
  filename: (req, file, cb) => {
    // const extName = file.mimetype.split('/')[1]
    
    const ext = file.mimetype.split("/")[1];

    const fileName = `annonce-${req.user.id}-${Date.now()}.${ext}`;

    
    cb(null, `${fileName.toLowerCase()}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Uniquement les images sont autorisées", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10_000_000 },
});
export const televerserImageCouverture = upload.single("imageCouverture");

// creer une annonce
export const creerAnnonce = catchAsync(async (req, res, next) => {
  // extraction de la donnée.
  const { titre, type, contenu } = req.body;

  if (!titre || !type || !contenu)
    return next(new AppError("Veuillez remplir tous les champs", 400));

  let imageCouverture;
  if (req.file) imageCouverture = req.file.filename;

  console.log(req.file);
  //nouvelle annonce creé
  const annonce = await Annonce.create({
    auteur: req.user._id,
    titre,
    type,
    contenu,
    datePublication: new Date(),
    imageCouverture: imageCouverture,
  });

  // renvoie le message de creation reussie
  res.status(201).json({
    statut: "succes",
    data: annonce,
  });
});

//lister toutes les annonces
// export const listeAnnonces = catchAsync(async (req, res, next) => {

//   const etudiantCodePays = req.user.codePays;
//   const ambassadeur = await Utilisateur.findOne({
//     role: "ambassadeur",
//     codePays: etudiantCodePays,
//   })

//   if (!ambassadeur) return next(new AppError("Vous devez etre integré a votre ambassade respective pour voir les annonces",400));

//   const annonces = await Annonce.find({ auteur: ambassadeur._id }).populate({
//     path: "auteur",
//     select: "nom photo"})

//   if (!annonces) return next(new AppError("Pas encore d'annonces pour vous", 400));

//   res.status(200).json({
//     resultats: annonces.length,
//     statut: "succes",
//     data: annonces,
//   });

// });

export const listeAnnonces = catchAsync(async (req, res, next) => {
  const etudiantCodePays = req.user.codePays;
  const etudiantId = req.user._id;

  // Trouver l'ambassade du codePays
  const ambassade = await Ambassade.findOne({ codePays: etudiantCodePays });

  if (!ambassade) {
    return next(
      new AppError(
        "Vous devez être intégré à une ambassade pour voir les annonces.",
        400
      )
    );
  }

  // ⚡ Ne vérifier la confirmation que si l'utilisateur N'EST PAS ambassadeur
  if (req.user.role !== "ambassadeur") {
    const estConfirme = ambassade.listeEtudiants.some(
      (entry) =>
        entry.etudiant.toString() === etudiantId.toString() &&
        entry.estConfirme === true
    );

    if (!estConfirme) {
      return next(
        new AppError(
          "Votre demande d'intégration à l'ambassade n'a pas encore été confirmée.",
          403
        )
      );
    }
  }

  // Récupérer l'ambassadeur qui a posté les annonces
  const ambassadeur = await Utilisateur.findOne({
    role: "ambassadeur",
    codePays: etudiantCodePays,
  });

  if (!ambassadeur) {
    return next(
      new AppError(
        "Aucun ambassadeur n'est associé à votre pays pour le moment.",
        400
      )
    );
  }

  // Récupérer les annonces postées par l’ambassadeur
  const annonces = await Annonce.find({ auteur: ambassadeur._id })
    .sort({
      datePublication: -1,
    })
    .populate({
      path: "auteur",
      select: "nom photo",
    });

  if (!annonces || annonces.length === 0) {
    return next(
      new AppError("Pas encore d'annonces pour votre ambassade.", 400)
    );
  }

  // Réponse finale
  res.status(200).json({
    resultats: annonces.length,
    statut: "succès",
    data: annonces,
  });
});

// export const listeAnnonces = catchAsync(async (req, res, next) => {
//   const etudiantCodePays = req.user.codePays;
//   const etudiantId = req.user._id;

//   // Trouver l'ambassade correspondant au codePays
//   const ambassade = await Ambassade.findOne({ codePays: etudiantCodePays });

//   if (!ambassade) {
//     return next(
//       new AppError(
//         "Vous devez être intégré à une ambassade pour voir les annonces.",
//         400
//       )
//     );
//   }

//   // Vérifier si l'étudiant est dans la liste des étudiants confirmés
//   const estConfirme = ambassade.listeEtudiants.some(
//     (entry) => entry.etudiant.toString() === etudiantId.toString() && entry.estConfirme === true
//   );

//   if (!estConfirme) {
//     return next(
//       new AppError(
//         "Votre demande d'intégration à l'ambassade n'a pas encore été confirmée.",
//         403
//       )
//     );
//   }

//   // Récupérer l'ambassadeur qui a posté les annonces
//   const ambassadeur = await Utilisateur.findOne({
//     role: "ambassadeur",
//     codePays: etudiantCodePays,
//   });

//   if (!ambassadeur) {
//     return next(
//       new AppError(
//         "Aucun ambassadeur n'est associé à votre pays pour le moment.",
//         400
//       )
//     );
//   }

//   // Récupérer les annonces postées par cet ambassadeur
//   const annonces = await Annonce.find({ auteur: ambassadeur._id }).populate({
//     path: "auteur",
//     select: "nom photo",
//   });

//   if (!annonces || annonces.length === 0) {
//     return next(new AppError("Pas encore d'annonces pour votre ambassade.", 400));
//   }

//   // Réponse finale
//   res.status(200).json({
//     resultats: annonces.length,
//     statut: "succès",
//     data: annonces,
//   });
// });

// export const listeAnnonces = catchAsync(async (req, res, next) => {
//   const utilisateurConnecteId = req.user._id;
//   const utilisateurRole = req.user.role;

//   // 1. Récupérer toutes les annonces avec leur auteur
//   const toutesLesAnnonces = await Annonce.find()
//     .populate({
//       path: "auteur",
//       select: "nom photo",
//     })
//     .lean(); // pour manipulation facile

//   let annoncesFiltrees = [];

//   if (utilisateurRole === "etudiant") {
//     // 2. Pour chaque annonce, vérifier si l’étudiant est confirmé dans l’ambassade de l’auteur
//     for (let annonce of toutesLesAnnonces) {
//       const ambassade = await Ambassade.findOne({
//         ambassadeur: annonce.auteur._id,
//       });

//       if (!ambassade) continue;

//       const estEtudiantConfirme = ambassade.listeEtudiants.some(
//         (e) =>
//           e.etudiant.toString() === utilisateurConnecteId.toString() &&
//           e.estConfirme
//       );

//       if (estEtudiantConfirme) {
//         annoncesFiltrees.push(annonce);
//       }
//     }
//   } else {
//     // Si ce n’est pas un étudiant (ex: admin ou ambassadeur), on retourne tout
//     annoncesFiltrees = toutesLesAnnonces;
//   }

//   res.status(200).json({
//     resultats: annoncesFiltrees.length,
//     statut: "succes",
//     data: annoncesFiltrees,
//   });
// });

// consulter une annonce en detail
export const detailAnnonce = catchAsync(async (req, res, next) => {
  const annonce = await Annonce.findById(req.params.id).populate({
    path: "auteur",
    select: "nom photo",
  });
  if (!annonce) return res.status(404).json({ message: "Annonce non trouvée" });
  res.status(200).json({ data: annonce, status: "sucess" });
});

// mettre a jour
export const mettreAJourAnnonce = catchAsync(async (req, res, next) => {
  const annonce = await Annonce.findOneAndUpdate(
    { _id: req.params.id, auteur: req.user._id },
    req.body,
    { new: true }
  );
  if (!annonce)
    return res
      .status(404)
      .json({ message: "Annonce non trouvée ou non autorisée" });
  res.status(200).json(annonce);
});
// supprimer annonce
export const supprimerAnnonce = catchAsync(async (req, res, next) => {
  const deleted = await Annonce.findOneAndDelete({
    _id: req.params.id,
    auteur: req.user._id,
  });
  if (!deleted)
    return res
      .status(404)
      .json({ message: "Annonce non trouvée ou non autorisée" });
  res.status(204).json({ message: "Annonce supprimée" });
});

// lister les 3 dernieres annonces
export const liste3DernieresAnnonces = catchAsync(async (req, res, next) => {
  const annonces = await Annonce.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate({ path: "auteur", select: "nom photo" });
  res.status(200).json(annonces);
});

// lister les annonces par categorie
export const listerAnnoncesParCategorie = catchAsync(async (req, res, next) => {
  const { categorie } = req.params;
  const annonces = await Annonce.find({ categorie })
    .sort({ createdAt: -1 })
    .populate({ path: "auteur", select: "nom photo" });
  res.status(200).json(annonces);
});

// annonces epinglé par utilisateur
export const annoncesEpingléesParUtilisateur = catchAsync(
  async (req, res, next) => {
    const { _id } = req.user;
    const annonces = await Annonce.find({ proprietaire: _id })
      .sort({ createdAt: -1 })
      .populate({ path: "auteur", select: "nom photo" });
    res.status(200).json(annonces);
  }
);
