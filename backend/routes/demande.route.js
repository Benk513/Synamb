import express from "express";
import {
  changerStatusDemande,
  creerDemandeAccompagnement,
  listerDemandes,
} from "../controllers/demande.controller.js";
import {
  proteger,
  restreindreA,
} from "../controllers/authentification.controller.js";
import { uploadFormData } from "../middlewares/uploadFormData.js";
import { uploadDocument } from "../middlewares/multerConfig.js";

const routeur = express.Router();

routeur.get("/", proteger, restreindreA("ambassadeur"), listerDemandes);
routeur.post(
  "/",
  proteger,
  restreindreA("etudiant"),
  uploadDocument,
  creerDemandeAccompagnement
);

routeur.post(
  "/changer-status-demande/:demandeId",
  proteger,
  restreindreA("ambassadeur", "agent consulaire"),
  changerStatusDemande
);
export default routeur;
