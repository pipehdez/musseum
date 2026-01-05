Museo de Patología — Panel administrativo con Next.js, Drizzle y RBAC

## Requisitos
- Node.js 18+
- pnpm o npm
- Elegir proveedor de base de datos: SQLite (local), Postgres (local/nube), MySQL, Supabase (Postgres)

## Configuración
- Copiar `.env.example` a `.env` y ajustar:
  - `DB_PROVIDER`: sqlite | postgres | mysql | supabase
  - `DATABASE_URL`: según proveedor
  - `JWT_SECRET`: cadena segura para firmar sesiones
- Instalar el driver correspondiente:
  - SQLite: `npm i better-sqlite3`
  - Postgres/Supabase: `npm i pg`
  - MySQL: `npm i mysql2`

## Migraciones y Seed
- Ejecutar migración inicial para módulos y permisos
  - `node -e "const Database=require('better-sqlite3'); const fs=require('fs'); const path=require('path'); const sql=fs.readFileSync(path.join('drizzle','0001_add_modules.sql'),'utf8'); const db=new Database(process.env.DATABASE_URL||'sqlite.db'); db.exec(sql); console.log('Migration applied');"`
- Poblar datos básicos (roles, módulo pathology y permisos, superadmin)
  - `node ./src/lib/seed.ts`

## Desarrollo
- `npm run dev`
- El servidor inicia en `http://localhost:3000` (puede usar otro puerto si 3000 está ocupado).
- Rutas que acceden a DB corren en Node.js runtime (no Edge).

## RBAC (Roles y Permisos)
- Roles predefinidos: superadmin, admin, patologo
- Panel de administración (solo superadmin/admin):
  - Módulos y Permisos: `/admin/modules`
  - Usuarios: `/admin/users`
  - Roles y asignaciones: `/admin/roles`
- Módulo de Patologías:
  - Requiere permisos para ver, crear, editar, eliminar
  - Admin/Superadmin tienen acceso total; otros usuarios deben tener permisos específicos

## Comandos útiles
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`

## Despliegue
- Configurar variables de entorno en el proveedor (Vercel/host propio).
- Para Supabase, usar la cadena de conexión de su Postgres administrado en `DATABASE_URL`.
- Asegurar `JWT_SECRET` fuerte en producción.

## Notas
- Si se usan drivers no instalados (pg, mysql2), el proyecto compilará pero necesitará instalación del driver para ejecutarse con ese proveedor.
- Middleware y autenticación usan APIs Edge-safe; acceso a DB solo en Node runtime.
