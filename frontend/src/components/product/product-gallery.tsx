"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Media } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: Media[];
  name: string;
  /** Shown over the main image, e.g. a sale badge. */
  badge?: React.ReactNode;
};

/**
 * Swipeable image track (scroll snap) with thumbnails on larger screens
 * and hover zoom on devices with a mouse.
 */
export function ProductGallery({ images, name, badge }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => setActive(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-2xl bg-muted" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="hidden gap-3 md:flex md:w-20 md:flex-col" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Show image ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition",
                index === active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image.urls.thumb ?? image.urls.original} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${name} images`}
        >
          {images.map((image, index) => (
            <ZoomableImage key={image.id} image={image} alt={index === 0 ? image.alt || name : ""} priority={index === 0} />
          ))}
        </div>

        {badge && <div className="pointer-events-none absolute top-4 left-4">{badge}</div>}

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.id}
                className={cn(
                  "h-1.5 rounded-full bg-white/90 shadow transition-all",
                  index === active ? "w-5" : "w-1.5 bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ZoomableImage({ image, alt, priority }: { image: Media; alt: string; priority: boolean }) {
  const [origin, setOrigin] = useState<string | null>(null);

  return (
    <div
      className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-muted [@media(hover:hover)]:cursor-zoom-in"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <Image
        src={image.urls.large ?? image.urls.original}
        alt={alt}
        fill
        preload={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 ease-out"
        style={origin ? { transform: "scale(2)", transformOrigin: origin } : undefined}
      />
    </div>
  );
}
