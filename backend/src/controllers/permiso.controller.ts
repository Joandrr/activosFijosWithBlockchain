import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const data = await prisma.permiso.findMany({ orderBy: { id: "asc" } });
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, estado } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("permiso");
  const data = await prisma.permiso.create({
    data: { id, nombre, descripcion: descripcion ?? "", estado: estado ?? true }
  });
  res.status(201).json({ ok: true, data });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.permiso.delete({ where: { id } });
    res.json({ ok: true, message: "Permiso eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Permiso no encontrado." });
  }
}

export async function assignToRol(req: Request, res: Response): Promise<void> {
  const { rol_id, permiso_id } = req.body;
  if (!rol_id || !permiso_id) { res.status(400).json({ ok: false, message: "rol_id y permiso_id requeridos." }); return; }
  
  const rId = Number(rol_id);
  const pId = Number(permiso_id);
  
  const existing = await prisma.rolPermiso.findUnique({
    where: {
      rol_id_permiso_id: { rol_id: rId, permiso_id: pId }
    }
  });
  
  if (!existing) {
    await prisma.rolPermiso.create({
      data: { rol_id: rId, permiso_id: pId }
    });
  }
  
  res.status(201).json({ ok: true, message: "Permiso asignado al rol." });
}

export async function removeFromRol(req: Request, res: Response): Promise<void> {
  const { rol_id, permiso_id } = req.body;
  const rId = Number(rol_id);
  const pId = Number(permiso_id);
  
  try {
    await prisma.rolPermiso.delete({
      where: {
        rol_id_permiso_id: { rol_id: rId, permiso_id: pId }
      }
    });
  } catch {}
  
  res.json({ ok: true, message: "Permiso removido del rol." });
}

export async function getPermisosByRol(req: Request, res: Response): Promise<void> {
  const rolId = Number(req.params.rolId);
  const list = await prisma.rolPermiso.findMany({
    where: { rol_id: rolId },
    include: { permiso: true },
    orderBy: { permiso_id: "asc" }
  });
  
  const data = list.map(item => item.permiso);
  res.json({ ok: true, data });
}
