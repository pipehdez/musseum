"use server";

import { db } from "@/lib/db";
import { pathologies, users, roles, pathologyImages } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function getPathologies(opts?: { public?: boolean }) {
    const isPublic = Boolean(opts?.public);
    if (!isPublic) {
        const session = await getSession();
        const role = session?.user?.role ?? "";
        if (!["superadmin", "admin"].includes(role)) {
            const allowed = await hasPermission("pathology:view");
            if (!allowed) return [];
        }
    }
    const rows = await db
        .select({
            id: pathologies.id,
            name: pathologies.name,
            slug: pathologies.slug,
            description: pathologies.description,
            images: pathologies.images,
            createdAt: pathologies.createdAt,
            creatorName: users.name,
            creatorRole: roles.name,
            imageUrl: pathologyImages.url,
        })
        .from(pathologies)
        .leftJoin(users, eq(pathologies.createdBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .leftJoin(pathologyImages, eq(pathologyImages.pathologyId, pathologies.id))
        .orderBy(desc(pathologies.id));

    const byId = new Map<number, {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        images: string | null;
        createdAt: string | null;
        creatorName: string | null;
        creatorRole: string | null;
    }>();

    for (const r of rows) {
        const existing = byId.get(r.id);
        const base = existing ?? {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description ?? null,
            images: r.images ?? "",
            createdAt: r.createdAt ?? null,
            creatorName: r.creatorName ?? null,
            creatorRole: r.creatorRole ?? null,
        };
        const parts = (base.images || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (r.imageUrl) {
            parts.push(r.imageUrl);
        }
        const dedup = Array.from(new Set(parts));
        base.images = dedup.join(",");
        byId.set(r.id, base);
    }
    return Array.from(byId.values());
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

    const created = result[0];
    const urls = (data.images || "").split(",").map(s => s.trim()).filter(Boolean);
    if (urls.length > 0) {
        await db.insert(pathologyImages).values(
            urls.map((u) => ({ pathologyId: created.id, url: u }))
        );
    }

    revalidatePath("/admin");
    return created;
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

    const updated = result[0];
    const urls = (data.images || "").split(",").map(s => s.trim()).filter(Boolean);
    if (urls.length > 0) {
        await db.delete(pathologyImages).where(eq(pathologyImages.pathologyId, id));
        await db.insert(pathologyImages).values(
            urls.map((u) => ({ pathologyId: id, url: u }))
        );
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/${id}/edit`);
    revalidatePath(`/pathology/${data.slug || updated.slug}`);
    return updated;
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
