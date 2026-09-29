# Arranque del Proyecto con Cualquier Proveedor de Base de Datos

Esta guía explica cómo iniciar la aplicación con diferentes proveedores de base de datos usando variables de entorno y Docker Compose, y cómo obtener el proyecto desde GitHub.

## Prerrequisitos
- Git
- Docker y Docker Compose
- Opcional: Node.js 20+ (si vas a ejecutar sin Docker)

## Obtener el proyecto desde GitHub

```bash
git clone https://github.com/<tu-usuario>/MusseonOfPatology.git
cd MusseonOfPatology
```

Si ya tienes el repositorio, asegúrate de que tu carpeta de trabajo sea la raíz del proyecto.

## Variables de entorno soportadas

Las variables se aplican en runtime (no requieren reconstruir la imagen):

- Aplicación:
  - NODE_ENV: production | staging | development (por defecto: production)
  - PORT: puerto de la app (por defecto: 3000)
  - LOG_LEVEL: trace|debug|info|warn|error (por defecto: info)
  - DEBUG: true|false
  - NEXT_PUBLIC_DOMAIN: URL pública de la app (por defecto: http://localhost:3000)
  - JWT_SECRET: clave de firmas (cambiar en producción)
- Base de Datos:
  - DB_PROVIDER: sqlite | postgres | mysql | sqlserver | mongodb
  - DATABASE_URL: cadena de conexión completa; prioritaria sobre host/puerto/usuario/contraseña
  - DB_HOST / DB_PORT / DB_USER / DB_PASSWORD: parámetros de conexión cuando no uses DATABASE_URL
- Entornos:
  - API_BASE_URL / STAGING_API_BASE_URL / PRODUCTION_API_BASE_URL: endpoints por entorno

## Opción A: Docker Compose por proveedor

El proyecto incluye `docker-compose.yml` con servicios para Postgres, MySQL, SQL Server, MongoDB y la aplicación. Usa perfiles para activar el proveedor deseado.

### PostgreSQL

```bash
export DB_PROVIDER=postgres
export DATABASE_URL=postgres://museum:museumpass@postgres:5432/museum
export PORT=3000

docker compose --profile postgres --profile app up -d

# Migraciones (si corresponde)
docker compose exec app npm run migrate
```

### MySQL

```bash
export DB_PROVIDER=mysql
export DATABASE_URL=mysql://museum:museumpass@mysql:3306/museum
export PORT=3000

docker compose --profile mysql --profile app up -d
docker compose exec app npm run migrate
```

### SQL Server

Servicio listo y drivers incluidos en la imagen. Integración del código para `sqlserver` puede requerir ajustes adicionales.

```bash
export DB_PROVIDER=sqlserver
export DATABASE_URL=sqlserver://sa:StrongPass123!@sqlserver:1433/master?encrypt=false
export PORT=3000

docker compose --profile sqlserver --profile app up -d
```

### MongoDB

Servicio listo y driver incluido. La app actual usa SQL (Drizzle); la integración para `mongodb` requiere adaptación del código.

```bash
export DB_PROVIDER=mongodb
export DATABASE_URL=mongodb://museum:museumpass@mongo:27017/museum
export PORT=3000

docker compose --profile mongo --profile app up -d
```

### SQLite (sin servicio externo)

```bash
export DB_PROVIDER=sqlite
export DATABASE_URL=file:/app/data.sqlite
export PORT=3000

docker compose --profile app up -d
```

Notas:
- La app expone el puerto `${PORT}` y define un healthcheck en `/`.
- El directorio `/app/uploads` es un volumen persistente para archivos subidos.

## Opción B: Ejecutar localmente sin Docker (SQLite por defecto)

```bash
npm install
export DB_PROVIDER=sqlite
export DATABASE_URL=sqlite.db
npm run dev
```

Para Postgres/MySQL local, configura `DATABASE_URL` acorde a tu instancia:

```bash
# Postgres local
export DB_PROVIDER=postgres
export DATABASE_URL=postgres://user:pass@localhost:5432/museum
npm run dev
```

## Cambiar de proveedor sin reconstruir

La imagen de la app está preparada para seleccionar proveedor con `DB_PROVIDER` y `DATABASE_URL`. Puedes cambiar variables y reiniciar servicios:

```bash
docker compose down
export DB_PROVIDER=postgres
export DATABASE_URL=postgres://museum:museumpass@postgres:5432/museum
docker compose --profile postgres --profile app up -d
```

## Troubleshooting
- Asegúrate de que el perfil del proveedor está incluido al levantar (p. ej. `--profile postgres`).
- Si el healthcheck falla, verifica `PORT` y que la app inició correctamente (`docker compose logs app`).
- Para `sqlserver` y `mongodb`, se incluyen drivers en la imagen; la integración de la app puede requerir ajustes en `src/lib/db.ts`.

