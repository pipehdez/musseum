"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselContextValue = {
  embla: EmblaCarouselType | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) return { embla: undefined, scrollPrev: () => {}, scrollNext: () => {} };
  return ctx;
}

function Carousel({
  className,
  options,
  children,
  onMouseEnter,
  onMouseLeave,
}: {
  className?: string;
  options?: EmblaOptionsType;
  children: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: true, ...options });
  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <CarouselContext.Provider value={{ embla, scrollPrev, scrollNext }}>
      <div className={cn("relative", className)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div className="overflow-hidden" ref={emblaRef}>
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex gap-4", className)}>{children}</div>;
}

function CarouselItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("min-w-[85%] md:min-w-[48%] lg:min-w-[32%]", className)}>{children}</div>;
}

function CarouselPrevious({ className }: { className?: string }) {
  const { scrollPrev } = useCarousel();
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={scrollPrev}
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-slate-900 rounded-full shadow-md",
        className
      )}
    >
      <ChevronLeft />
    </Button>
  );
}

function CarouselNext({ className }: { className?: string }) {
  const { scrollNext } = useCarousel();
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={scrollNext}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-slate-900 rounded-full shadow-md",
        className
      )}
    >
      <ChevronRight />
    </Button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
export { useCarousel };
