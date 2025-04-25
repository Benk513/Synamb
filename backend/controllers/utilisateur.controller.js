import { Utilisateur } from "../models/utilisateur.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Ambassade } from "../models/ambassade.model.js";
// to get rid of try catch block we wrap around a catchAsync function , retunr anonymupouis function wjhich will be to create tour

//creer un utilisateur
export const creerUtilisateur = catchAsync(async (req, res, next) => {
  const data = req.body;

  if (!data)
    return res.status(404).json({
      status: "echec",
      message: "Il y a aucune donnée",
    });
  const utilisateur = await Utilisateur.create(data);
  res.status(201).json({
    status: "succes",
    data: utilisateur,
  });
});

// lister toutes les users du systeme
export const listerUtilisateurs = catchAsync(async (req, res, next) => {
  const utilisateurs = await Utilisateur.find();
  res.status(200).json({
    status: "succes",
    resulats: utilisateurs.length,
    data: utilisateurs,
  });
});

// consulter les details d'un utilisateur 🟦
export const detailUtilisateur = catchAsync(async (req, res, next) => {
  const utilisateur = await Utilisateur.findById(req.params.id);

  if (!utilisateur)
    return next(new AppError("Aucun utilisateur trouvée avec cet ID", 404));

  res.status(200).json({
    status: "succes",
    data: utilisateur,
  });
});

// supprimer une utilisateur du systeme
export const supprimerUtilisateur = catchAsync(async (req, res, next) => {
  const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);

  if (!utilisateur)
    return next(new AppError("Aucun Utilisateur trouvé avec cet ID", 404));

  res.status(204).json({
    status: "succes",
    data: null,
  });
});

// obtenir le profil de l'utilisateur 🟦
export const obtenirMonProfil = catchAsync(async (req, res, next) => {
  const user = await Utilisateur.findById(req.user.id);

  console.log(" le user req id :", req.user.id);
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// const filteredObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el] = obj[el];
//     }
//   });
//   return newObj;
// };

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    const value = obj[el];
    if (
      allowedFields.includes(el) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      newObj[el] = value;
    }
  });
  return newObj;
};

// 	Modifier les informations du profil	PUT	/api/users/profile/:id
export const miseAJourProfile = catchAsync(async (req, res, next) => {
  if (req.body.motDePasse || req.body.confirmationMotDePasse)
    return next(
      new AppError(
        "La modification des mots de passe n'est pas autorisée sur cette route !"
      )
    );

  const filteredBody = filteredObj(
    req.body,
    "nom",
    "dateNaissance",
    "pays",
    "sexe",

    "email",
    "biographie",
    "telephone",
    "adresse"
  );

  if (req.file) filteredBody.photo = req.file.filename;

  //3 update user doc
  const updatedUser = await Utilisateur.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: false,
    }
  );

  res.status(200).json({
    status: "succes",
    message: "Profil mis a jour avec succes",
    data: updatedUser,
  });
});

// supprimer mon profil
export const supprimerProfil = catchAsync(async (req, res, next) => {
  await Utilisateur.findByIdAndUpdate(
    { _id: req.params.id },
    { actif: false },
    { new: true }
  );
  res.status(204).json({
    status: "succes",
    message: "Profil supprimé avec succes",
  });
});

//  ------------------- GESTION DES AMBASSADEURS -------------------

// Créer un ambassadeur 🟩 🟦
export const creerAmbassadeur = catchAsync(async (req, res, next) => {
  const {
    nom,
    email,
    motDePasse,
    pays,
    codePays,
    lipasa,
    confirmationMotDePasse,
  } = req.body;

  const ambassadeurExistant = await Utilisateur.findOne({ email });
  if (ambassadeurExistant)
    return next(new AppError("Ambassadeur deja existant !", 400));

  const paysDejaExistantPourAmbassade = await Ambassade.findOne({ codePays });
  if (paysDejaExistantPourAmbassade)
    return next(
      new AppError(
        "L'Ambassade du congo existe deja, plus moyen d'avoir un autre ambassadeur!"
      )
    );

  const nouvelAmbassadeur = await Utilisateur.create({
    nom,
    email,
    lipasa,
    motDePasse,
    role: "ambassadeur",
    pays,
    codePays,
    confirmationMotDePasse,
  });
  res.status(201).json({ status: "success", data: nouvelAmbassadeur });
});

// Suspendre un ambassadeur (changer son statut ou actif = false) 🟩
export const suspendreAmbassadeur = catchAsync(async (req, res) => {
  const ambassadeur = await Utilisateur.findOneAndUpdate(
    { _id: req.params.id, role: "ambassadeur" },
    { actif: false },
    { new: true }
  );
  if (!ambassadeur) return next(new AppError("Ambassadeur non trouvé", 404));
  res.status(200).json({
    status: "success",
    message: "Ambassadeur suspendu",
    data: ambassadeur,
  });
});

// Lister tous les ambassadeurs 🟩 🟦
export const listerAmbassadeurs = catchAsync(async (req, res) => {
  const ambassadeurs = await Utilisateur.find({ role: "ambassadeur" }).select(
    " nom email pays codePays "
  );
  res.status(200).json({
    status: "success",
    resulats: ambassadeurs.length,
    data: ambassadeurs,
  });
});

// Modifier un ambassadeur  🟦
export const modifierAmbassadeur = async (req, res) => {
  const ambassadeur = await Utilisateur.findOneAndUpdate(
    { _id: req.params.id, role: "ambassadeur" },
    req.body,
    { new: false, runValidators: true }
  );
  if (!ambassadeur) return next(new AppError("Ambassadeur non trouvé", 404));
  res.status(200).json({ status: "success", data: ambassadeur });
};
// supprimer un ambassadeur 🟩 🟦
export const supprimerAmbassadeur = async (req, res) => {
  const ambassadeur = await Utilisateur.findOneAndDelete({
    _id: req.params.id,
    role: "ambassadeur",
  });
  if (!ambassadeur) return next(new AppError("Ambassadeur non trouvé", 404));
  res.status(200).json({ status: "success", data: ambassadeur });
};
