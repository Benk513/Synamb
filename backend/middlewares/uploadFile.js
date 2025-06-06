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
      new AppError("Seuls les fichiers JPG et PNG sont autorisés.", 400),
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
