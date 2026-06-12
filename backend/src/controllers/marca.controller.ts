import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const data = await prisma.marca.findMany({ orderBy: { id: "asc" } });
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const data = await prisma.marca.findUnique({ where: { id } });
  if (!data) { res.status(404).json({ ok: false, message: "Marca no encontrada." }); return; }
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("marca");
  const data = await prisma.marca.create({
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
    const data = await prisma.marca.update({
      where: { id },
      data: updateData
    });
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Marca no encontrada." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.marca.delete({ where: { id } });
    res.json({ ok: true, message: "Marca eliminada." });
  } catch {
    res.status(404).json({ ok: false, message: "Marca no encontrada." });
  }
}
