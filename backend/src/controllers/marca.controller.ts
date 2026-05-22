import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query("SELECT * FROM marca ORDER BY id");
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query("SELECT * FROM marca WHERE id = $1", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Marca no encontrada." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("marca");
  const result = await pool.query(
    "INSERT INTO marca (id, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *",
    [id, nombre, descripcion ?? ""]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion } = req.body;
  const result = await pool.query(
    "UPDATE marca SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion) WHERE id = $3 RETURNING *",
    [nombre, descripcion, req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Marca no encontrada." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM marca WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Marca no encontrada." }); return; }
  res.json({ ok: true, message: "Marca eliminada." });
}
