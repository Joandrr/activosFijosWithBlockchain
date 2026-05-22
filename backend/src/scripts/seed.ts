import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("✅ Conectado a PostgreSQL");

  const sql = readFileSync(join(__dirname, "../../prisma/seed.sql"), "utf-8");
  await client.query(sql);
  console.log("✅ Seed SQL ejecutado");

  const hash = await bcrypt.hash("admin123", 12);
  await client.query(
    `INSERT INTO usuario (id, nombre, apellido, genero, email, password, estado, rol_id)
     VALUES (1, 'Admin', 'Sistema', 'M', 'admin@ficct.edu.bo', $1, TRUE, 1)
     ON CONFLICT (id) DO NOTHING`,
    [hash]
  );
  console.log("✅ Usuario admin creado (admin@ficct.edu.bo / admin123)");

  await client.end();
  console.log("✅ Seed completado");
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
