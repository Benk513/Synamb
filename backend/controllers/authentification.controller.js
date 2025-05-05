import { Ambassade } from "../models/ambassade.model.js";
import { Utilisateur } from "../models/utilisateur.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { notifier } from "../utils/notifier.js";
// Méthode	Description	Verbe HTTP	Route API

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const creerEtEnvoyerToken = (utilisateur, statusCode, message, res) => {
  const token = signToken(utilisateur._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  //the secure means only send cookie when we have https
  //  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  // to not show the password
  utilisateur.motDePasse = undefined;
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: utilisateur,
  });
};

// registerUser	Inscription d’un nouvel utilisateur
export const inscription = catchAsync(async (req, res, next) => {
  const {
    nom,
    email,
    motDePasse,
    confirmationMotDePasse,
    lipasa,
    codePays,
    pays,
  } = req.body;
  console.log(req.body);
  //
  if (!email || !motDePasse)
    return next(new AppError("veuillez renseigner ces champs !", 400));

  const utilisateurExistant = await Utilisateur.findOne({ email });

  if (utilisateurExistant)
    return next(
      new AppError("cet adresse email est deja inscrit dans notre systeme", 400)
    );

  console.log(req.body);
  const nouvelEtudiant = await Utilisateur.create({
    nom,
    email,
    motDePasse,
    confirmationMotDePasse,
    lipasa,
    pays,
    codePays,
    role: "etudiant",
  });

  // Chercher une ambassade correspondant au codePays
  const ambassadeCorrespondante = await Ambassade.findOne({ codePays });

  if (ambassadeCorrespondante) {
    ambassadeCorrespondante.listeEtudiants.push({
      etudiant: nouvelEtudiant._id,
      estConfirme: false,
      dateDemande: new Date(),
    });

    await ambassadeCorrespondante.save();
  }

  // await notifier({
  //   destinataire: ambassadeCorrespondante.ambassadeur,
  //   type: "nouvelle_inscription",
  //   message: `Nouvelle demande d'inscription de l'étudiant ${nouvelEtudiant.nom}`,
  // });

  creerEtEnvoyerToken(
    nouvelEtudiant,
    201,
    "Inscription réussie ! En attente de validation par l'ambassade.",
    res
  );
});

// 	Authentification et génération du token JWT
export const connexion = catchAsync(async (req, res, next) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse)
    return next(
      new AppError("veuillez fournir votre email et mot de passe !", 400)
    );

  //2 check if user exists && password is correct
  const utilisateur = await Utilisateur.findOne({ email }).select(
    "+motDePasse"
  );

  if (
    !utilisateur ||
    !(await utilisateur.correctMotDePasse(motDePasse, utilisateur.motDePasse))
  )
    return next(new AppError("email ou mot de passe incorrect", 401));

  creerEtEnvoyerToken(
    utilisateur,
    200,
    "Utilisateur connecté avec succes",
    res
  );
});

export const deconnexion = catchAsync(async (req, res, next) => {
  //as we cannot delete the cookie in the browser due to the httpOnly to true , we must send a false value to log out
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ status: "success", message: "Déconnexion effectué avec success" });
});

export const proteger = catchAsync(async (req, res, next) => {
  //1.get token and check if it's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);
  console.log("Cookies reçus:", req.cookies);
  if (!token)
    return next(
      new AppError("Vous n'etes pas connecté ! veuillez vous connectez ", 401)
    );
  //2. verify the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. check if user still exists
  //here we deal with the case the user was deleted after the token was created , then another user cannot grab this token and access
  const freshUser = await Utilisateur.findById(decode.id);

  if (!freshUser)
    return next(
      new AppError(" L'utilisateur appartenant a ce compte n'existe plus .")
    );

  //4. check if user changed password after the was token was issued.
  if (freshUser.motDePasseChangeApres(decode.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  req.user = freshUser;
  console.log(req.user);
  next();
});

export const restreindreA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Vous n'avez pas acces a cette ressource"), 403);
    }
    next();
  };
};
