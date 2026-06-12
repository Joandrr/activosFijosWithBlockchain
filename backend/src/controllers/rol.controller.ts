import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const data = await prisma.rol.findMany({ orderBy: { id: "asc" } });
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const data = await prisma.rol.findUnique({ where: { id } });
  if (!data) { res.status(404).json({ ok: false, message: "Rol no encontrado." }); return; }
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("rol");
  const data = await prisma.rol.create({
    data: { id, nombre, descripcion: descripcion ?? "" }
  });
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, descripcion } = req.body;
  
  const updateData: any = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;

  try {
    const data = await prisma.rol.update({
      where: { id },
      data: updateData
    });
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Rol no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.rol.delete({ where: { id } });
    res.json({ ok: true, message: "Rol eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Rol no encontrado." });
  }
}
