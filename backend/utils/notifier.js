import { Notification } from "../models/notification.model.js";

export const notifier = async ({ destinataire, type, message }) => {
  await Notification.create({ destinataire, type, message });
};
