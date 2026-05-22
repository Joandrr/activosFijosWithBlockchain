import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.services.js";

// Extiende Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  user?: {
    sub:    number;
    email:  string;
    rol_id: number;
    nombre: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ ok: false, message: "Token no proporcionado." });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      sub:    Number(payload["sub"]),
      email:  String(payload["email"] ?? ""),
      rol_id: Number(payload["rol_id"]),
      nombre: String(payload["nombre"] ?? ""),
    };
    next();
  } catch {
    res.status(401).json({ ok: false, message: "Token inválido o expirado." });
  }
}

// Middleware de roles: authorize(1, 2) → solo esos rol_id pueden pasar
export function authorize(...roles: number[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.rol_id;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ ok: false, message: "No tienes permiso para esta acción." });
      return;
    }
    next();
  };
}
