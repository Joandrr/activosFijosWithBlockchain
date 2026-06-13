export interface Marca {
  id: number;
  nombre: string;
  origen: string;
}

export interface Tipo {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface DetalleTipo {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  tipo_id: number | null;
  tipo_nombre?: string;
}

export interface TipoLugar {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Lugar {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_lugar_id: number | null;
  tipo_lugar_nombre?: string;
}

export interface Activo {
  id: number;
  codigo: string;
  nombre: string;
  urlImagen: string;
  fecha_registro: string;
  estado: boolean;
  tipo_id: number;
  marca_id: number;
  lugar_id: number;
  tipo_nombre?: string;
  marca_nombre?: string;
  lugar_nombre?: string;
  contrato_uuid?: string;
  firma_creacion?: string;
  firma_baja?: string;
}

export interface EstadoMovimiento {
  id: number;
  nombre: string;
}

export interface EstadoActivo {
  id: number;
  nombre: string;
}

export interface DetalleEstadoActivo {
  id: number;
  activo_id: number;
  estado_activo_id: number;
  fecha_registro: string;
  activo_nombre?: string;
  estado_activo_nombre?: string;
}

export interface Movimiento {
  id: number;
  codigo_movimiento: string;
  fecha_movimiento: string;
  observaciones: string;
  estado_movimiento_id: number;
  estado_activo_id: number;
  lugar_origen_id: number;
  lugar_destino_id: number;
  usuario_id: number;
  activo_id?: number;
  estado_movimiento_nombre?: string;
  estado_activo_nombre?: string;
  lugar_origen_nombre?: string;
  lugar_destino_nombre?: string;
  usuario_nombre?: string;
  activo_nombre?: string;
  contrato_uuid?: string;
  firma_emisor?: string;
  firma_receptor?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  genero: string;
  fecha_nacimiento?: string;
  email: string;
  estado: boolean;
  rol_id: number | null;
  rol_nombre?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface ResponsableLugar {
  id: number;
  lugar_id: number;
  usuario_id: number;
  lugar_nombre?: string;
  usuario_nombre?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  genero: string;
  rol_id: number;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
