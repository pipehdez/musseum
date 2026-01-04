"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPathology, updatePathology } from "../actions/pathology-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    slug: z.string().min(2, {
        message: "El slug debe tener al menos 2 caracteres.",
    }).regex(/^[a-z0-z0-9-]+$/, {
        message: "El slug solo puede contener letras minúsculas, números y guiones.",
    }),
    description: z.string().min(10, {
        message: "La descripción debe tener al menos 10 caracteres.",
    }),
    details: z.string().optional(),
    images: z.string().optional(),
});

interface PathologyFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function PathologyForm({ initialData, isEditing = false }: PathologyFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            slug: "",
            description: "",
            details: "",
            images: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (isEditing) {
                await updatePathology(initialData.id, values);
                toast.success("Patología actualizada con éxito");
            } else {
                await createPathology(values);
                toast.success("Patología creada con éxito");
            }
            router.push("/admin");
        } catch (error) {
            toast.error("Hubo un error al procesar la solicitud");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Auto-generate slug from name if not editing
    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (!isEditing) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            form.setValue("slug", slug);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={14} /> Volver al listado
                </Link>
                <h2 className="text-2xl font-bold text-slate-900">
                    {isEditing ? "Editar Patología" : "Nueva Patología"}
                </h2>
                <p className="text-slate-500">
                    Completa los campos para {isEditing ? "actualizar" : "registrar"} la información.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="col-span-2 sm:col-span-1">
                                    <FormLabel>Nombre de la Patología</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Carcinoma de Células Renales"
                                            {...field}
                                            onChange={onNameChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem className="col-span-2 sm:col-span-1">
                                    <FormLabel>URL (Slug)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="carcinoma-celulas-renales" {...field} />
                                    </FormControl>
                                    <FormDescription>Identificador único para el QR</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción Corta</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Resumen breve de la patología..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detalles Técnicos / Hallazgos</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Descripción detallada de los hallazgos patológicos..."
                                        className="min-h-[150px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URLs de Imágenes</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://ejemplo.com/imagen.jpg (Separadas por coma)" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Por ahora, ingresa URLs directas a las imágenes.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Actualizar Patología" : "Guardar Patología"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
