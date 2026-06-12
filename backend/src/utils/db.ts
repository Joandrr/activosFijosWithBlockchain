import { prisma } from "../config/db.js";

export async function getNextId(table: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<{ max: number | null }[]>(
    `SELECT MAX(id) AS max FROM ${table}`
  );
  return (result[0]?.max ?? 0) + 1;
}
