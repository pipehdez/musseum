"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
    id: number;
    name: string;
    module: string;
}

interface Role {
    id: number;
    name: string;
}

export default function RolePermissionsPage() {
    const params = useParams();
    const roleId = params.id as string;
    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all roles to find the current one (could be a specific API but this works)
                const rolesRes = await fetch("/api/admin/roles");
                const rolesData: Role[] = await rolesRes.json();
                const currentRole = rolesData.find((r) => r.id.toString() === roleId) ?? null;
                setRole(currentRole);

                // Fetch all available permissions
                const permsRes = await fetch("/api/admin/permissions");
                const permsData: Permission[] = await permsRes.json();
                setPermissions(permsData);

                // Fetch currently assigned permissions for this role
                const assignedRes = await fetch(`/api/admin/roles/${roleId}/permissions`);
                const assignedData: number[] = await assignedRes.json();
                setSelectedIds(assignedData);
            } catch (err) {
                toast.error("Error al cargar datos");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [roleId]);

    const handleToggle = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/roles/${roleId}/permissions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissionIds: selectedIds }),
            });

            if (res.ok) {
                toast.success("Permisos actualizados correctamente");
                router.refresh();
            } else {
                toast.error("Error al guardar cambios");
            }
        } catch (err) {
            toast.error("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-slate-500 animate-pulse">Cargando permisos...</p>
            </div>
        );
    }

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/admin/roles" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit">
                <ArrowLeft size={16} /> Volver a roles
            </Link>

            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 uppercase text-[10px]">Configuración</Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
                        Permisos: {role?.name}
                    </h2>
                    <p className="text-slate-500">Selecciona las acciones que este rol tiene permitido realizar</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 px-8"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </div>

            <div className="grid gap-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <Card key={module} className="border shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-xs">
                                <Shield size={14} className="text-blue-600" />
                                Módulo: {module}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {perms.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 outline-none transition-colors cursor-pointer group"
                                        onClick={() => handleToggle(perm.id)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
                                                {perm.name.split(":")[1] || perm.name}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">{perm.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                id={`perm-${perm.id}`}
                                                checked={selectedIds.includes(perm.id)}
                                                className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {role?.name === "superadmin" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                    <Shield className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold">Advertencia: Rol Superadmin</p>
                        <p>Este rol suele tener todos los permisos habilitados por defecto. Ten cuidado al deshabilitar funciones críticas.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
