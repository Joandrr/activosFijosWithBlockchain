import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`❌ Variable de entorno requerida no encontrada: ${key}`);
  return value;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET:   process.env["JWT_SECRET"] ?? "super_secret_dev_key_cambiar_en_produccion",
  JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] ?? "7d",
  PORT:         parseInt(process.env["PORT"] ?? "3000", 10),
  NODE_ENV:     process.env["NODE_ENV"] ?? "development",
};
