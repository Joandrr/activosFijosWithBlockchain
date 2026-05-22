import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT rl.*, l.nombre AS lugar_nombre, u.nombre AS usuario_nombre
    FROM responsable_lugar rl
    LEFT JOIN lugar l ON l.id = rl.lugar_id
    LEFT JOIN usuario u ON u.id = rl.usuario_id
    ORDER BY rl.id
  `);
  res.json({ ok: true, data: result.rows });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { lugar_id, usuario_id } = req.body;
  if (!lugar_id || !usuario_id) { res.status(400).json({ ok: false, message: "lugar_id y usuario_id requeridos." }); return; }
  const id = await getNextId("responsable_lugar");
  const result = await pool.query(
    "INSERT INTO responsable_lugar (id, lugar_id, usuario_id) VALUES ($1, $2, $3) RETURNING *",
    [id, lugar_id, usuario_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM responsable_lugar WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Responsable no encontrado." }); return; }
  res.json({ ok: true, message: "Responsable eliminado." });
}
