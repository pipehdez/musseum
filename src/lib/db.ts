import * as schema from "@/modules/pathology/db/schema";
const provider = process.env.DB_PROVIDER || "sqlite";
const url = process.env.DATABASE_URL || "sqlite.db";

async function createSqlite() {
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const Database = (await import("better-sqlite3")).default;
  const sqlite = new Database(url);
  return drizzle(sqlite, { schema });
}

async function createPostgres() {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url });
  return (drizzle as any)(pool, { schema });
}

async function createMysql() {
  const { drizzle } = await import("drizzle-orm/mysql2");
  const mysql = await import("mysql2/promise");
  const u = new URL(url);
  const pool = await mysql.createPool({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace("/", ""),
    waitForConnections: true,
    connectionLimit: 10,
  });
  return (drizzle as any)(pool, { schema });
}

async function createDb() {
  if (provider === "sqlite") return await createSqlite();
  if (provider === "postgres" || provider === "supabase") return await createPostgres();
  if (provider === "mysql") return await createMysql();
  return await createSqlite();
}

export const db: any = await createDb();
