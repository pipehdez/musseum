import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/modules/pathology/db/schema";
import { hashPassword, getSession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getSession();
        const role = session?.user?.role ?? "";
        if (!session || !["superadmin", "admin"].includes(role)) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
        const body = await request.json();
        const { name, email, password, roleId } = body;

        if (!name || !email || !password || !roleId) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            roleId,
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Create user error:", error);
        type SqlError = { code?: string };
        const err = error as SqlError;
        if (err.code === "SQLITE_CONSTRAINT") {
            return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });
    }
}
