"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/gallery/Lightbox";
import { MENDOZA } from "@/lib/content";

const ALTS = [
  "Mendoza's triple-axle double-deck food trailer at night",
  "Rear stairs leading to the rooftop deck",
  "Service side door with underglow lighting",
  "Close-up of the Mendoza's wrap graphics",
];

/** Flagship build: one large photo + two side photos. `side` picks which MENDOZA photos go on the right. */
export function Spotlight({ side = [1, 2] }: { side?: [number, number] }) {
  const [open, setOpen] = useState<number | null>(null);
  const main = MENDOZA[0]!;

  return (
    <>
      <div className="spotlight reveal">
        <figure className="spotlight-main" tabIndex={0} role="button" aria-label="View flagship photo" onClick={() => setOpen(0)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(0))}>
          <Image src={main.img} alt={ALTS[0]!} width={1308} height={928} sizes="(max-width: 900px) 100vw, 58vw" />
        </figure>
        <div className="spotlight-side">
          {side.map((i) => {
            const p = MENDOZA[i]!;
            return (
              <figure key={p.img} tabIndex={0} role="button" aria-label={`View ${p.title} photo`} onClick={() => setOpen(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(i))}>
                <Image src={p.img} alt={ALTS[i] ?? p.title} width={1248} height={974} sizes="(max-width: 900px) 50vw, 42vw" />
              </figure>
            );
          })}
        </div>
      </div>
      <Lightbox items={MENDOZA} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
