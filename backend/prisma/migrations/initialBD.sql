-- ============================================================
-- ACTIVOS FIJOS - Migración inicial
-- ============================================================

CREATE TABLE IF NOT EXISTS permiso (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    estado      BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rol (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    rol_id     INT REFERENCES rol(id),
    permiso_id INT REFERENCES permiso(id),
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuario (
    id       INT PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    genero   CHAR(1)      NOT NULL,
    email    VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado   BOOLEAN DEFAULT TRUE,
    rol_id   INT REFERENCES rol(id)
);

CREATE TABLE IF NOT EXISTS marca (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_tipo (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    estado      BOOLEAN DEFAULT TRUE,
    tipo_id     INT REFERENCES tipo(id)
);

CREATE TABLE IF NOT EXISTS tipo_lugar (
    id          INT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS lugar (
    id            INT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(255) NOT NULL,
    tipo_lugar_id INT REFERENCES tipo_lugar(id)
);

CREATE TABLE IF NOT EXISTS activo (
    id             INT PRIMARY KEY,
    codigo         VARCHAR(100) NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    urlImagen      VARCHAR(500) NOT NULL,
    fecha_registro DATE         NOT NULL,
    estado         BOOLEAN DEFAULT TRUE,
    tipo_id        INT REFERENCES tipo(id),
    marca_id       INT REFERENCES marca(id),
    lugar_id       INT REFERENCES lugar(id)
);

CREATE TABLE IF NOT EXISTS estado_movimiento (
    id     INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_activo (
    id     INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_estado_activo (
    id               INT PRIMARY KEY,
    activo_id        INT REFERENCES activo(id),
    estado_activo_id INT REFERENCES estado_activo(id),
    fecha_registro   DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS movimiento (
    id                   INT PRIMARY KEY,
    codigo_movimiento    VARCHAR(10)  NOT NULL,
    fecha_movimiento     DATE         NOT NULL,
    observaciones        VARCHAR(550) NOT NULL,
    estado_movimiento_id INT REFERENCES estado_movimiento(id),
    estado_activo_id     INT REFERENCES estado_activo(id),
    lugar_origen_id      INT REFERENCES lugar(id),
    lugar_destino_id     INT REFERENCES lugar(id),
    usuario_id           INT REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS responsable_lugar (
    id        INT PRIMARY KEY,
    lugar_id  INT REFERENCES lugar(id),
    usuario_id INT REFERENCES usuario(id)
);
