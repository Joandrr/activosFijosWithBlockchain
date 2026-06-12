import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.movimiento.findMany({
    include: {
      estadoMovimiento: true,
      estadoActivo: true,
      lugarOrigen: true,
      lugarDestino: true,
      usuario: true
    },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    fecha_movimiento: item.fecha_movimiento.toISOString().split("T")[0],
    estado_movimiento_nombre: item.estadoMovimiento?.nombre ?? null,
    estado_activo_nombre: item.estadoActivo?.nombre ?? null,
    lugar_origen_nombre: item.lugarOrigen?.nombre ?? null,
    lugar_destino_nombre: item.lugarDestino?.nombre ?? null,
    usuario_nombre: item.usuario?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.movimiento.findUnique({
    where: { id },
    include: {
      estadoMovimiento: true,
      estadoActivo: true,
      lugarOrigen: true,
      lugarDestino: true,
      usuario: true
    }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Movimiento no encontrado." }); return; }
  const data = {
    ...item,
    fecha_movimiento: item.fecha_movimiento.toISOString().split("T")[0],
    estado_movimiento_nombre: item.estadoMovimiento?.nombre ?? null,
    estado_activo_nombre: item.estadoActivo?.nombre ?? null,
    lugar_origen_nombre: item.lugarOrigen?.nombre ?? null,
    lugar_destino_nombre: item.lugarDestino?.nombre ?? null,
    usuario_nombre: item.usuario?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id } = req.body;
  if (!codigo_movimiento) { res.status(400).json({ ok: false, message: "Código de movimiento requerido." }); return; }
  
  const id = await getNextId("movimiento");
  const created = await prisma.movimiento.create({
    data: {
      id,
      codigo_movimiento,
      fecha_movimiento: fecha_movimiento ? new Date(fecha_movimiento) : new Date(),
      observaciones: observaciones ?? "",
      estado_movimiento_id: estado_movimiento_id ? Number(estado_movimiento_id) : null,
      estado_activo_id: estado_activo_id ? Number(estado_activo_id) : null,
      lugar_origen_id: lugar_origen_id ? Number(lugar_origen_id) : null,
      lugar_destino_id: lugar_destino_id ? Number(lugar_destino_id) : null,
      usuario_id: usuario_id ? Number(usuario_id) : null
    }
  });
  
  const data = {
    ...created,
    fecha_movimiento: created.fecha_movimiento.toISOString().split("T")[0]
  };
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id } = req.body;

  const updateData: any = {};
  if (codigo_movimiento !== undefined) updateData.codigo_movimiento = codigo_movimiento;
  if (fecha_movimiento !== undefined) updateData.fecha_movimiento = fecha_movimiento ? new Date(fecha_movimiento) : undefined;
  if (observaciones !== undefined) updateData.observaciones = observaciones;
  if (estado_movimiento_id !== undefined) updateData.estado_movimiento_id = estado_movimiento_id ? Number(estado_movimiento_id) : null;
  if (estado_activo_id !== undefined) updateData.estado_activo_id = estado_activo_id ? Number(estado_activo_id) : null;
  if (lugar_origen_id !== undefined) updateData.lugar_origen_id = lugar_origen_id ? Number(lugar_origen_id) : null;
  if (lugar_destino_id !== undefined) updateData.lugar_destino_id = lugar_destino_id ? Number(lugar_destino_id) : null;
  if (usuario_id !== undefined) updateData.usuario_id = usuario_id ? Number(usuario_id) : null;

  try {
    const updated = await prisma.movimiento.update({
      where: { id },
      data: updateData
    });
    const data = {
      ...updated,
      fecha_movimiento: updated.fecha_movimiento.toISOString().split("T")[0]
    };
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.movimiento.delete({ where: { id } });
    res.json({ ok: true, message: "Movimiento eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
  }
}
