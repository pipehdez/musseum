"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "@/components/ui/carousel";

type PathologyItem = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  images?: string | null;
};

export function FeaturedSlider({ items }: { items: PathologyItem[] }) {
  const [hovering, setHovering] = useState(false);
  return (
    <Carousel
      className="relative"
      options={{ loop: true }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <CarouselContent>
        {items.map((p) => (
          <CarouselItem key={p.id}>
            <FeaturedSlide item={p} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <AutoplayController hovering={hovering} />
    </Carousel>
  );
}

function AutoplayController({ hovering }: { hovering: boolean }) {
  const { embla } = useCarousel();
  useEffect(() => {
    if (!embla || hovering) return;
    const id = window.setInterval(() => {
      embla.scrollNext();
    }, 5000);
    return () => window.clearInterval(id);
  }, [embla, hovering]);
  return null;
}

function FeaturedSlide({ item }: { item: PathologyItem }) {
  const firstImage =
    (item.images || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0];
  return (
    <Link
      href={`/pathology/${item.slug}`}
      className="min-w-[85%] md:min-w-[48%] lg:min-w-[32%] snap-center rounded-2xl overflow-hidden border bg-white shadow-sm group"
    >
      <div className="relative aspect-video">
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
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[rgb(3,133,57)] text-xs font-bold">
            Destacada
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900">{item.name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Sin descripción"}</p>
      </div>
    </Link>
  );
}
