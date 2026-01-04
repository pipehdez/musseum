import { db } from "@/lib/db";
import { users, roles } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function UsersPage() {
    const allUsers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: roles.name,
            createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios</h2>
                    <p className="text-slate-500">Administra los accesos y roles del sistema</p>
                </div>
                <Link href="/admin/users/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                            <UserIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="flex items-center gap-1 w-fit capitalize border-blue-100 bg-blue-50 text-blue-700">
                                        <Shield size={12} />
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {new Date(user.createdAt || "").toLocaleDateString("es-ES")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
