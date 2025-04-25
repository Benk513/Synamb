// // middlewares/multerConfig.js
// import multer from 'multer';
// import path from 'path';
// import AppError from '../utils/appError.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/annonces/'),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = path.basename(file.originalname, ext).toLowerCase().replace(/\s+/g, '-');
//     cb(null, `${name}-${Date.now()}${ext}`);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new AppError('Seuls les formats PDF, JPG et PNG sont autorisés', 400), false);
// };

// export const uploadDocument = multer({ storage, fileFilter, limits: { fileSize: 500000 } }).single('document');


// // models/ambassade.model.js
// import mongoose from 'mongoose';
// const schemaAmbassade = new mongoose.Schema({
//   nom: { type: String, required: true },
//   pays: { type: String, required: true },
//   codePays: { type: String },
//   adresse: { type: String, required: true },
//   ambassadeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
//   listeEtudiants: [{ etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }, estConfirme: { type: Boolean, default: false }, dateDemande: { type: Date, default: Date.now } }]
// }, { timestamps: true });
// export const Ambassade = mongoose.model('Ambassade', schemaAmbassade);


// // models/demande.model.js
// import mongoose from 'mongoose';
// const schemaDemande = new mongoose.Schema({
//   etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
//   ambassade: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambassade', required: true },
//   type: { type: String, enum: ['inscription', 'accompagnement'], required: true },
//   statut: { type: String, enum: ['en attente','approuvée','rejetée'], default: 'en attente' },
//   document: { type: String },
//   dateDemande: { type: Date, default: Date.now }
// }, { timestamps: true });
// export const Demande = mongoose.model('Demande', schemaDemande);


// // controllers/auth.controller.js
// import { Utilisateur } from '../models/utilisateur.model.js';
// import { Ambassade } from '../models/ambassade.model.js';
// import catchAsync from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';

// // Inscription étudiant + demande inscription
// export const inscriptionEtudiant = catchAsync(async (req, res, next) => {
//   const { nom, email, motDePasse, confirmationMotDePasse, numeroPasseport, nationalite, codePays } = req.body;
//   const user = await Utilisateur.create({ nom, email, motDePasse, confirmationMotDePasse, numeroPasseport, nationalite, role: 'etudiant' });

//   // trouver ambassade
//   const amb = await Ambassade.findOne({ codePays });
//   if (!amb) return next(new AppError('Aucune ambassade trouvée pour ce code pays', 400));

//   // créer demande inscription
//   await Demande.create({ etudiant: user._id, ambassade: amb._id, type: 'inscription' });

//   res.status(201).json({ status: 'success', data: { userId: user._id, statut: 'en attente' } });
// });


// // controllers/ambassade.controller.js
// import { Demande } from '../models/demande.model.js';
// import { Ambassade } from '../models/ambassade.model.js';
// import catchAsync from '../utils/catchAsync.js';

// // lister demandes inscription
// export const listerDemandesInscription = catchAsync(async (req, res) => {
//   const amb = await Ambassade.findOne({ ambassadeur: req.user._id });
//   const demandes = await Demande.find({ ambassade: amb._id, type: 'inscription', statut: 'en attente' }).populate('etudiant', 'nom email');
//   res.json({ status:'success', data: demandes });
// });

// // traiter demande inscription
// export const traiterDemandeInscription = catchAsync(async (req, res) => {
//   const { demandeId } = req.params;
//   const { action } = req.body; // 'accepter' ou 'rejeter'

//   const demande = await Demande.findById(demandeId);
//   if (!demande) return next(new AppError('Demande non trouvée', 404));

//   demande.statut = action === 'accepter' ? 'approuvée' : 'rejetée';
//   await demande.save();

//   if (action === 'accepter') {
//     await Ambassade.findByIdAndUpdate(demande.ambassade, {
//       $addToSet: { listeEtudiants: { etudiant: demande.etudiant } }
//     });
//   }

//   res.json({ status:'success', message: `Demande ${action}ée` });
// });


// // controllers/demande.controller.js
// import { Demande } from '../models/demande.model.js';
// import catchAsync from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';
// import { Ambassade } from '../models/ambassade.model.js';

// // créer demande accompagnement
// export const creerDemandeAccompagnement = catchAsync(async (req, res, next) => {
//   const etuId = req.user._id;
//   const ambId = req.user.ambassade;

//   // vérifier intégration
//   const amb = await Ambassade.findById(ambId);
//   if (!amb.listeEtudiants.some(e => e.etudiant.equals(etuId) && e.estConfirme)) {
//     return next(new AppError('Vous devez être intégré pour demander un accompagnement', 403));
//   }

