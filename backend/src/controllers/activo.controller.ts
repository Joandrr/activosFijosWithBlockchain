import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT a.*, t.nombre AS tipo_nombre, m.nombre AS marca_nombre, l.nombre AS lugar_nombre
    FROM activo a
    LEFT JOIN tipo t ON t.id = a.tipo_id
    LEFT JOIN marca m ON m.id = a.marca_id
    LEFT JOIN lugar l ON l.id = a.lugar_id
    ORDER BY a.id
  `);
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query(`
    SELECT a.*, t.nombre AS tipo_nombre, m.nombre AS marca_nombre, l.nombre AS lugar_nombre
    FROM activo a
    LEFT JOIN tipo t ON t.id = a.tipo_id
    LEFT JOIN marca m ON m.id = a.marca_id
    LEFT JOIN lugar l ON l.id = a.lugar_id
    WHERE a.id = $1
  `, [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Activo no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;
  if (!codigo || !nombre) { res.status(400).json({ ok: false, message: "Código y nombre requeridos." }); return; }
  const id = await getNextId("activo");
  const result = await pool.query(
    `INSERT INTO activo (id, codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [id, codigo, nombre, urlImagen ?? "", fecha_registro ?? new Date().toISOString().split("T")[0], estado ?? true, tipo_id, marca_id, lugar_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;
  const result = await pool.query(`
    UPDATE activo SET
      codigo = COALESCE($1, codigo), nombre = COALESCE($2, nombre),
      urlImagen = COALESCE($3, urlImagen), fecha_registro = COALESCE($4, fecha_registro),
      estado = COALESCE($5, estado), tipo_id = COALESCE($6, tipo_id),
      marca_id = COALESCE($7, marca_id), lugar_id = COALESCE($8, lugar_id)
    WHERE id = $9 RETURNING *
  `, [codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id, req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Activo no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM activo WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Activo no encontrado." }); return; }
  res.json({ ok: true, message: "Activo eliminado." });
}
