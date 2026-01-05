import { db } from "@/lib/db";
import { permissions, rolePermissions } from "@/modules/pathology/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "./auth";
import { modules } from "@/modules/pathology/db/schema";

export async function hasPermission(permissionName: string) {
  const session = await getSession();
  if (!session?.user?.roleId) return false;
  const roleId = session.user.roleId!;
  const perm = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, permissionName))
    .limit(1);
  const p = perm[0];
  if (!p) return false;
  const rp = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, p.id)))
    .limit(1);
  return rp.length > 0;
}

export async function hasPermissionModule(moduleName: string, permName?: string) {
  const session = await getSession();
  if (!session?.user?.roleId) return false;
  const roleId = session.user.roleId!;
  if (permName) {
    const perm = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.name, permName))
      .limit(1);
    const p = perm[0];
    if (!p) return false;
    const rp = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, p.id)))
      .limit(1);
    return rp.length > 0;
  }
  const mod = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.name, moduleName))
    .limit(1);
  const m = mod[0];
  if (!m) return false;
  const rp = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(rolePermissions.roleId, roleId), eq(permissions.moduleId, m.id)))
    .limit(1);
  return rp.length > 0;
}
