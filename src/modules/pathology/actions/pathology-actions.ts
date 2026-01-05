"use server";

import { db } from "@/lib/db";
import { pathologies, users, roles } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function getPathologies() {
    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (!["superadmin", "admin"].includes(role)) {
        const allowed = await hasPermission("pathology:view");
        if (!allowed) return [];
    }
    return await db
        .select({
            id: pathologies.id,
            name: pathologies.name,
            slug: pathologies.slug,
            description: pathologies.description,
            createdAt: pathologies.createdAt,
            creatorName: users.name,
            creatorRole: roles.name,
        })
        .from(pathologies)
        .leftJoin(users, eq(pathologies.createdBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .orderBy(desc(pathologies.id));
}

export async function getPathologyById(id: number) {
    return await db.query.pathologies.findFirst({
        where: eq(pathologies.id, id),
    });
}

export async function getPathologyBySlug(slug: string) {
    // const session = await getSession();
    // const role = session?.user?.role ?? "";
    // if (!["superadmin", "admin"].includes(role)) {
    //     const allowed = await hasPermission("pathology:view");
    //     if (!allowed) return null;
    // }
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
    const session = await getSession();
    const role = session?.user?.role ?? "";
    const allowed = ["superadmin", "admin"].includes(role) || await hasPermission("pathology:create");
    if (!allowed) {
        throw new Error("No autorizado");
    }

    const result = await db.insert(pathologies).values({
        ...data,
        createdBy: session?.user?.id,
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
    const session = await getSession();
    const role = session?.user?.role ?? "";
    const allowed = ["superadmin", "admin"].includes(role) || await hasPermission("pathology:edit");
    if (!allowed) {
        throw new Error("No autorizado");
    }
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
    const session = await getSession();
    const role = session?.user?.role ?? "";
    const allowed = ["superadmin", "admin"].includes(role) || await hasPermission("pathology:delete");
    if (!allowed) {
        throw new Error("No autorizado");
    }
    await db.delete(pathologies).where(eq(pathologies.id, id));
    revalidatePath("/admin");
}
