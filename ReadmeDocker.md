
## 🛠️ Requisitos Previos
* Tener instalado **Docker Desktop** en tu equipo (incluye Docker Compose).
* Asegurarte de que los puertos `8080`, `3000`, `5433` y `8545` no estén ocupados por otros servicios locales.

---

## 🚀 Comandos Rápidos

### 1. Levantar todo el entorno (Base de Datos, Backend, Frontend)
Para compilar las imágenes e iniciar los contenedores en segundo plano (modo background):
```bash
docker compose up --build -d
```

### 2. Ver el estado de los contenedores
Para confirmar cuáles contenedores están activos y en qué puertos están escuchando:
```bash
docker compose ps
```

### 3. Ver los logs (Registro de actividad)
Para monitorear lo que está sucediendo en todos los contenedores en tiempo real (útil para ver las migraciones e inicio):
```bash
docker compose logs -f
```

O si solo quieres ver los logs de un servicio específico (ej. el backend):
```bash
docker compose logs -f backend
```

### 4. Apagar los contenedores
Para detener y apagar todos los contenedores del entorno:
```bash
docker compose down
```

### 5. Reiniciar o limpiar la base de datos (Reset completo)
Si necesitas borrar los datos almacenados en el volumen y empezar con una base de datos limpia (volverá a ejecutar las migraciones y el seed inicial):
```bash
docker compose down -v
```

---

## 🔑 Credenciales para pgAdmin (Acceso Externo)

La base de datos PostgreSQL está expuesta al host en el puerto estándar `5432`. Puedes conectarte desde tu pgAdmin local registrando un nuevo servidor con estos datos:

| Parámetro | Valor |
| :--- | :--- |
| **Host name/address** | `localhost` |
| **Port** | `5433` |
| **Maintenance database** | `activosFICCT` |
| **Username** | `postgres` |
| **Password** | `postgres_password` | ASI ES LA CONTRASEÑA postgres_password 

---admin@ficct.edu.bo / admin123 creado

## 🌐 Servicios Disponibles al Iniciar
Una vez que el entorno esté corriendo (`docker compose up -d`), puedes acceder a:

* **Frontend (React)**: [http://localhost:8080](http://localhost:8080)
* **Backend (API Express)**: [http://localhost:3000](http://localhost:3000)
  * Ruta de estado de salud: [http://localhost:3000/health](http://localhost:3000/health)
* **Blockchain (Hardhat Local Node)**: `http://localhost:8545`
  * Este nodo simula una red EVM local. Provee 20 cuentas de prueba pre-financiadas con 10000 ETH cada una (visibles en los logs del contenedor `activos_blockchain`). Puedes conectar billeteras de desarrollo (como MetaMask) usando esta URL RPC y el Chain ID `31337`.

---

## 👤 Usuario de Acceso Inicial (Semilla)
Al levantarse la base de datos, se creará automáticamente la estructura de tablas y un usuario administrador de pruebas:
* **Email**: `admin@ficct.edu.bo`
* **Contraseña**: `admin123`
