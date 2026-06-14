import { Router } from 'express';
import { NotificationController } from '../controllers/notificaction.controller.js';

const router = Router();

const controller =
  new NotificationController();

router.post(
  '/user',
  controller.sendToUser,
);

router.post(
  '/all',
  controller.sendToAll,
);

export default router;