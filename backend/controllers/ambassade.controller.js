// controllers/ambassade.controller.js
import { Ambassade } from "../models/ambassade.model.js";
import { Demande } from "../models/demande.model.js";
import { Utilisateur } from "../models/utilisateur.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { notifier } from "../utils/notifier.js";

// Créer une ambassade (ambassadeur uniquement) 🟩
export const creerAmbassade = catchAsync(async (req, res, next) => {
  const { nom, pays, codePays, adresse } = req.body;

  const ambassadeur = req.user._id;

  const ambassadeExiste = await Ambassade.findOne({ ambassadeur });

  if (ambassadeExiste)
    return next(
      new AppError(
        "Vous ne pouvez créer une nouvelle ambassade, vous avez déjà une ambassade",
        400
      )
    );
  const nouvelleAmbassade = await Ambassade.create({
    nom,
    pays,
    codePays,
    adresse,
    ambassadeur,
  });
  res.status(201).json({ status: "success", data: nouvelleAmbassade });
});

// Modifier une ambassade
export const modifierAmbassade = async (req, res) => {
  try {
    const ambassade = await Ambassade.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ambassade)
      return res
        .status(404)
        .json({ status: "fail", message: "Ambassade non trouvée" });
    res.status(200).json({ status: "success", data: ambassade });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Lister toutes les ambassades 🟩
export const listerAmbassades = async (req, res) => {
  const ambassades = await Ambassade.find().populate({
    path: "ambassadeur",
    select: "nom photo email",
  });
  res.status(200).json({
    status: "success",
    results: ambassades.length,
    data: ambassades,
  });
};
export const consulterUneAmbassade = async (req, res) => {
  const ambassadeId = req.params.ambassadeId;
  const ambassades = await Ambassade.findById(ambassadeId).populate({
    path: "ambassadeur",
    select: "nom photo email",
  });
  res.status(200).json({
    status: "success",

    data: ambassades,
  });
};

// Lister mes étudiants confirmés 🟩
// export const listerMesEtudiants = catchAsync(async (req, res, next) => {
//   // Récupère l'ambassade de l'ambassadeur connecté
//   const ambassadeur = await Ambassade.findOne({
//     ambassadeur: req.user._id,
//   }).populate("listeEtudiants.etudiant", "nom email pays telephone");
//   if (!ambassadeur)
//     return res
//       .status(404)
//       .json({ status: "fail", message: "Ambassade introuvable" });
//   res.status(200).json({
//     status: "success",
//     resultats: ambassadeur.listeEtudiants.length,
//     data: ambassadeur.listeEtudiants,
//   });
// });

// Lister mes étudiants confirmés 🟩
export const listerMesEtudiants = catchAsync(async (req, res, next) => {
  // Récupère l'ambassade de l'ambassadeur connecté
  const ambassadeur = await Ambassade.findOne({
    ambassadeur: req.user._id,
  }).populate("listeEtudiants.etudiant", "nom email pays telephone");

  if (!ambassadeur) {
    return res.status(404).json({
      status: "fail",
      message: "Ambassade introuvable",
    });
  }

  // Filtrer uniquement les étudiants confirmés et validés
  const etudiantsConfirmes = ambassadeur.listeEtudiants.filter(
    (entry) =>
      entry.estConfirme === true && entry.statusEtudiant === "valide"
  );

  res.status(200).json({
    status: "success",
    resultats: etudiantsConfirmes.length,
    data: etudiantsConfirmes,
  });
});


// export const consulterEtudiantsEnAttente = catchAsync(
//   async (req, res, next) => {
//     // Récupère l'ambassade de l'ambassadeur connecté
//     const ambassade = await Ambassade.findOne({
//       ambassadeur: req.user._id,
//     }).populate("listeEtudiants.etudiant", "nom email pays telephone");

//     if (!ambassade) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Ambassade introuvable",
//       });
//     }
//   }
// );


export const consulterEtudiantsEnAttente = catchAsync(async (req, res, next) => {
  const ambassade = await Ambassade.findOne({
    ambassadeur: req.user._id,
  }).populate({
    path: "listeEtudiants.etudiant",
    select: "nom email pays ",
  });

  if (!ambassade) {
    return next(new AppError("Ambassade introuvable", 404));
  }
  // const listeEtudiants = ambassade.listeEtudiants.map(
  //   (entry) => entry.etudiant 
  // ); 

  // const etudiantsEnAttente = listeEtudiants.filter(
  //   (etudiant) => etudiant.status === "en attente"
  // );


   const etudiantsEnAttente = ambassade.listeEtudiants.filter(
    (item) => item.statusEtudiant === "en attente"
  );
  res.status(200).json({
    status: "success",
    results: etudiantsEnAttente.length,
    data: etudiantsEnAttente,
  });
});

 

export const listeEtudiantsEnAttente = catchAsync(async (req, res, next) => {
  const ambassadeId = req.params.id;

  const ambassade = await Ambassade.findById(ambassadeId).populate("listeEtudiants.etudiant", "nom email avatar");

  if (!ambassade) {
    return next(new AppError("Ambassade non trouvée", 404));
  }

  const etudiantsEnAttente = ambassade.listeEtudiants.filter(
    (item) => item.statusEtudiant === "en attente"
  );

  res.status(200).json({
    status: "success",
    results: etudiantsEnAttente.length,
    data: etudiantsEnAttente,
  });
});

export const consulterProfilEtudiant = catchAsync(async (req, res, next) => {
  const { etudiantId } = req.params;

  // Vérifie d'abord si l'étudiant fait partie de la liste de l’ambassadeur connecté
  const ambassade = await Ambassade.findOne({
    ambassadeur: req.user._id,
    "listeEtudiants.etudiant": etudiantId,
  });

  if (!ambassade) {
    return res.status(403).json({
      status: "fail",
      message: "Vous n’avez pas accès à ce profil",
    });
  }

  // Récupère les infos complètes de l'étudiant
  const etudiant = await Utilisateur.findById(etudiantId).select("-motDePasse");

  if (!etudiant) {
    return res.status(404).json({
      status: "fail",
      message: "Étudiant introuvable",
    });
  }

  res.status(200).json({
    status: "success",
    data: etudiant,
  });
});

// consulter mon ambassade pour ambassadeur 🟩
export const consulterMonAmbassade = catchAsync(async (req, res, next) => {
  await Ambassade.findOne({ ambassadeur: req.user._id })
    .populate("ambassadeur", "nom email nationalite")
    .then((ambassade) => {
      res.status(200).json({
        status: "success",
        data: ambassade,
      });
    });
});

// Suspendre un ambassadeur (changer son statut ou actif = false)
export const suspendreAmbassadeur = async (req, res) => {
  try {
    const ambassadeur = await Utilisateur.findOneAndUpdate(
      { _id: req.params.id, role: "ambassadeur" },
      { actif: false },
      { new: true }
    );
    if (!ambassadeur)
      return res
        .status(404)
        .json({ status: "fail", message: "Ambassadeur non trouvé" });
    res.status(200).json({
      status: "success",
      message: "Ambassadeur suspendu",
      data: ambassadeur,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// // Traiter une demande d'inscription (accepter ou refuser) pour un étudiant (ambassadeur uniquement) 🟩
// export const traiterDemandeInscription = catchAsync(async (req, res, next) => {
//   const etudiantId= req.params.etudiantId // id de l'étudiant
//   const {  action } = req.body; // action = 'accepter' ou 'refuser'

//   // Récupérer l'ambassade de l'ambassadeur
//   const amb = await Ambassade.findOne({ ambassadeur: req.user._id });
//   if (!amb) return next(new AppError("Ambassade introuvable", 404));

//   // Trouver l'entrée correspondante
//   const index = amb.listeEtudiants.findIndex(
//     (entry) => entry.etudiant.toString() === etudiantId.toString()
//   );
//   if (index === -1) return next(new AppError("Demande non trouvée", 404));

//   if (action === "accepter") {
//     // Marquer comme confirmé
//     amb.listeEtudiants[index].estConfirme = true;
//   } else if (action === "refuser") {
//     // Retirer du tableau
//     amb.listeEtudiants.splice(index, 1);
//   } else {
//     return next(new AppError("Action invalide", 400));
//   }

//   await amb.save();
//   res
//     .status(200)
//     .json({ status: "success", message: `Demande ${action}ée avec succès.` });
// });

// export const traiterDemandeInscription = catchAsync(async (req, res, next) => {
//   const etudiantId = req.params.etudiantId;
//   const { action } = req.body;

//   // Récupérer l'ambassade du user connecté (ambassadeur)
//   const amb = await Ambassade.findOne({ ambassadeur: req.user._id });
//   if (!amb) return next(new AppError("Ambassade introuvable", 404));

//   // Chercher l'étudiant dans les demandes
//   const index = amb.listeEtudiants.findIndex(
//     (entry) => entry.etudiant.toString() === etudiantId.toString()
//   );

//   if (index === -1) return next(new AppError("Demande non trouvée", 404));

//   const etudiantRef = amb.listeEtudiants[index].etudiant;

//   if (action === "accepter") {
//     amb.listeEtudiants[index].estConfirme = true;
//   } else if (action === "refuser") {
//     // Ajouter dans la liste des rejetés
//     amb.listeEtudiantsRejete.push({ etudiant: etudiantRef });
//     // Supprimer de la liste principale
//     amb.listeEtudiants.splice(index, 1);
//   } else {
//     return next(new AppError("Action invalide", 400));
//   }

//   await amb.save();

//   res.status(200).json({
//     status: "success",
//     message: `Demande ${action}ée avec succès.`,
//   });
// });

export const traiterDemandeInscription = catchAsync(async (req, res, next) => {
  const etudiantId = req.params.etudiantId;
  const { action } = req.body;

  // Récupérer l'ambassade du user connecté (ambassadeur)
  const amb = await Ambassade.findOne({ ambassadeur: req.user._id });
  if (!amb) return next(new AppError("Ambassade introuvable", 404));

  // Chercher l'étudiant dans les demandes
  const index = amb.listeEtudiants.findIndex(
    (entry) => entry.etudiant.toString() === etudiantId.toString()
  );

  if (index === -1) return next(new AppError("Demande non trouvée", 404));

  const etudiantRef = amb.listeEtudiants[index].etudiant;

  if (action === "accepter") {
    amb.listeEtudiants[index].estConfirme = true;
    amb.listeEtudiants[index].statusEtudiant = "valide";
  } else if (action === "refuser") {
    amb.listeEtudiants[index].estConfirme = false;
    amb.listeEtudiants[index].statusEtudiant = "rejete";

    // Ajouter dans la liste des rejetés
    amb.listeEtudiantsRejete.push({ etudiant: etudiantRef });

    // Supprimer de la liste principale
    amb.listeEtudiants.splice(index, 1);
  } else {
    return next(new AppError("Action invalide : utiliser 'accepter' ou 'refuser'", 400));
  }

  await amb.save();

  res.status(200).json({
    status: "success",
    message: `Demande ${action}ée avec succès.`,
  });
});


export const listerEtudiantsRejetes = catchAsync(async (req, res, next) => {
  const ambassade = await Ambassade.findOne({
    ambassadeur: req.user._id,
  }).populate({
    path: "listeEtudiantsRejete.etudiant",
    select: "nom email pays ",
  });

  if (!ambassade) {
    return next(new AppError("Ambassade introuvable", 404));
  }

  const etudiantsRejetes = ambassade.listeEtudiantsRejete.map(
    (entry) => entry.etudiant
  );

  res.status(200).json({
    status: "success",
    results: etudiantsRejetes.length,
    data: etudiantsRejetes,
  });
});

//lister les demandes des etudiants confirmé dans l'ambassade par l'ambassadeur 🟩
export const listerMesDemandes = catchAsync(async (req, res, next) => {
  const ambassadeurId = req.user._id;

  // Étape 1 : Trouver l’ambassade liée à l’ambassadeur connecté
  const ambassade = await Ambassade.findOne({ ambassadeur: ambassadeurId });

  if (!ambassade) {
    return next(
      new AppError("Aucune ambassade associée à cet utilisateur.", 404)
    );
  }

  // Étape 2 : Récupérer les demandes liées à cette ambassade
  const demandes = await Demande.find({ ambassadeDestinataire: ambassade._id })
    .populate("etudiant")
    .populate("ambassadeDestinataire");

  // Étape 3 : Filtrer seulement les étudiants confirmés
  const demandesFiltrees = demandes.filter((demande) =>
    ambassade.listeEtudiants.some(
      (item) =>
        item.etudiant.toString() === demande.etudiant._id.toString() &&
        item.estConfirme === true
    )
  );

  res.status(200).json({
    status: "success",
    results: demandesFiltrees.length,
    data: demandesFiltrees,
  });
});

export const consulterUneDemande = catchAsync(async (req, res, next) => {
  const ambassadeurId = req.user._id;
  const demandeId = req.params.demandeId;

  // Étape 1 : Trouver l’ambassade de l’ambassadeur connecté
  const ambassade = await Ambassade.findOne({ ambassadeur: ambassadeurId });

  if (!ambassade) {
    return next(
      new AppError("Aucune ambassade associée à cet utilisateur.", 404)
    );
  }

  // Étape 2 : Récupérer la demande et la peupler
  const demande = await Demande.findById(demandeId)
    .populate("etudiant", "nom email")
    .populate("ambassadeDestinataire");

  if (!demande) {
    return next(new AppError("Demande introuvable.", 404));
  }

  // Étape 3 : Vérifier que la demande est bien pour cette ambassade
  if (
    demande.ambassadeDestinataire._id.toString() !== ambassade._id.toString()
  ) {
    return next(new AppError("Vous n'avez pas accès à cette demande.", 403));
  }

  // Étape 4 : Retourner la demande
  res.status(200).json({
    status: "success",
    data: demande,
  });
});

// ✅ Validation ou rejet d'une demande d'accompagnement
export const traiterDemandeAccompagnement = catchAsync(
  async (req, res, next) => {
    const ambassadeurId = req.user._id;
    const demandeId = req.params.demandeId; // ID de la demande à traiter

    const { status } = req.body; // "approuvée" ou "rejetée"

    if (!["approuvée", "rejetée"].includes(status)) {
      return next(
        new AppError("status invalide. Utilisez 'approuvée' ou 'rejetée'", 400)
      );
    }

    const ambassade = await Ambassade.findOne({ ambassadeur: ambassadeurId });
    if (!ambassade) {
      return next(
        new AppError("Aucune ambassade associée à cet utilisateur.", 404)
      );
    }

    const demande = await Demande.findById(demandeId);
    if (!demande) {
      return next(new AppError("Demande introuvable.", 404));
    }

    if (demande.ambassadeDestinataire.toString() !== ambassade._id.toString()) {
      return next(
        new AppError("Cette demande n'appartient pas à votre ambassade.", 403)
      );
    }

    demande.status = status;
    demande.dateTraitement = new Date();
    await demande.save();
    await notifier({
      destinataire: demande.etudiant,
      type: "validation_demande",
      message:
        "Votre demande d'accompagnement a été approuvée par l'ambassadeur.",
    });

    res.status(200).json({
      status: "success",
      message: `Demande ${status} avec succès , nous vous enverons une réponse dans les plus brefs délais. `,
      data: demande,
    });
  }
);
