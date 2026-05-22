import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query("SELECT * FROM estado_activo ORDER BY id");
  res.json({ ok: true, data: result.rows });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("estado_activo");
  const result = await pool.query("INSERT INTO estado_activo (id, nombre) VALUES ($1, $2) RETURNING *", [id, nombre]);
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM estado_activo WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Estado no encontrado." }); return; }
  res.json({ ok: true, message: "Estado eliminado." });
}
