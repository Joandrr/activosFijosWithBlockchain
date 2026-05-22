import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query("SELECT * FROM permiso ORDER BY id");
  res.json({ ok: true, data: result.rows });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, estado } = req.body;
  if (!nombre) { res.status(400).json({ ok: false, message: "Nombre requerido." }); return; }
  const id = await getNextId("permiso");
  const result = await pool.query("INSERT INTO permiso (id, nombre, descripcion, estado) VALUES ($1, $2, $3, $4) RETURNING *", [id, nombre, descripcion ?? "", estado ?? true]);
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM permiso WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Permiso no encontrado." }); return; }
  res.json({ ok: true, message: "Permiso eliminado." });
}

export async function assignToRol(req: Request, res: Response): Promise<void> {
  const { rol_id, permiso_id } = req.body;
  if (!rol_id || !permiso_id) { res.status(400).json({ ok: false, message: "rol_id y permiso_id requeridos." }); return; }
  await pool.query("INSERT INTO rol_permiso (rol_id, permiso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [rol_id, permiso_id]);
  res.status(201).json({ ok: true, message: "Permiso asignado al rol." });
}

export async function removeFromRol(req: Request, res: Response): Promise<void> {
  const { rol_id, permiso_id } = req.body;
  await pool.query("DELETE FROM rol_permiso WHERE rol_id = $1 AND permiso_id = $2", [rol_id, permiso_id]);
  res.json({ ok: true, message: "Permiso removido del rol." });
}

export async function getPermisosByRol(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT p.* FROM permiso p JOIN rol_permiso rp ON rp.permiso_id = p.id WHERE rp.rol_id = $1 ORDER BY p.id",
    [req.params.rolId]
  );
  res.json({ ok: true, data: result.rows });
}
