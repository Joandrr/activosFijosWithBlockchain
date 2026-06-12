import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.detalleTipo.findMany({
    include: { tipo: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    tipo_nombre: item.tipo?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.detalleTipo.findUnique({
    where: { id },
    include: { tipo: true }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Detalle no encontrado." }); return; }
  const data = {
    ...item,
    tipo_nombre: item.tipo?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, estado, tipo_id } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("detalle_tipo");
  const data = await prisma.detalleTipo.create({
    data: {
      id,
      nombre,
      descripcion: descripcion ?? "",
      estado: estado ?? true,
      tipo_id: tipo_id ? Number(tipo_id) : null
    }
  });
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, descripcion, estado, tipo_id } = req.body;

  const updateData: any = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (estado !== undefined) updateData.estado = estado;
  if (tipo_id !== undefined) updateData.tipo_id = tipo_id ? Number(tipo_id) : null;

  try {
    const data = await prisma.detalleTipo.update({
      where: { id },
      data: updateData
    });
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Detalle no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.detalleTipo.delete({ where: { id } });
    res.json({ ok: true, message: "Detalle eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Detalle no encontrado." });
  }
}

export async function getByTipo(req: Request, res: Response): Promise<void> {
  const tipoId = Number(req.params.tipoId);
  const data = await prisma.detalleTipo.findMany({
    where: { tipo_id: tipoId },
    orderBy: { id: "asc" }
  });
  res.json({ ok: true, data });
}
