import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
export interface RegisterInput {
    nombre: string;
    apellido: string;
    genero: "M" | "F";
    email: string;
    password: string;
    rol_id: number;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    genero: string;
    rol_id: number;
    estado: boolean;
}

// ──────────────────────────────────────────────
// Helpers JWT
// ──────────────────────────────────────────────
export function signToken(user: AuthUser): string {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            rol_id: user.rol_id,
            nombre: user.nombre,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

export function verifyToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
}

// ──────────────────────────────────────────────
// Registro
// ──────────────────────────────────────────────
export async function registerUser(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    const { nombre, apellido, genero, email, password, rol_id } = input;

    // Verificar email duplicado
    const existing = await pool.query<{ id: number }>(
        "SELECT id FROM usuario WHERE email = $1",
        [email]
    );
    if ((existing.rowCount ?? 0) > 0) {
        throw new Error("El email ya está registrado.");
    }

    // Verificar que el rol exista
    const rolCheck = await pool.query<{ id: number }>(
        "SELECT id FROM rol WHERE id = $1",
        [rol_id]
    );
    if ((rolCheck.rowCount ?? 0) === 0) {
        throw new Error("El rol especificado no existe.");
    }

    // Obtener siguiente ID (tabla sin SERIAL)
    const idResult = await pool.query<{ max: number | null }>(
        "SELECT MAX(id) AS max FROM usuario"
    );
    const nextId = (idResult.rows[0]?.max ?? 0) + 1;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const result = await pool.query<AuthUser>(
        `INSERT INTO usuario (id, nombre, apellido, genero, email, password, estado, rol_id)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
     RETURNING id, nombre, apellido, genero, email, rol_id, estado`,
        [nextId, nombre, apellido, genero, email, hashedPassword, rol_id]
    );

    const user = result.rows[0];
    if (!user) throw new Error("Error al crear el usuario.");

    const token = signToken(user);
    return { user, token };
}

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────
export async function loginUser(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = input;

    const result = await pool.query<AuthUser & { password: string }>(
        `SELECT id, nombre, apellido, genero, email, password, rol_id, estado
     FROM usuario WHERE email = $1`,
        [email]
    );

    const row = result.rows[0];
    if (!row) {
        throw new Error("Credenciales incorrectas.");
    }

    if (!row.estado) {
        throw new Error("La cuenta está desactivada.");
    }

    const passwordMatch = await bcrypt.compare(password, row.password);
    if (!passwordMatch) {
        throw new Error("Credenciales incorrectas.");
    }

    const user: AuthUser = {
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        genero: row.genero,
        email: row.email,
        rol_id: row.rol_id,
        estado: row.estado,
    };

    const token = signToken(user);
    return { user, token };
}

// ──────────────────────────────────────────────
// Obtener perfil por ID
// ──────────────────────────────────────────────
export async function getUserById(id: number): Promise<AuthUser | null> {
    const result = await pool.query<AuthUser>(
        `SELECT id, nombre, apellido, genero, email, rol_id, estado
     FROM usuario WHERE id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
}
