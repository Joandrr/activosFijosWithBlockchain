-- ============================================================
-- SEED DATA - Activos FICCT
-- ============================================================

-- Roles
INSERT INTO rol (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Auxiliar de Laboratorio', 'Acceso para registro y movimiento de activos en laboratorios'),
(3, 'Administrativo', 'Acceso administrativo para registro y movimiento de activos'),
(4, 'Jefe de Centro Interno', 'Acceso de jefatura para registro y movimiento de activos en centro interno')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

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

-- Asignar permisos básicos a Auxiliar de Laboratorio, Administrativo y Jefe de Centro Interno
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 2, id FROM permiso WHERE nombre IN ('VER_ACTIVOS', 'VER_MOVIMIENTOS', 'CREAR_MOVIMIENTOS', 'VER_MARCAS')
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 3, id FROM permiso WHERE nombre IN ('VER_ACTIVOS', 'VER_MOVIMIENTOS', 'CREAR_MOVIMIENTOS', 'VER_MARCAS')
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 4, id FROM permiso WHERE nombre IN ('VER_ACTIVOS', 'VER_MOVIMIENTOS', 'CREAR_MOVIMIENTOS', 'VER_MARCAS')
ON CONFLICT DO NOTHING;

-- Estados de movimiento
INSERT INTO estado_movimiento (id, nombre) VALUES
(1, 'En Proceso'),
(2, 'Ejecutado'),
(3, 'Anulado')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Estados de activo
INSERT INTO estado_activo (id, nombre) VALUES
(1, 'Disponible'),
(2, 'Baja')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Tipos de lugar
INSERT INTO tipo_lugar (id, nombre, descripcion) VALUES
(1, 'Oficina', 'Oficinas administrativas'),
(2, 'Biblioteca', 'Bibliotecas de la facultad'),
(3, 'Laboratorio', 'Laboratorios académicos y de cómputo'),
(4, 'Aula', 'Aulas de clases ordinarias'),
(5, 'Centro Interno', 'Centros internos de estudiantes o investigación'),
(6, 'Auditorio', 'Auditorios y salas de eventos'),
(7, 'Otros', 'Otros espacios de la facultad')
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
INSERT INTO marca (id, nombre, origen) VALUES
(1, 'Dell', 'USA'),
(2, 'HP', 'USA'),
(3, 'Lenovo', 'China'),
(4, 'LG', 'Corea del Sur'),
(5, 'Toyota', 'Japón')
ON CONFLICT (id) DO NOTHING;
