import { db } from "@/lib/db";
import { roles, rolePermissions } from "@/modules/pathology/db/schema";
import { count, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Shield, Settings2, Trash2, Key } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreateRoleDialog } from "./create-role-dialog";

export default async function RolesPage() {
    // Get roles and count of permissions for each
    const allRoles = await db.select().from(roles);

    // For each role, we'll fetch the permission count separately or use a join (SQLite count can be tricky with many-to-many in one query without group by)
    const rolesWithCounts = await Promise.all(allRoles.map(async (role: { id: number; name: string }) => {
        const [permCount] = await db
            .select({ value: count() })
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, role.id));

        return {
            ...role,
            permissionCount: permCount.value
        };
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Roles y Permisos</h2>
                    <p className="text-slate-500">Define qué puede hacer cada tipo de usuario en el sistema</p>
                </div>
                <CreateRoleDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Roles Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{allRoles.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[250px]">Nombre del Rol</TableHead>
                            <TableHead>Permisos Asignados</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rolesWithCounts.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Shield size={16} />
                                        </div>
                                        <span className="font-semibold text-slate-900 capitalize">{role.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none">
                                        <Key size={12} className="mr-1" />
                                        {role.permissionCount} permisos
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/roles/${role.id}/permissions`}>
                                            <Button variant="outline" size="sm" className="gap-2 h-8">
                                                <Settings2 size={14} />
                                                Gestionar Permisos
                                            </Button>
                                        </Link>
                                        {role.name !== "superadmin" && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
