import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Rutas públicas y protegidas
const protectedRoutes = ["/admin"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    const cookie = (await req.cookies).get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Si ya está autenticado y visita /login, redirigir al panel
    if (path === "/login" && session) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
