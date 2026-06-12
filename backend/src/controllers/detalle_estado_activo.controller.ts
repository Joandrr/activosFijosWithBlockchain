import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.detalleEstadoActivo.findMany({
    include: { activo: true, estadoActivo: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    fecha_registro: item.fecha_registro.toISOString().split("T")[0],
    activo_nombre: item.activo?.nombre ?? null,
    estado_activo_nombre: item.estadoActivo?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { activo_id, estado_activo_id, fecha_registro } = req.body;
  if (!activo_id || !estado_activo_id) { res.status(400).json({ ok: false, message: "activo_id y estado_activo_id requeridos." }); return; }
  
  const id = await getNextId("detalle_estado_activo");
  const created = await prisma.detalleEstadoActivo.create({
    data: {
      id,
      activo_id: Number(activo_id),
      estado_activo_id: Number(estado_activo_id),
      fecha_registro: fecha_registro ? new Date(fecha_registro) : new Date()
    }
  });
  
  const data = {
    ...created,
    fecha_registro: created.fecha_registro.toISOString().split("T")[0]
  };
  res.status(201).json({ ok: true, data });
}
