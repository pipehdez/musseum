import { LayoutDashboard, Microscope, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Users size={18} />
                        Usuarios
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Settings size={18} />
                        Configuración
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Admin</p>
                            <p className="text-xs text-slate-500 italic">Facultad de Medicina</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
