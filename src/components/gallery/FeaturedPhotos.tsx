"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/gallery/Lightbox";
import type { Photo } from "@/lib/content";

/** Two side-by-side photos for a featured build; tap to open full size. */
export function FeaturedPhotos({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="featured-photos reveal" data-delay="3">
        {photos.map((p, i) => (
          <button key={p.img} type="button" onClick={() => setOpen(i)} aria-label={`View ${p.title} photo`}>
            <Image src={p.img} alt={`${p.title} — ${p.text}`} width={720} height={540} sizes="(max-width: 900px) 50vw, 25vw" />
          </button>
        ))}
      </div>
      <Lightbox items={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
