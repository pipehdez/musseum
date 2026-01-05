import { LayoutDashboard, Microscope, Settings, Users, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

async function LogOutButton() {
    return (
        <form action={async () => {
            "use server";
            const { cookies } = await import("next/headers");
            (await cookies()).set("session", "", { expires: new Date(0) });
            redirect("/login");
        }}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                <LogOut size={16} />
                Cerrar Sesión
            </Button>
        </form>
    );
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Microscope className="text-blue-600" />
                        Museo Pathos
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Panel de Administración</p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <LayoutDashboard size={18} />
                        Patologías
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Users size={18} />
                        Usuarios
                    </Link>
                    <Link
                        href="/admin/roles"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Shield size={18} />
                        Roles y Permisos
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Settings size={18} />
                        Configuración
                    </Link>
                </nav>
                <div className="p-4 border-t space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                            {session.user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 truncate">{session.user.name}</p>
                            <p className="text-xs text-slate-500 italic truncate uppercase">{session.user.role}</p>
                        </div>
                    </div>
                    <LogOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
