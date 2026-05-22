import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT dea.*, a.nombre AS activo_nombre, ea.nombre AS estado_activo_nombre
    FROM detalle_estado_activo dea
    LEFT JOIN activo a ON a.id = dea.activo_id
    LEFT JOIN estado_activo ea ON ea.id = dea.estado_activo_id
    ORDER BY dea.id
  `);
  res.json({ ok: true, data: result.rows });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { activo_id, estado_activo_id, fecha_registro } = req.body;
  if (!activo_id || !estado_activo_id) { res.status(400).json({ ok: false, message: "activo_id y estado_activo_id requeridos." }); return; }
  const id = await getNextId("detalle_estado_activo");
  const result = await pool.query(
    "INSERT INTO detalle_estado_activo (id, activo_id, estado_activo_id, fecha_registro) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, activo_id, estado_activo_id, fecha_registro ?? new Date().toISOString().split("T")[0]]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}
