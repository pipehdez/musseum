"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewUserPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRoles = async () => {
            const res = await fetch("/api/admin/roles");
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, roleId: parseInt(roleId) }),
            });

            if (response.ok) {
                toast.success("Usuario creado exitosamente");
                router.push("/admin/users");
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.error || "Error al crear el usuario");
            }
        } catch (err) {
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/admin/users" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit">
                <ArrowLeft size={16} /> Volver a usuarios
            </Link>

            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Nuevo Usuario</h2>
                <p className="text-slate-500">Registra un nuevo colaborador en el sistema</p>
            </div>

            <Card className="border shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <CardTitle>Información de Usuario</CardTitle>
                            <CardDescription>Completa los datos para crear la cuenta</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol en el Sistema</Label>
                                <Select onValueChange={setRoleId} required>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()} className="capitalize">
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@unisimon.edu.co"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña Temporal</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                    </CardContent>
                    <div className="p-6 border-t bg-slate-50 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 h-10 px-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Crear Usuario
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
