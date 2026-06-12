import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const data = await prisma.estadoMovimiento.findMany({ orderBy: { id: "asc" } });
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("estado_movimiento");
  const data = await prisma.estadoMovimiento.create({
    data: { id, nombre }
  });
  res.status(201).json({ ok: true, data });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.estadoMovimiento.delete({ where: { id } });
    res.json({ ok: true, message: "Estado eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Estado no encontrado." });
  }
}
