"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/lib/content";

type Props = {
  items: Photo[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/** Full-screen photo viewer: arrows, Esc, swipe, focus return. */
export function Lightbox({ items, index, onIndex, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null && items.length > 0;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, onClose]);

  if (!open || index === null) return null;
  const item = items[index];
  if (!item) return null;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <span className="lb-count">
        {index + 1} / {items.length}
      </span>
      <button ref={closeRef} className="lb-btn lb-close" type="button" aria-label="Close" onClick={onClose}>
        <Icon name="close" strokeWidth={2.4} />
      </button>
      {items.length > 1 && (
        <button className="lb-btn lb-prev" type="button" aria-label="Previous photo" onClick={() => go(-1)}>
          <Icon name="prev" strokeWidth={2.4} />
        </button>
      )}
      <figure>
        <div className="frame">
          <Image key={item.img} src={item.img} alt={item.title} fill sizes="(max-width: 1200px) 100vw, 1200px" priority />
        </div>
        <figcaption>
          <b>{item.title}</b>
          <span>{item.text}</span>
        </figcaption>
      </figure>
      {items.length > 1 && (
        <button className="lb-btn lb-next" type="button" aria-label="Next photo" onClick={() => go(1)}>
          <Icon name="next" strokeWidth={2.4} />
        </button>
      )}
    </div>,
    document.body,
  );
}
