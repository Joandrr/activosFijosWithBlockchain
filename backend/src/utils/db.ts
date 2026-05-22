import { pool } from "../config/db.js";

export async function getNextId(table: string): Promise<number> {
  const result = await pool.query<{ max: number | null }>(
    `SELECT MAX(id) AS max FROM ${table}`
  );
  return (result.rows[0]?.max ?? 0) + 1;
}
