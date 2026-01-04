import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // superadmin, admin, patologo
});

export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // e.g., 'pathology:create', 'pathology:edit', 'pathology:delete'
  module: text("module").notNull(), // e.g., 'pathology'
});

export const rolePermissions = sqliteTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => roles.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const pathologies = sqliteTable("pathologies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  details: text("details"),
  images: text("images"),
  qrCode: text("qr_code"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
