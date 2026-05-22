import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { getNextId } from "../utils/db.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT u.id, u.nombre, u.apellido, u.genero, u.email, u.estado, u.rol_id, r.nombre AS rol_nombre FROM usuario u LEFT JOIN rol r ON r.id = u.rol_id ORDER BY u.id"
  );
  res.json({ ok: true, data: result.rows });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    "SELECT u.id, u.nombre, u.apellido, u.genero, u.email, u.estado, u.rol_id, r.nombre AS rol_nombre FROM usuario u LEFT JOIN rol r ON r.id = u.rol_id WHERE u.id = $1",
    [req.params.id]
  );
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Usuario no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { nombre, apellido, genero, email, password, rol_id } = req.body;
  if (!nombre || !email || !password) { res.status(400).json({ ok: false, message: "Nombre, email y password requeridos." }); return; }
  const existing = await pool.query("SELECT id FROM usuario WHERE email = $1", [email]);
  if (existing.rowCount && existing.rowCount > 0) { res.status(400).json({ ok: false, message: "Email ya registrado." }); return; }
  const id = await getNextId("usuario");
  const hashed = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO usuario (id, nombre, apellido, genero, email, password, estado, rol_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nombre, apellido, genero, email, estado, rol_id",
    [id, nombre, apellido ?? "", genero ?? "M", email, hashed, true, rol_id]
  );
  res.status(201).json({ ok: true, data: result.rows[0] });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { nombre, apellido, genero, email, estado, rol_id } = req.body;
  const result = await pool.query(`
    UPDATE usuario SET
      nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido),
      genero = COALESCE($3, genero), email = COALESCE($4, email),
      estado = COALESCE($5, estado), rol_id = COALESCE($6, rol_id)
    WHERE id = $7 RETURNING id, nombre, apellido, genero, email, estado, rol_id
  `, [nombre, apellido, genero, email, estado, rol_id, req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Usuario no encontrado." }); return; }
  res.json({ ok: true, data: result.rows[0] });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const result = await pool.query("DELETE FROM usuario WHERE id = $1 RETURNING id", [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ ok: false, message: "Usuario no encontrado." }); return; }
  res.json({ ok: true, message: "Usuario eliminado." });
}