//   // vérifier pas de demande en attente
//   const exist = await Demande.findOne({ etudiant: etuId, type:'accompagnement', statut:'en attente' });
//   if (exist) return next(new AppError('Vous avez déjà une demande en attente', 400));

//   if (!req.file) return next(new AppError('Document obligatoire', 400));

//   const dem = await Demande.create({ etudiant: etuId, ambassade: ambId, type:'accompagnement', document: req.file.filename });
//   res.status(201).json({ status:'success', data: dem });
// });

// // lister mes demandes accompagnement
// export const listerMesDemandesAccompagnement = catchAsync(async (req, res) => {
//   const demandes = await Demande.find({ etudiant: req.user._id, type:'accompagnement' });
//   res.json({ status:'success', data: demandes });
// });


// // routes/auth.routes.js
// import express from 'express';
// import { inscriptionEtudiant } from '../controllers/auth.controller.js';
// const router = express.Router();
// router.post('/inscription', inscriptionEtudiant);
// export default router;

// // routes/ambassade.routes.js
// import express from 'express';
// import { proteger, restrictTo } from '../middlewares/auth.js';
// import { listerDemandesInscription, traiterDemandeInscription } from '../controllers/ambassade.controller.js';
// const router = express.Router();
// router.use(proteger, restrictTo('ambassadeur'));
// router.get('/inscriptions', listerDemandesInscription);
// router.patch('/inscriptions/:demandeId', traiterDemandeInscription);
// export default router;

// // routes/demande.routes.js
// import express from 'express';
// import { proteger, restrictTo } from '../middlewares/auth.js';
// import { uploadDocument } from '../middlewares/multerConfig.js';
// import { creerDemandeAccompagnement, listerMesDemandesAccompagnement } from '../controllers/demande.controller.js';
// const router = express.Router();
// router.use(proteger, restrictTo('etudiant'));
// router.post('/accompagnement', uploadDocument, creerDemandeAccompagnement);
// router.get('/accompagnement', listerMesDemandesAccompagnement);
// export default router;














// controllers/auth.controller.js
// import { Utilisateur } from "../models/utilisateur.model.js";
// import { Ambassade }   from "../models/ambassade.model.js";
// import catchAsync      from "../utils/catchAsync.js";
// import AppError        from "../utils/appError.js";
// import { creerEtEnvoyerToken } from "../utils/authUtils.js";

// export const inscription = catchAsync(async (req, res, next) => {
//   const {
//     nom,
//     email,
//     motDePasse,
//     confirmationMotDePasse,
//     numeroPasseport,
//     nationalite,
//     codePays,            // récupéré depuis le front
//   } = req.body;

//   // 1️⃣ Vérifications basiques
//   if (!email || !motDePasse)
//     return next(new AppError("Veuillez renseigner email et mot de passe !", 400));

//   // 2️⃣ Création de l'étudiant
//   const nouvelEtudiant = await Utilisateur.create({
//     nom,
//     email,
//     motDePasse,
//     confirmationMotDePasse,
//     numeroPasseport,
//     nationalite,
//     role: "etudiant",
//   });

//   // 3️⃣ Récupérer l'ambassade correspondante
//   const ambassade = await Ambassade.findOne({ codePays });
//   if (!ambassade) {
//     // rollback si aucune ambassade
//     await Utilisateur.findByIdAndDelete(nouvelEtudiant._id);
//     return next(new AppError("Aucune ambassade trouvée pour ce codePays", 400));
//   }

//   // 4️⃣ Ajout dans la liste des étudiants (statut en attente)
//   await Ambassade.findByIdAndUpdate(
//     ambassade._id,
//     {
//       $push: {
//         listeEtudiants: {
//           etudiant: nouvelEtudiant._id,
//           estConfirme: false,
//           dateDemande: Date.now(),
//         },
//       },
//     },
//     { new: true }
//   );

//   // 5️⃣ Générer et envoyer le token
//   creerEtEnvoyerToken(
//     nouvelEtudiant,
//     201,
//     "Inscription réussie ! En attente de validation par l'ambassade.",
//     res
//   );
// });













// controllers/ambassade.controller.js
import { Ambassade } from "../models/ambassade.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Lister les demandes d'inscription en attente
export const listerDemandesInscription = catchAsync(async (req, res, next) => {
  // Trouver l'ambassade rattachée à l'ambassadeur connecté
  const amb = await Ambassade.findOne({ ambassadeur: req.user._id })
    .populate('listeEtudiants.etudiant', 'nom email nationalite');
  if (!amb) return next(new AppError("Ambassade introuvable", 404));

  // Filtrer les étudiants non confirmés
  const demandesEnAttente = amb.listeEtudiants.filter(
    entry => entry.estConfirme === false
  );

  res.status(200).json({ status: 'success', data: demandesEnAttente });
});

