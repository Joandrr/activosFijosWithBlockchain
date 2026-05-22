import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT l.*, tl.nombre AS tipo_lugar_nombre FROM lugar l LEFT JOIN tipo_lugar tl ON tl.id = l.tipo_lugar_id ORDER BY l.id"
  );
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT l.*, tl.nombre AS tipo_lugar_nombre FROM lugar l LEFT JOIN tipo_lugar tl ON tl.id = l.tipo_lugar_id WHERE l.id = $1",
    [req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Lugar no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, tipo_lugar_id } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("lugar");
  const result = await pool.query(
    "INSERT INTO lugar (id, nombre, descripcion, tipo_lugar_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, nombre, descripcion ?? "", tipo_lugar_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, tipo_lugar_id } = req.body;
  const result = await pool.query(
    "UPDATE lugar SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), tipo_lugar_id = COALESCE($3, tipo_lugar_id) WHERE id = $4 RETURNING *",
    [nombre, descripcion, tipo_lugar_id, req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Lugar no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM lugar WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Lugar no encontrado." }); return; }
  res.json({ ok: true, message: "Lugar eliminado." });
}
