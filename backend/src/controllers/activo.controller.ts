import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.activo.findMany({
    include: { tipo: true, marca: true, lugar: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    fecha_registro: item.fecha_registro.toISOString().split("T")[0],
    tipo_nombre: item.tipo?.nombre ?? null,
    marca_nombre: item.marca?.nombre ?? null,
    lugar_nombre: item.lugar?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.activo.findUnique({
    where: { id },
    include: { tipo: true, marca: true, lugar: true }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Activo no encontrado." }); return; }
  const data = {
    ...item,
    fecha_registro: item.fecha_registro.toISOString().split("T")[0],
    tipo_nombre: item.tipo?.nombre ?? null,
    marca_nombre: item.marca?.nombre ?? null,
    lugar_nombre: item.lugar?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;
  if (!codigo || !nombre) { res.status(400).json({ ok: false, message: "Código y nombre requeridos." }); return; }
  
  const id = await getNextId("activo");
  const created = await prisma.activo.create({
    data: {
      id,
      codigo,
      nombre,
      urlImagen: urlImagen ?? "",
      fecha_registro: fecha_registro ? new Date(fecha_registro) : new Date(),
      estado: estado ?? true,
      tipo_id: tipo_id ? Number(tipo_id) : null,
      marca_id: marca_id ? Number(marca_id) : null,
      lugar_id: lugar_id ? Number(lugar_id) : null
    }
  });
  
  const data = {
    ...created,
    fecha_registro: created.fecha_registro.toISOString().split("T")[0]
  };
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;

  const updateData: any = {};
  if (codigo !== undefined) updateData.codigo = codigo;
  if (nombre !== undefined) updateData.nombre = nombre;
  if (urlImagen !== undefined) updateData.urlImagen = urlImagen;
  if (fecha_registro !== undefined) updateData.fecha_registro = fecha_registro ? new Date(fecha_registro) : undefined;
  if (estado !== undefined) updateData.estado = estado;
  if (tipo_id !== undefined) updateData.tipo_id = tipo_id ? Number(tipo_id) : null;
  if (marca_id !== undefined) updateData.marca_id = marca_id ? Number(marca_id) : null;
  if (lugar_id !== undefined) updateData.lugar_id = lugar_id ? Number(lugar_id) : null;

  try {
    const updated = await prisma.activo.update({
      where: { id },
      data: updateData
    });
    const data = {
      ...updated,
      fecha_registro: updated.fecha_registro.toISOString().split("T")[0]
    };
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Activo no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.activo.delete({ where: { id } });
    res.json({ ok: true, message: "Activo eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Activo no encontrado." });
  }
}
