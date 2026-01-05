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
