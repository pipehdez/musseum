import { getPathologies } from "@/modules/pathology/actions/pathology-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ExternalLink, QrCode } from "lucide-react";
import Link from "next/link";
import { PathologyQRCode } from "@/components/qr-code";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
    const pathologies = await getPathologies();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Patologías</h2>
                    <p className="text-slate-500">Administra el catálogo de patologías del museo.</p>
                </div>
                <Link href="/admin/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Patología
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patologías</CardTitle>
                        <MicroscopeIcon className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pathologies.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Sincronizado con la base de datos</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b">
                    <CardTitle>Listado</CardTitle>
                    <CardDescription>
                        Visualiza y descarga los códigos QR para cada patología.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Slug (URL)</TableHead>
                                <TableHead>QR</TableHead>
                                <TableHead>Autor</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pathologies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No hay patologías registradas. Comienza creando una nueva.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pathologies.map((pathology: any) => (
                                    <TableRow key={pathology.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium text-slate-500">#{pathology.id}</TableCell>
                                        <TableCell className="font-semibold text-slate-800">{pathology.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                /{pathology.slug}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <QrPreviewDialog pathology={pathology} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{pathology.creatorName || "Sistema"}</span>
                                                <span className="text-[10px] uppercase text-slate-500">{pathology.creatorRole || "Admin"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/pathology/${pathology.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon" title="Ver en vivo">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/${pathology.id}/edit`}>
                                                    <Button variant="ghost" size="icon" title="Editar">
                                                        <Plus className="h-4 w-4 rotate-45" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// Inline helper for QR Preview
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function QrPreviewDialog({ pathology }: { pathology: any }) {
    // Determine the public URL (mocked for now, but should use environment variable in production)
    const publicUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/pathology/${pathology.slug}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                    <QrCode className="h-4 w-4" /> Ver QR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Código QR: {pathology.name}</DialogTitle>
                    <DialogDescription>
                        Este código QR redirige a la página de detalles de la patología.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6">
                    <PathologyQRCode
                        value={publicUrl}
                        fileName={`qr-${pathology.slug}`}
                    />
                    <p className="mt-4 text-xs text-slate-400 font-mono text-center break-all">
                        {publicUrl}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MicroscopeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 18h8" />
            <path d="M3 22h18" />
            <path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 14h2" />
            <path d="M9 12a2 2 0 1 1-4 0V6a2 2 0 1 1 4 0v6Z" />
            <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
    );
}
