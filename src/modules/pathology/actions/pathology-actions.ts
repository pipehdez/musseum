"use server";

import { db } from "@/lib/db";
import { pathologies } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPathologies() {
    return await db.query.pathologies.findMany({
        orderBy: (p, { desc }) => [desc(p.id)],
    });
}

export async function getPathologyById(id: number) {
    return await db.query.pathologies.findFirst({
        where: eq(pathologies.id, id),
    });
}

export async function getPathologyBySlug(slug: string) {
    return await db.query.pathologies.findFirst({
        where: eq(pathologies.slug, slug),
    });
}

export async function createPathology(data: {
    name: string;
    slug: string;
    description: string;
    details?: string;
    images?: string;
}) {
    const result = await db.insert(pathologies).values({
        ...data,
        updatedAt: new Date().toISOString(),
    }).returning();

    revalidatePath("/admin");
    return result[0];
}

export async function updatePathology(id: number, data: {
    name?: string;
    slug?: string;
    description?: string;
    details?: string;
    images?: string;
}) {
    const result = await db.update(pathologies)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(pathologies.id, id))
        .returning();

    revalidatePath("/admin");
    revalidatePath(`/admin/${id}/edit`);
    revalidatePath(`/pathology/${data.slug || result[0].slug}`);
    return result[0];
}

export async function deletePathology(id: number) {
    await db.delete(pathologies).where(eq(pathologies.id, id));
    revalidatePath("/admin");
}
