import { db } from "@/lib/db";
import { permissions, rolePermissions } from "@/modules/pathology/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "./auth";

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

export async function hasPermissionModule(module: string, permissionName: string) {
  const session = await getSession();
  if (!session?.user?.roleId) return false;
  const roleId = session.user.roleId!;
  const perm = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(and(eq(permissions.module, module), eq(permissions.name, permissionName)))
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
