import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import cookieParser from "cookie-parser";

//importation des routes
import annonceRouter from "./routes/annonce.route.js";
import utilisateurRouter from "./routes/utilisateur.route.js";
import demandeRouteur from "./routes/demande.route.js";
import ambassadeRouter from "./routes/ambassade.route.js";
import AppError from "./utils/appError.js";



// Recréation de __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Autoriser l'origine du frontend
app.use(cors({
  origin: 'http://127.0.0.1:5500', // ton frontend
  credentials: true
}));

// Parser les cookies
app.use(cookieParser());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Permettre le JSON
app.use(express.json());

// Servir les fichiers statiques (images uploadées)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => res.send("Bienvenue chez Synamb!"));
app.use("/api/annonces", annonceRouter);
app.use("/api/utilisateurs", utilisateurRouter);
app.use("/api/demandes", demandeRouteur);
app.use("/api/ambassades", ambassadeRouter);

// Route inconnue
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Impossible de trouver la route ${req.originalUrl} sur ce serveur!`,
      404
    )
  );
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
