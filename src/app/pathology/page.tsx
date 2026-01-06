import { getPathologies } from "@/modules/pathology/actions/pathology-actions";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedSlider } from "./featured-slider";

type PathologyItem = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  images?: string | null;
  updatedAt?: string | null;
};

export default async function CatalogPage() {
  const list = await getPathologies({ public: true });
  const items = list as PathologyItem[];

  const withImages = items.filter((p) => (p.images || "").trim().length > 0);
  const featured = (withImages.length > 0 ? withImages : items).slice(0, 6);

  const mostViewed = [...items]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Catálogo de Patologías
            </h1>
            <p className="text-slate-600">
              Descubre las patologías más vistas y destacadas del museo.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-[rgb(3,133,57)] hover:bg-[rgb(3,133,57)]">
              Inicio
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-12">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Star className="text-[rgb(3,133,57)]" size={20} />
              Destacadas
            </h2>
          </div>
          <FeaturedSlider items={featured} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="text-[rgb(3,133,57)]" size={20} />
              Más vistas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostViewed.map((p) => (
              <CardItem key={p.id} item={p} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Todas las patologías</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <CardItem key={p.id} item={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function CardItem({ item }: { item: PathologyItem }) {
  const firstImage = (item.images || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];

  return (
    <Link
      href={`/pathology/${item.slug}`}
      className="group rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-slate-900">{item.name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Sin descripción"}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">/{item.slug}</span>
          <ArrowRight size={16} className="text-[rgb(3,133,57)]" />
        </div>
      </div>
    </Link>
  );
}
