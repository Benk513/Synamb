import express from "express";
import {
  getNotifications,
  marquerCommeLue,
} from "../controllers/notification.controller.js";
import { proteger } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(proteger);
router.get("/", getNotifications);
router.patch("/:id/lu", marquerCommeLue);

export default router;
