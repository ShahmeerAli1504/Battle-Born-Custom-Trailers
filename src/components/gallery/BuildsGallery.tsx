"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Lightbox } from "@/components/gallery/Lightbox";
import { BUILD_CATEGORIES, type Build, type BuildCategory } from "@/lib/content";

type Filter = "all" | BuildCategory;

/** Completed-builds grid with category filters + lightbox that pages through the visible set. */
export function BuildsGallery({ builds, filters = false, featureFirst = false }: { builds: Build[]; filters?: boolean; featureFirst?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: builds.length };
    for (const b of builds) c[b.cat] = (c[b.cat] ?? 0) + 1;
    return c;
  }, [builds]);

  const visible = filter === "all" ? builds : builds.filter((b) => b.cat === filter);
  const options: { key: Filter; label: string }[] = [
    { key: "all", label: "All builds" },
    ...(Object.keys(BUILD_CATEGORIES) as BuildCategory[]).filter((k) => counts[k]).map((k) => ({ key: k, label: BUILD_CATEGORIES[k].filter })),
  ];

  return (
    <>
      {filters && (
        <div className="filters" role="toolbar" aria-label="Filter builds">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              className="filter-btn"
              aria-pressed={filter === o.key}
              onClick={() => {
                setFilter(o.key);
                setOpen(null);
              }}
            >
              {o.label}
              <span className="count">{counts[o.key] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      <div className={clsx("builds-grid", featureFirst && filter === "all" && "feature-first")}>
        {visible.map((b, i) => (
          <button key={b.img} type="button" className="build reveal" onClick={() => setOpen(i)} aria-label={`View ${b.title} photo`}>
            <span className="tag">{BUILD_CATEGORIES[b.cat].tag}</span>
            <span className="zoom-hint" aria-hidden="true">
              <Icon name="zoom" strokeWidth={2.4} />
            </span>
            <span className="ph block">
              <Image
                src={b.img}
                alt={`${b.title} — ${b.text}`}
                width={800}
                height={595}
                sizes={featureFirst && i === 0 && filter === "all" ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"}
              />
            </span>
            <span className="cap">
              <strong>{b.title}</strong>
              <span>{b.text}</span>
            </span>
          </button>
        ))}
      </div>

      <Lightbox items={visible} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
