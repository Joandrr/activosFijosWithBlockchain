import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
export interface RegisterInput {
    nombre: string;
    apellido: string;
    genero: "M" | "F";
    fecha_nacimiento?: string;
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
    fecha_nacimiento?: Date | null;
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
    const { nombre, apellido, genero, fecha_nacimiento, email, password, rol_id } = input;

    // Verificar email duplicado
    const existing = await prisma.usuario.findFirst({
        where: { email }
    });
    if (existing) {
        throw new Error("El email ya está registrado.");
    }

    // Verificar que el rol exista
    const rolCheck = await prisma.rol.findUnique({
        where: { id: rol_id }
    });
    if (!rolCheck) {
        throw new Error("El rol especificado no existe.");
    }

    // Obtener siguiente ID (tabla sin SERIAL)
    const maxId = await prisma.usuario.aggregate({
        _max: { id: true }
    });
    const nextId = (maxId._max.id ?? 0) + 1;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const createdUser = await prisma.usuario.create({
        data: {
            id: nextId,
            nombre,
            apellido,
            genero,
            fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
            email,
            password: hashedPassword,
            estado: true,
            rol_id
        }
    });

    const user: AuthUser = {
        id: createdUser.id,
        nombre: createdUser.nombre,
        apellido: createdUser.apellido,
        genero: createdUser.genero,
        fecha_nacimiento: createdUser.fecha_nacimiento,
        email: createdUser.email,
        rol_id: createdUser.rol_id ?? 0,
        estado: createdUser.estado ?? true
    };

    const token = signToken(user);
    return { user, token };
}

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────
export async function loginUser(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = input;

    const row = await prisma.usuario.findFirst({
        where: { email }
    });
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
        fecha_nacimiento: row.fecha_nacimiento,
        email: row.email,
        rol_id: row.rol_id ?? 0,
        estado: row.estado ?? true,
    };

    const token = signToken(user);
    return { user, token };
}

// ──────────────────────────────────────────────
// Obtener perfil por ID
// ──────────────────────────────────────────────
export async function getUserById(id: number): Promise<AuthUser | null> {
    const row = await prisma.usuario.findUnique({
        where: { id }
    });
    if (!row) return null;
    return {
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        genero: row.genero,
        fecha_nacimiento: row.fecha_nacimiento,
        email: row.email,
        rol_id: row.rol_id ?? 0,
        estado: row.estado ?? true
    };
}
