import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        const userRole = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(userRole)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
        }

        const result = await db.update(roles)
            .set({ name })
            .where(eq(roles.id, id))
            .returning();

        return NextResponse.json(result[0]);
    } catch (err) {
        return NextResponse.json({ error: "Error al actualizar el rol" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        const userRole = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(userRole)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // Check if it's protected (e.g., superadmin)
        const role = await db.query.roles.findFirst({ where: eq(roles.id, id) });
        if (role?.name === "superadmin") {
            return NextResponse.json({ error: "No se puede eliminar el rol superadmin" }, { status: 403 });
        }

        await db.delete(roles).where(eq(roles.id, id));
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Error al eliminar el rol" }, { status: 500 });
    }
}
