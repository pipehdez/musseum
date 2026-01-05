import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { modules } from "@/modules/pathology/db/schema";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (!session || !["superadmin", "admin"].includes(role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const all = await db.select().from(modules);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los módulos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (!session || !["superadmin", "admin"].includes(role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await request.json();
    const { name } = body as { name?: string };
    if (!name) {
      return NextResponse.json({ error: "El nombre del módulo es obligatorio" }, { status: 400 });
    }
    const result = await db.insert(modules).values({ name }).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    type SqlError = { code?: string };
    const err = error as SqlError;
    if (err.code === "SQLITE_CONSTRAINT") {
      return NextResponse.json({ error: "El módulo ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el módulo" }, { status: 500 });
  }
}
