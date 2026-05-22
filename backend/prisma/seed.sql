-- ============================================================
-- SEED DATA - Activos FICCT
-- ============================================================

-- Roles
INSERT INTO rol (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Usuario', 'Acceso básico de consulta y registro')
ON CONFLICT (id) DO NOTHING;

-- Permisos base
INSERT INTO permiso (id, nombre, descripcion, estado) VALUES
(1, 'VER_ACTIVOS', 'Ver lista de activos', TRUE),
(2, 'CREAR_ACTIVOS', 'Crear nuevos activos', TRUE),
(3, 'EDITAR_ACTIVOS', 'Editar activos existentes', TRUE),
(4, 'ELIMINAR_ACTIVOS', 'Eliminar activos', TRUE),
(5, 'VER_MOVIMIENTOS', 'Ver movimientos', TRUE),
(6, 'CREAR_MOVIMIENTOS', 'Crear movimientos', TRUE),
(7, 'VER_USUARIOS', 'Ver usuarios', TRUE),
(8, 'ADMIN_USUARIOS', 'Administrar usuarios', TRUE),
(9, 'VER_MARCAS', 'Ver marcas', TRUE),
(10, 'ADMIN_MARCAS', 'Administrar marcas', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Asignar todos los permisos a Admin
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 1, id FROM permiso
ON CONFLICT DO NOTHING;

-- Asignar permisos básicos a Usuario
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 2, id FROM permiso WHERE nombre IN ('VER_ACTIVOS', 'VER_MOVIMIENTOS', 'VER_MARCAS')
ON CONFLICT DO NOTHING;

-- Estados de movimiento
INSERT INTO estado_movimiento (id, nombre) VALUES
(1, 'Pendiente'),
(2, 'En Proceso'),
(3, 'Completado'),
(4, 'Cancelado')
ON CONFLICT (id) DO NOTHING;

-- Estados de activo
INSERT INTO estado_activo (id, nombre) VALUES
(1, 'Bueno'),
(2, 'Regular'),
(3, 'En Mantenimiento'),
(4, 'Dado de Baja')
ON CONFLICT (id) DO NOTHING;

-- Tipos de lugar
INSERT INTO tipo_lugar (id, nombre, descripcion) VALUES
(1, 'Edificio', 'Edificio universitario'),
(2, 'Laboratorio', 'Laboratorio académico'),
(3, 'Oficina', 'Oficina administrativa'),
(4, 'Aula', 'Aula de clases')
ON CONFLICT (id) DO NOTHING;

-- Tipos de activo
INSERT INTO tipo (id, nombre, descripcion) VALUES
(1, 'Equipo de Cómputo', 'Computadoras, laptops, tablets'),
(2, 'Mobiliario', 'Escritorios, sillas, estantes'),
(3, 'Equipo de Laboratorio', 'Instrumentos científicos'),
(4, 'Vehículo', 'Automóviles y motocicletas'),
(5, 'Electrodoméstico', 'Electrodomésticos de oficina')
ON CONFLICT (id) DO NOTHING;

-- Marcas
INSERT INTO marca (id, nombre, descripcion) VALUES
(1, 'Dell', 'Equipos de cómputo'),
(2, 'HP', 'Equipos de cómputo e impresoras'),
(3, 'Lenovo', 'Equipos de cómputo'),
(4, 'LG', 'Electrodomésticos y monitores'),
(5, 'Toyota', 'Vehículos')
ON CONFLICT (id) DO NOTHING;
