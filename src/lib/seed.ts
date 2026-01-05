import { db } from "./db";
import { roles, permissions, rolePermissions, users, modules } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

async function main() {
    console.log("Seeding database...");

    // 1. Create Roles
    await db.insert(roles).values([
        { name: "superadmin" },
        { name: "admin" },
        { name: "patologo" },
    ]).onConflictDoNothing();

    const [saRole] = await db.select().from(roles).where(eq(roles.name, "superadmin")).limit(1);

    // 2. Create Modules
    await db.insert(modules).values([
        { name: "pathology" },
    ]).onConflictDoNothing();

    const [pathologyModule] = await db.select().from(modules).where(eq(modules.name, "pathology")).limit(1);

    // 3. Create Permissions
    await db.insert(permissions).values([
        { name: "pathology:create", module: "pathology", moduleId: pathologyModule.id },
        { name: "pathology:edit", module: "pathology", moduleId: pathologyModule.id },
        { name: "pathology:delete", module: "pathology", moduleId: pathologyModule.id },
        { name: "pathology:view", module: "pathology", moduleId: pathologyModule.id },
    ]).onConflictDoNothing();

    const allPerms = await db.select().from(permissions);

    // 4. Link Permissions to Superadmin
    for (const perm of allPerms) {
        await db.insert(rolePermissions).values({
            roleId: saRole.id,
            permissionId: perm.id,
        }).onConflictDoNothing();
    }

    // 5. Create Initial Superadmin User
    const hashedPassword = await hashPassword("password123");

    // Check if superadmin exists
    const existing = await db.select().from(users).where(eq(users.email, "admin@museum.com")).limit(1);

    if (existing.length === 0) {
        await db.insert(users).values({
            name: "Super Admin",
            email: "admin@museum.com",
            password: hashedPassword,
            roleId: saRole.id,
        });
    } else {
        await db.update(users)
            .set({ password: hashedPassword, roleId: saRole.id })
            .where(eq(users.email, "admin@museum.com"));
    }

    console.log("Seeding completed successfully.");
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
