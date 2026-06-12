import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en el pool de PostgreSQL:", err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
