import { apiPost, apiGet } from "./api";
import type { LoginResult, AuthUser } from "../types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  genero: "M" | "F";
  email: string;
  password: string;
  rol_id: number;
}

export const authService = {
  login: (data: LoginData) => apiPost<LoginResult>("/auth/login", data),
  register: (data: RegisterData) => apiPost<LoginResult>("/auth/register", data),
  profile: () => apiGet<AuthUser>("/auth/profile"),
};
