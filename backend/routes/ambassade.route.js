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
  consulterMonAmbassade,
  consulterUneDemande,
  creerAmbassade,
  listerAmbassades,
  listerMesDemandes,
  listerMesEtudiants,
  traiterDemandeAccompagnement,
  traiterDemandeInscription,
} from "../controllers/ambassade.controller.js";
import { uploadFormData } from "../middlewares/uploadFormData.js";

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
  "/mesEtudiants",
  proteger,
  restreindreA("ambassadeur"),
  listerMesEtudiants
);

router.patch(
  "/traiterDemandeInscription/:etudiantId",
  proteger,
  restreindreA("ambassadeur"),
  traiterDemandeInscription
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
  restreindreA("ambassadeur"),
  consulterUneDemande
);


 

router.get("/:id", proteger, detailAnnonce);

export default router;