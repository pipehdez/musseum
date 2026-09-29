# syntax=docker/dockerfile:1

# Imagen base: Node.js sobre Alpine para ligereza y seguridad
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

# Configuración base común
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Dependencias del sistema necesarias para módulos nativos (p.ej. better-sqlite3)
# y para manejo de señales limpias (tini) y health checks (curl)
RUN apk add --no-cache \
  libc6-compat \
  python3 \
  make \
  g++ \
  bash \
  curl \
  tini \
  git

################################################################################
# Stage: deps
# - Instala dependencias del proyecto
# - Añade drivers opcionales para SQL Server y MongoDB (sin necesidad de modificar package.json)
################################################################################
FROM base AS deps
ARG REPO_URL=https://github.com/<tu-usuario>/MusseonOfPatology.git
ARG REPO_REF=main
RUN git clone --depth 1 -b ${REPO_REF} ${REPO_URL} /src
WORKDIR /src
RUN npm ci
# Drivers adicionales opcionales para compatibilidad extendida
# Nota: Estos se instalan sin guardar en package.json para permitir una imagen única
RUN npm install --no-save mssql mongodb

################################################################################
# Stage: builder
# - Copia el código y construye la aplicación (Next.js)
################################################################################
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /src /app
COPY --from=deps /src/node_modules /app/node_modules
RUN npm run build

################################################################################
# Stage: runner
# - Imagen final optimizada para producción
# - Configura usuario no root, healthcheck, señales y variables de entorno
################################################################################
FROM base AS runner

# Usuario no root por seguridad
USER node

# Directorio para cargas de imagen (persistente)
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
VOLUME ["/app/uploads"]

# Copia artefactos de build y dependencias
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

################################################################################
# Variables de entorno y configuración por entorno
# - Ajustables en runtime (sin reconstruir la imagen)
################################################################################
# Comunes de aplicación
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    DEBUG=false \
    NEXT_PUBLIC_DOMAIN=http://localhost:3000 \
    JWT_SECRET=change_me

# Configuración de Base de Datos (parametrizada)
# DB_PROVIDER: sqlite | postgres | mysql | sqlserver | mongodb
# DATABASE_URL: cadena de conexión completa (se prioriza sobre host/puerto)
ENV DB_PROVIDER=sqlite \
    DATABASE_URL=file:/app/data.sqlite \
    DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=user \
    DB_PASSWORD=pass

# Variables específicas por entorno (URLs de API, niveles de log, etc.)
ENV API_BASE_URL=http://localhost:3000 \
    STAGING_API_BASE_URL=http://staging.example.com \
    PRODUCTION_API_BASE_URL=https://api.example.com

# Healthcheck básico sobre el puerto configurado
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/ || exit 1

# Exponer puerto de la app
EXPOSE ${PORT}

# Manejo adecuado de señales para shutdowns limpios
ENTRYPOINT ["/sbin/tini","--"]
CMD ["npm","run","start"]

################################################################################
# Documentación interna
# - Variables de entorno soportadas (con valores por defecto arriba)
#   - NODE_ENV: production | staging | development
#   - PORT: 3000
#   - LOG_LEVEL: trace|debug|info|warn|error (por defecto: info)
#   - DEBUG: true|false
#   - NEXT_PUBLIC_DOMAIN: URL pública base de la app (p.ej. https://app.tu-dominio.com)
#   - JWT_SECRET: clave para firmas (cambiar en producción)
#   - DB_PROVIDER: sqlite | postgres | mysql | sqlserver | mongodb
#   - DATABASE_URL: cadena de conexión completa (si se especifica, se ignora DB_HOST/PORT/USER/PASSWORD)
#   - DB_HOST / DB_PORT / DB_USER / DB_PASSWORD: parámetros de conexión
#   - API_BASE_URL / STAGING_API_BASE_URL / PRODUCTION_API_BASE_URL: endpoints por entorno
#
# - Ejemplos de uso:
#   # SQLite (por defecto)
#   docker run -d --name museo-sqlite \
#     -e DB_PROVIDER=sqlite \
#     -e DATABASE_URL=file:/app/data.sqlite \
#     -e PORT=3000 \
#     -p 3000:3000 \
#     -v uploads:/app/uploads \
#     imagen-museo:latest
#
#   # PostgreSQL
#   docker run -d --name museo-pg \
#     -e DB_PROVIDER=postgres \
#     -e DATABASE_URL=postgres://user:pass@db-host:5432/dbname \
#     -e PORT=3000 \
#     -p 3000:3000 \
#     -v uploads:/app/uploads \
#     imagen-museo:latest
#
#   # MySQL
#   docker run -d --name museo-mysql \
#     -e DB_PROVIDER=mysql \
#     -e DATABASE_URL=mysql://user:pass@db-host:3306/dbname \
#     -e PORT=3000 \
#     -p 3000:3000 \
#     -v uploads:/app/uploads \
#     imagen-museo:latest
#
#   # SQL Server
#   docker run -d --name museo-sqlserver \
#     -e DB_PROVIDER=sqlserver \
#     -e DATABASE_URL=sqlserver://user:pass@db-host:1433/dbname \
#     -e PORT=3000 \
#     -p 3000:3000 \
#     -v uploads:/app/uploads \
#     imagen-museo:latest
#
#   # MongoDB
#   docker run -d --name museo-mongo \
#     -e DB_PROVIDER=mongodb \
#     -e DATABASE_URL=mongodb://user:pass@db-host:27017/dbname \
#     -e PORT=3000 \
#     -p 3000:3000 \
#     -v uploads:/app/uploads \
#     imagen-museo:latest
#
# - Notas:
#   - La aplicación ya soporta SQLite/Postgres/MySQL. Para SQL Server/MongoDB se incluyen drivers
#     en la imagen (mssql, mongodb); asegúrate de que el código utilice DB_PROVIDER y DATABASE_URL
#     adecuadamente antes de activar esos proveedores.
#   - Cambiar las variables de entorno no requiere reconstruir la imagen; basta con ajustar -e en docker run.
################################################################################
