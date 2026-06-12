import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.responsableLugar.findMany({
    include: { lugar: true, usuario: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    lugar_nombre: item.lugar?.nombre ?? null,
    usuario_nombre: item.usuario?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { lugar_id, usuario_id } = req.body;
  if (!lugar_id || !usuario_id) { res.status(400).json({ ok: false, message: "lugar_id y usuario_id requeridos." }); return; }
  
  const id = await getNextId("responsable_lugar");
  const data = await prisma.responsableLugar.create({
    data: {
      id,
      lugar_id: Number(lugar_id),
      usuario_id: Number(usuario_id)
    }
  });
  res.status(201).json({ ok: true, data });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.responsableLugar.delete({ where: { id } });
    res.json({ ok: true, message: "Responsable eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Responsable no encontrado." });
  }
}
