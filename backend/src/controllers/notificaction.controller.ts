//  SOLUCIÓN 1:
import type { Request, Response } from 'express';
import express from 'express'; // Si es que usas "express.Router()" o algo similar abajo
import { NotificationService } from '../services/notification.service';

const service = new NotificationService();

export class NotificationController {

  sendToUser = async (
    req: Request,
    res: Response,
  ) => {

    const {
      userId,
      title,
      message,
    } = req.body;

    const result =
      await service.sendToUser(
        userId,
        title,
        message,
      );

    return res.json(result);
  };

  sendToAll = async (
  req: Request,
  res: Response,
) => {

  console.log(req.body);

  const {
    title,
    message,
  } = req.body;

  const result =
    await service.sendToAll(
      title,
      message,
    );

  return res.json(result);
};
}