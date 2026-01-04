import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const userResults = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                password: users.password,
                role: roles.name,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.email, email))
            .limit(1);

        const user = userResults[0];

        if (!user) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        const isPasswordCorrect = await comparePassword(password, user.password);

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Create the session
        const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        const session = await encrypt({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            expires,
        });

        // Set the cookie
        (await cookies()).set("session", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return NextResponse.json({ success: true, role: user.role });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Ocurrió un error en el servidor" },
            { status: 500 }
        );
    }
}
