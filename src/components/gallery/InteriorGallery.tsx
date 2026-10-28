"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import { Lightbox } from "@/components/gallery/Lightbox";
import type { Photo } from "@/lib/content";

/** Interior photo grid. Full gallery uses a 3-across / 2-wide rhythm; previews are 3 across. */
export function InteriorGallery({ items, rhythm = false }: { items: Photo[]; rhythm?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="interior-grid">
        {items.map((p, i) => {
          const wide = rhythm && (i % 5 === 3 || i % 5 === 4);
          return (
            <button key={p.img} type="button" className={clsx("interior reveal", wide && "wide")} onClick={() => setOpen(i)} aria-label={`View ${p.title} photo`}>
              <Image src={p.img} alt={p.title} width={820} height={428} sizes={wide ? "(max-width: 900px) 50vw, 50vw" : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"} />
              <span className="cap">
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
