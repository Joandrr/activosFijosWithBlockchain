import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.lugar.findMany({
    include: { tipoLugar: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    tipo_lugar_nombre: item.tipoLugar?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.lugar.findUnique({
    where: { id },
    include: { tipoLugar: true }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Lugar no encontrado." }); return; }
  const data = {
    ...item,
    tipo_lugar_nombre: item.tipoLugar?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, tipo_lugar_id } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("lugar");
  const data = await prisma.lugar.create({
    data: {
      id,
      nombre,
      descripcion: descripcion ?? "",
      tipo_lugar_id: tipo_lugar_id ? Number(tipo_lugar_id) : null
    }
  });
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, descripcion, tipo_lugar_id } = req.body;

  const updateData: any = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (tipo_lugar_id !== undefined) updateData.tipo_lugar_id = tipo_lugar_id ? Number(tipo_lugar_id) : null;

  try {
    const data = await prisma.lugar.update({
      where: { id },
      data: updateData
    });
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Lugar no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.lugar.delete({ where: { id } });
    res.json({ ok: true, message: "Lugar eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Lugar no encontrado." });
  }
}
