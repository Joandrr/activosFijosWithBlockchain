/**
 * Script para ejecutar la migración SQL inicial en PostgreSQL
 * Uso: npx tsx scripts/runMigration.ts
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import "dotenv/config";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlPath = join(__dirname, "../../prisma/migrations/initialBD.sql");
const sql = readFileSync(sqlPath, "utf-8");

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Conectado a PostgreSQL:", process.env.DATABASE_URL?.split("@")[1]);

    await client.query(sql);
    console.log("✅ Migración ejecutada correctamente.");
  } catch (err) {
    console.error("❌ Error al ejecutar la migración:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
