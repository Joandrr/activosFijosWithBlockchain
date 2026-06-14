import { Router } from "express";
import { sseManager } from "../utils/sseManager.js";
import { verifyToken } from "../services/auth.services.js";

export const realtimeRouter = Router();

realtimeRouter.get("/stream", (req, res): void => {
  let token: string | undefined;

  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ ok: false, message: "Token no proporcionado." });
    return;
  }

  try {
    // Validate JWT
    verifyToken(token);

    // Register with manager (sets headers and initial connection payload)
    const clientId = sseManager.register(res);

    req.on("close", () => {
      sseManager.unregister(clientId);
    });
  } catch (error) {
    res.status(401).json({ ok: false, message: "Token inválido o expirado." });
  }
});
