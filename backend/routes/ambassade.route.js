import express from "express";
import {
  creerAnnonce,
  detailAnnonce,
  listeAnnonces,
  televerserImageCouverture,
} from "./../controllers/annonce.controller.js";
import {
  proteger,
  restreindreA,
} from "../controllers/authentification.controller.js";
import {
  consulterEtudiantsEnAttente,
  consulterMonAmbassade,
  consulterProfilEtudiant,
  consulterUneDemande,
  creerAmbassade,
  listerAmbassades,
  listerEtudiantsRejetes,
  listerMesDemandes,
  listerMesEtudiants,
  traiterDemandeAccompagnement,
  traiterDemandeInscription,
  verifierSiEtudiantEstConfirme,
} from "../controllers/ambassade.controller.js";
import { uploadFormData } from "../middlewares/uploadFormData.js";
import { obtenirStatistiquesAmbassadeur } from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post(
  "/creeAmbassade",
  uploadFormData.none(),
  proteger,
  restreindreA("ambassadeur"),
  creerAmbassade
);
router.get(
  "/",
  uploadFormData.none(),
  proteger,
  restreindreA("admin", "ambassadeur"),
  listerAmbassades
);
router.get(
  "/consulterMonAmbassade",
  uploadFormData.none(),
  proteger,
  restreindreA("admin", "ambassadeur"),
  consulterMonAmbassade
);

router.get(
  "/statistiques/ambassadeur",
  proteger,
  restreindreA("ambassadeur"),
  obtenirStatistiquesAmbassadeur
);
router.get(
  "/mesEtudiants",
  proteger,
  restreindreA("ambassadeur"),
  listerMesEtudiants
);

router.get(
  "/etudiantsRejetes",
  proteger,
  restreindreA("ambassadeur"),
  listerEtudiantsRejetes
);
router.get(
  "/etudiantsEnAttente",
  proteger,
  restreindreA("ambassadeur"),
  consulterEtudiantsEnAttente
);

router.patch(
  "/traiterDemandeInscription/:etudiantId",
  proteger,
  restreindreA("ambassadeur"),
  traiterDemandeInscription
);
router.get(
  "/verfierSiEtudiantEstConfirme",
  proteger,
  restreindreA("etudiant"),
  verifierSiEtudiantEstConfirme
);

router.get(
  "/profilEtudiant/:etudiantId",
  proteger,
  restreindreA("ambassadeur"),
  consulterProfilEtudiant
);
router.patch(
  "/traiterDemandeAccompagnement/:demandeId",
  proteger,
  restreindreA("ambassadeur"),
  traiterDemandeAccompagnement
);

router.get(
  "/listerMesDemandes",
  uploadFormData.none(),
  proteger,
  restreindreA("ambassadeur"),
  listerMesDemandes
);
router.get(
  "/listerMesDemandes/:demandeId",
  uploadFormData.none(),
  proteger,
  consulterUneDemande
);

router.get(
  "/",
  uploadFormData.none(),
  proteger,
  restreindreA("admin"),
  listerAmbassades
);

router.get("/:id", proteger, detailAnnonce);

export default router;
