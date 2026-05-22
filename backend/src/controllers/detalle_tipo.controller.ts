import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT dt.*, t.nombre AS tipo_nombre FROM detalle_tipo dt LEFT JOIN tipo t ON t.id = dt.tipo_id ORDER BY dt.id"
  );
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT dt.*, t.nombre AS tipo_nombre FROM detalle_tipo dt LEFT JOIN tipo t ON t.id = dt.tipo_id WHERE dt.id = $1",
    [req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Detalle no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, estado, tipo_id } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("detalle_tipo");
  const result = await pool.query(
    "INSERT INTO detalle_tipo (id, nombre, descripcion, estado, tipo_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [id, nombre, descripcion ?? "", estado ?? true, tipo_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, estado, tipo_id } = req.body;
  const result = await pool.query(
    `UPDATE detalle_tipo SET
      nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
      estado = COALESCE($3, estado), tipo_id = COALESCE($4, tipo_id)
     WHERE id = $5 RETURNING *`,
    [nombre, descripcion, estado, tipo_id, req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Detalle no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM detalle_tipo WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Detalle no encontrado." }); return; }
  res.json({ ok: true, message: "Detalle eliminado." });
}

export async function getByTipo(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT * FROM detalle_tipo WHERE tipo_id = $1 ORDER BY id",
    [req.params.tipoId]
  );
  res.json({ ok: true, data: result.rows });
}
