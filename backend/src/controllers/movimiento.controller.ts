import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT m.*, em.nombre AS estado_movimiento_nombre, ea.nombre AS estado_activo_nombre,
           lo.nombre AS lugar_origen_nombre, ld.nombre AS lugar_destino_nombre,
           u.nombre AS usuario_nombre
    FROM movimiento m
    LEFT JOIN estado_movimiento em ON em.id = m.estado_movimiento_id
    LEFT JOIN estado_activo ea ON ea.id = m.estado_activo_id
    LEFT JOIN lugar lo ON lo.id = m.lugar_origen_id
    LEFT JOIN lugar ld ON ld.id = m.lugar_destino_id
    LEFT JOIN usuario u ON u.id = m.usuario_id
    ORDER BY m.id
  `);
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT m.*, em.nombre AS estado_movimiento_nombre, ea.nombre AS estado_activo_nombre,
           lo.nombre AS lugar_origen_nombre, ld.nombre AS lugar_destino_nombre,
           u.nombre AS usuario_nombre
    FROM movimiento m
    LEFT JOIN estado_movimiento em ON em.id = m.estado_movimiento_id
    LEFT JOIN estado_activo ea ON ea.id = m.estado_activo_id
    LEFT JOIN lugar lo ON lo.id = m.lugar_origen_id
    LEFT JOIN lugar ld ON ld.id = m.lugar_destino_id
    LEFT JOIN usuario u ON u.id = m.usuario_id
    WHERE m.id = $1
  `, [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Movimiento no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id } = req.body;
  if (!codigo_movimiento) { res.status(400).json({ ok: false, message: "Código de movimiento requerido." }); return; }
  const id = await getNextId("movimiento");
  const result = await pool.query(
    `INSERT INTO movimiento (id, codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [id, codigo_movimiento, fecha_movimiento ?? new Date().toISOString().split("T")[0], observaciones ?? "", estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id } = req.body;
  const result = await pool.query(`
    UPDATE movimiento SET
      codigo_movimiento = COALESCE($1, codigo_movimiento),
      fecha_movimiento = COALESCE($2, fecha_movimiento),
      observaciones = COALESCE($3, observaciones),
      estado_movimiento_id = COALESCE($4, estado_movimiento_id),
      estado_activo_id = COALESCE($5, estado_activo_id),
      lugar_origen_id = COALESCE($6, lugar_origen_id),
      lugar_destino_id = COALESCE($7, lugar_destino_id),
      usuario_id = COALESCE($8, usuario_id)
    WHERE id = $9 RETURNING *
  `, [codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id, req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Movimiento no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM movimiento WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Movimiento no encontrado." }); return; }
  res.json({ ok: true, message: "Movimiento eliminado." });
}
