import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/modules/pathology/db/schema";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
    try {
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
    } catch (error: any) {
        console.error("Create user error:", error);
        if (error.code === "SQLITE_CONSTRAINT") {
            return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });
    }
}
