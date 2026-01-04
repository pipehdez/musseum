import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/modules/pathology/db/schema";

export async function GET() {
    try {
        const allRoles = await db.select().from(roles);
        return NextResponse.json(allRoles);
    } catch (error) {
        return NextResponse.json({ error: "No se pudieron cargar los roles" }, { status: 500 });
    }
}
