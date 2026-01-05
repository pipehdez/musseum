import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rolePermissions, permissions } from "@/modules/pathology/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        const role = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(role)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { id } = await params;
        const roleId = parseInt(id);
        const assigned = await db
            .select({ permissionId: rolePermissions.permissionId })
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId));

        return NextResponse.json(assigned.map(a => a.permissionId));
    } catch (error) {
        return NextResponse.json({ error: "Error al cargar permisos del rol" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("POST /api/admin/roles/[id]/permissions", params);
    try {
        const session = await getSession();
        const role = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(role)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { id } = await params;
        const roleId = parseInt(id);
        const { permissionIds } = await request.json(); // Array of numbers

        if (!Array.isArray(permissionIds)) {
            return NextResponse.json({ error: "Formato de permisos inválido" }, { status: 400 });
        }

        // Validate that provided permission IDs exist
        const existingPerms = await db
            .select({ id: permissions.id })
            .from(permissions)
            .where(inArray(permissions.id, permissionIds));
        const existingIds = new Set(existingPerms.map((p) => p.id));
        const invalidIds = permissionIds.filter((id: number) => !existingIds.has(id));
        if (invalidIds.length > 0) {
            return NextResponse.json({ error: "Permisos inexistentes", invalidIds }, { status: 400 });
        }

        // Transactions with better-sqlite3 must be síncronas
        db.transaction((tx) => {
            tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId)).run();
            if (permissionIds.length > 0) {
                tx.insert(rolePermissions).values(
                    permissionIds.map((pid) => ({
                        roleId,
                        permissionId: pid,
                    }))
                ).run();
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync permissions error:", error);
        return NextResponse.json({ error: "Error al sincronizar permisos" }, { status: 500 });
    }
}
