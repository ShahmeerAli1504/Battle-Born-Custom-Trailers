"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Spark = { left: string; duration: string; delay: string; dx: string };

/** Floating weld sparks behind the home hero. Generated client-side to avoid hydration mismatch. */
export function Sparks({ count = 22 }: { count?: number }) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSparks(
      Array.from({ length: count }, () => ({
        left: `${40 + Math.random() * 60}%`,
        duration: `${5 + Math.random() * 7}s`,
        delay: `${Math.random() * 8}s`,
        dx: `${Math.random() * 160 - 80}px`,
      })),
    );
  }, [count]);

  return (
    <div className="sparks" aria-hidden="true">
      {sparks.map((s, i) => (
        <i
          key={i}
          style={{ left: s.left, animationDuration: s.duration, animationDelay: s.delay, "--dx": s.dx } as CSSProperties}
        />
      ))}
    </div>
  );
}
