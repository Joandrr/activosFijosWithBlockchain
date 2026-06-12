import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    id: item.id,
    nombre: item.nombre,
    apellido: item.apellido,
    genero: item.genero,
    email: item.email,
    estado: item.estado,
    rol_id: item.rol_id,
    rol_nombre: item.rol?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.usuario.findUnique({
    where: { id },
    include: { rol: true }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Usuario no encontrado." }); return; }
  const data = {
    id: item.id,
    nombre: item.nombre,
    apellido: item.apellido,
    genero: item.genero,
    email: item.email,
    estado: item.estado,
    rol_id: item.rol_id,
    rol_nombre: item.rol?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, apellido, genero, email, password, rol_id } = req.body;
  if (!nombre || !email || !password) { res.status(400).json({ ok: false, message: "Nombre, email y password requeridos." }); return; }
  
  const existing = await prisma.usuario.findFirst({ where: { email } });
  if (existing) { res.status(400).json({ ok: false, message: "Email ya registrado." }); return; }
  
  const id = await getNextId("usuario");
  const hashed = await bcrypt.hash(password, 12);
  
  const created = await prisma.usuario.create({
    data: {
      id,
      nombre,
      apellido: apellido ?? "",
      genero: genero ?? "M",
      email,
      password: hashed,
      estado: true,
      rol_id: rol_id ? Number(rol_id) : null
    }
  });
  
  const data = {
    id: created.id,
    nombre: created.nombre,
    apellido: created.apellido,
    genero: created.genero,
    email: created.email,
    estado: created.estado,
    rol_id: created.rol_id
  };
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, apellido, genero, email, estado, rol_id } = req.body;

  const updateData: any = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (apellido !== undefined) updateData.apellido = apellido;
  if (genero !== undefined) updateData.genero = genero;
  if (email !== undefined) updateData.email = email;
  if (estado !== undefined) updateData.estado = estado;
  if (rol_id !== undefined) updateData.rol_id = rol_id ? Number(rol_id) : null;

  try {
    const updated = await prisma.usuario.update({
      where: { id },
      data: updateData
    });
    const data = {
      id: updated.id,
      nombre: updated.nombre,
      apellido: updated.apellido,
      genero: updated.genero,
      email: updated.email,
      estado: updated.estado,
      rol_id: updated.rol_id
    };
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Usuario no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.usuario.delete({ where: { id } });
    res.json({ ok: true, message: "Usuario eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Usuario no encontrado." });
  }
}
