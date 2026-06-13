import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, getUserById } from "../services/auth.services.js";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Error interno del servidor";
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nombre, apellido, genero, fecha_nacimiento, email, password, rol_id } = req.body;
    if (!nombre || !apellido || !genero || !email || !password || !rol_id) {
      res.status(400).json({ ok: false, message: "Todos los campos son obligatorios." });
      return;
    }
    const result = await registerUser({ nombre, apellido, genero, fecha_nacimiento, email, password, rol_id });
    res.status(201).json({ ok: true, data: result });
  } catch (err: unknown) {
    res.status(400).json({ ok: false, message: getErrorMessage(err) });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ ok: false, message: "Email y contraseña requeridos." });
      return;
    }
    const result = await loginUser({ email, password });
    res.json({ ok: true, data: result });
  } catch (err: unknown) {
    res.status(401).json({ ok: false, message: getErrorMessage(err) });
  }
}

export async function profile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await getUserById(req.user!.sub);
    if (!user) {
      res.status(404).json({ ok: false, message: "Usuario no encontrado." });
      return;
    }
    res.json({ ok: true, data: user });
  } catch (err: unknown) {
    res.status(500).json({ ok: false, message: getErrorMessage(err) });
  }
}
