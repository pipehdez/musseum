import { getPathologyBySlug } from "@/modules/pathology/actions/pathology-actions";
import { notFound } from "next/navigation";
import { Microscope, MapPin, Calendar, ArrowRight, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface PathologyDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PathologyDetailPage({ params }: PathologyDetailPageProps) {
    const { slug } = await params;
    const pathology = await getPathologyBySlug(slug);

    if (!pathology) {
        notFound();
    }

    const images: string[] = pathology.images ? pathology.images.split(",").map((img: string) => img.trim()) : [];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header / Banner */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                            <Microscope size={24} />
                        </div>
                        <span className="font-bold text-slate-800 hidden sm:inline">Museo de Patología</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Share2 size={18} />
                        </Button>
                        <Link href="/admin">
                            <Button variant="outline" size="sm">Admin</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 mt-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                Departamento de Medicina
                            </Badge>
                            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                                {pathology.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} /> Sección A-12
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} /> Actualizado: {new Date(pathology.updatedAt || "").toLocaleDateString('es-ES')}
                                </div>
                            </div>
                        </div>

                        {/* Images Gallery (Simple) */}
                        {images.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {images.map((img: string, idx: number) => (
                                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border shadow-sm group">
                                        <Image
                                            width={500}
                                            height={500}
                                            src={img}
                                            alt={`${pathology.name} - Imagen ${idx + 1}`}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-video rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
                                <Microscope size={48} className="mb-2 opacity-20" />
                                <p>Sin imágenes disponibles</p>
                            </div>
                        )}

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-xl font-bold text-slate-800">Descripción General</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {pathology.description}
                            </p>
                        </div>

                        <Card className="bg-white border-none shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-xl font-bold text-slate-800">Hallazgos y Detalles Técnicos</h3>
                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {pathology.details || "No se han registrado detalles técnicos adicionales para esta muestra."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Quick Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-blue-900 text-white">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Microscope size={18} /> Museo Pathos
                                </h4>
                                <p className="text-blue-100 text-sm">
                                    Esta muestra forma parte de la colección permanente de la Facultad de Medicina.
                                </p>
                                <div className="pt-4 border-t border-blue-800">
                                    <p className="text-xs text-blue-300">Ubicación física:</p>
                                    <p className="font-medium text-sm">Laboratorio de Patología, Estante 4</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="font-bold text-slate-800">Recurso para Estudiantes</h4>
                                <p className="text-slate-500 text-sm">
                                    Puedes guardar esta página para revisarla más tarde durante tus estudios de anatomía patológica.
                                </p>
                                <Button className="w-full justify-between" variant="secondary">
                                    Guía de Estudio <ArrowRight size={16} />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>

            <footer className="mt-20 border-t py-8 text-center text-slate-400 text-xs">
                &copy; 2026 Universidad de Medicina - Museo de Patología
            </footer>
        </div>
    );
}
