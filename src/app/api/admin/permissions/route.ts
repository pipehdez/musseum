import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permissions, modules } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await getSession();
        const role = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(role)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const allPermissions = await db
            .select({
                id: permissions.id,
                name: permissions.name,
                module: modules.name,
            })
            .from(permissions)
            .leftJoin(modules, eq(permissions.moduleId, modules.id));

        return NextResponse.json(allPermissions);
    } catch (error) {
        return NextResponse.json({ error: "No se pudieron cargar los permisos" }, { status: 500 });
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
        const { name, moduleId } = body as { name?: string; moduleId?: number };
        if (!name || !moduleId) {
            return NextResponse.json({ error: "Nombre y módulo son obligatorios" }, { status: 400 });
        }

        const mod = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
        if (mod.length === 0) {
            return NextResponse.json({ error: "Módulo inexistente" }, { status: 400 });
        }

        const created = await db.insert(permissions).values({
            name,
            module: mod[0].name,
            moduleId,
        }).returning();

        return NextResponse.json(created[0]);
    } catch (error: unknown) {
        type SqlError = { code?: string };
        const err = error as SqlError;
        if (err.code === "SQLITE_CONSTRAINT") {
            return NextResponse.json({ error: "El permiso ya existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el permiso" }, { status: 500 });
    }
}
