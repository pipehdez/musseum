import { db } from "@/lib/db";
import { modules, permissions } from "@/modules/pathology/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings2, Plus } from "lucide-react";
import { getSession } from "@/lib/auth";

async function getData() {
  const mods = await db.select().from(modules);
  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      moduleId: permissions.moduleId,
    })
    .from(permissions);
  return { mods, perms };
}

export default async function ModulesPage() {
  const { mods, perms } = await getData();

  async function createModule(formData: FormData) {
    "use server";
    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (!session || !["superadmin", "admin"].includes(role)) return;
    const name = String(formData.get("moduleName") || "").trim();
    if (!name) return;
    await db.insert(modules).values({ name }).onConflictDoNothing();
  }

  async function createPermission(formData: FormData) {
    "use server";
    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (!session || !["superadmin", "admin"].includes(role)) return;
    const name = String(formData.get("permissionName") || "").trim();
    const moduleIdStr = String(formData.get("permissionModuleId") || "").trim();
    const moduleId = parseInt(moduleIdStr);
    if (!name || !moduleId) return;
    const mod = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (mod.length === 0) return;
    await db.insert(permissions).values({
      name,
      module: mod[0].name,
      moduleId,
    }).onConflictDoNothing();
  }

  const permsByModule = mods.reduce<Record<number, { id: number; name: string }[]>>((acc, m) => {
    acc[m.id] = perms.filter((p) => p.moduleId === m.id).map((p) => ({ id: p.id, name: p.name }));
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="text-blue-600" />
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Módulos y Permisos</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Crear Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createModule} className="flex items-center gap-3">
              <Input name="moduleName" placeholder="Ej: pathology" />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Crear
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Crear Permiso</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createPermission} className="grid grid-cols-3 gap-3">
              <Input name="permissionName" placeholder="Ej: pathology:view" className="col-span-2" />
              <select name="permissionModuleId" className="border rounded-md px-3 py-2 text-sm">
                <option value="">Selecciona módulo</option>
                {mods.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
              <div className="col-span-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">
                  <Plus className="mr-2 h-4 w-4" /> Crear Permiso
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {mods.map((m) => (
          <Card key={m.id} className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-none">{m.name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permsByModule[m.id]?.length ? (
                  permsByModule[m.id].map((p) => (
                    <Badge key={p.id} variant="secondary" className="font-mono text-xs">{p.name}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sin permisos</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
