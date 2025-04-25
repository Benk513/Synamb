import express from "express"
import {creerAnnonce, detailAnnonce, listeAnnonces, mettreAJourAnnonce, supprimerAnnonce, televerserImageCouverture} from "./../controllers/annonce.controller.js"
import { proteger, restreindreA } from "../controllers/authentification.controller.js";

const router = express.Router();

router.post("/" ,proteger,televerserImageCouverture,creerAnnonce)
router.get("/",proteger,restreindreA('ambassadeur', 'etudiant'), listeAnnonces);
router.get("/:id",proteger,detailAnnonce);
router.patch("/:id",proteger,mettreAJourAnnonce);
router.delete("/:id",proteger,supprimerAnnonce);

export default router;