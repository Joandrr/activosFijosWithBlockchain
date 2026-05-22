import { createService } from "./crud.service";
import type {
  Marca, Tipo, DetalleTipo, TipoLugar, Lugar, Activo,
  Movimiento, Usuario, Rol, Permiso, EstadoMovimiento,
  EstadoActivo, DetalleEstadoActivo, ResponsableLugar,
} from "../types";

export const marcaService = createService<Marca>("/marcas");
export const tipoService = createService<Tipo>("/tipos");
export const detalleTipoService = createService<DetalleTipo>("/detalles-tipo");
export const tipoLugarService = createService<TipoLugar>("/tipos-lugar");
export const lugarService = createService<Lugar>("/lugares");
export const activoService = createService<Activo>("/activos");
export const movimientoService = createService<Movimiento>("/movimientos");
export const estadoMovimientoService = createService<EstadoMovimiento>("/estados-movimiento");
export const estadoActivoService = createService<EstadoActivo>("/estados-activo");
export const detalleEstadoActivoService = createService<DetalleEstadoActivo>("/detalles-estado-activo");
export const usuarioService = createService<Usuario>("/usuarios");
export const rolService = createService<Rol>("/roles");
export const permisoService = createService<Permiso>("/permisos");
export const responsableLugarService = createService<ResponsableLugar>("/responsables-lugar");
export { createService } from "./crud.service";
