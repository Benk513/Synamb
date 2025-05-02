import express from "express";
import {
  changerStatusDemande,
  consulterDemandeAccompagnement,
  consulterDemandeAccompagnementEtudiant,
  creerDemandeAccompagnement,
  listerDemandes,
  listerDemandesEtudiant,
  listerMesDemandes,
  traiterDemandeAccompagnement,
} from "../controllers/demande.controller.js";
import {
  proteger,
  restreindreA,
} from "../controllers/authentification.controller.js";
import { uploadFormData } from "../middlewares/uploadFormData.js";
import { uploadDocument } from "../middlewares/multerConfig.js";

const routeur = express.Router();

// POUR ETUDIANT
routeur.post(
  "/",
  proteger,
  restreindreA("etudiant"),
  uploadDocument,
  creerDemandeAccompagnement
);

routeur.get(
  "/listerMesHistoriquesDemandes",
  proteger,
   
  listerDemandesEtudiant
);
routeur.get(
  "/listerMesHistoriquesDemandes/:idDemande",
  proteger,
  restreindreA("etudiant"),
  consulterDemandeAccompagnementEtudiant
);


// POUR AMBASSADEUR
routeur.get(
  "/",
  proteger,
  restreindreA("ambassadeur", "etudiant"),
  listerDemandes
);

routeur.get(
  "/consulterDemande/:idDemande",
  proteger,
  restreindreA("ambassadeur"),
  consulterDemandeAccompagnement
);
routeur.patch(
  "/traiterDemandeAccompagnement/:idDemande",
  proteger,
  restreindreA("ambassadeur"),
  traiterDemandeAccompagnement
);

routeur.post(
  "/changer-status-demande/:demandeId",
  proteger,
  restreindreA("ambassadeur", "agent consulaire"),
  changerStatusDemande
);
export default routeur;
