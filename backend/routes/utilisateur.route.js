import express from "express";
import {
  connexion,
  deconnexion,
  inscription,
  proteger,
  restreindreA,
} from "../controllers/authentification.controller.js";
import {
  creerAmbassadeur,
  detailUtilisateur,
  listerAmbassadeurs,
  listerUtilisateurs,
  miseAJourProfile,
  modifierAmbassadeur,
  obtenirMonProfil,
  statistiquesAdmin,
  supprimerAmbassadeur,
} from "../controllers/utilisateur.controller.js";
import { uploadFormData } from "../middlewares/uploadFormData.js";
import { uploadPhoto } from "../middlewares/uploadFile.js";
const router = express.Router();

//  -----------------------PROFIL --------------------------------------
router.get("/monProfil", proteger, obtenirMonProfil);
router.patch("/mettreAJourMonProfil", proteger,uploadPhoto, miseAJourProfile);

// AMBASSADEUR
router.get(
  "/listerAmbassadeurs",
  proteger,
  restreindreA("admin"),
  listerAmbassadeurs
);
router.post(
  "/creerAmbassadeur",
  proteger,
  restreindreA("admin"),
  creerAmbassadeur
);


router.get(
  "/statistiques",
  proteger,
  restreindreA("admin"),
  statistiquesAdmin
);

// ------------------------- AUTHENTIFICATIONS --------------------------
router.post("/inscription", uploadFormData.none(), inscription);
router.post("/connexion",uploadFormData.none(), connexion);
router.post("/deconnexion",uploadFormData.none(), deconnexion);
router.get("/", listerUtilisateurs);
router.get("/:id", detailUtilisateur);

router.patch(
  "/modifierAmbassadeur/:id",
  proteger,
  restreindreA("admin"),
  modifierAmbassadeur
);
router.delete(
  "/supprimerAmbassadeur/:id",
  proteger,
  restreindreA("admin"),
  supprimerAmbassadeur
);
export default router;
