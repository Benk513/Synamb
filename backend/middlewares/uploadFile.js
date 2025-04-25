// // middleware/upload.js
// import multer from "multer";
// import path from "path";

// // Répertoire de destination
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "_" + file.originalname);
//   },
// });

// // Vérifier les extensions autorisées
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|pdf/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Uniquement les  formats  PDF, JPG, JPEG,et  PNG  sont autorisés"
//       )
//     );
//   }
// };

// const uploadFile = multer({ storage, fileFilter });

// export default uploadFile;

import multer from "multer";
import path from "path";
import AppError from "../utils/appError.js";

// Définir le stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/utilisateurs/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname); // .pdf, .jpg...
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}${ext}`);
  },
});

// Définir le filtre MIME
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Seuls les fichiers PDF, JPG et PNG sont autorisés.", 400),
      false
    );
  }
};

// Définir les limites
const limits = {
  fileSize: 1024 * 500, // 500 KB max
};

// Créer l'instance multer
const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Middleware prêt à être utilisé
export const uploadPhoto = upload.single("photo");
