"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

let firstLoad = true;

/**
 * Fades `.reveal` elements in as they scroll into view.
 * - First page load: the hero animates in.
 * - Navigating between pages: anything already on screen appears instantly, so the new page
 *   never sits blank while waiting for an animation; content further down still fades in on scroll.
 * Watches the DOM so elements rendered later (filtered galleries etc.) animate too.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (el: Element) => el.classList.add("in");

    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(show);
      return;
    }

    // Before the first paint of a client-side navigation: show the new page's first screen right away.
    // Measured from the top of the document, because the scroll reset may not have happened yet.
    if (!firstLoad) {
      const vh = window.innerHeight;
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top + window.scrollY < vh) el.classList.add("instant", "in");
      });
    }
    firstLoad = false;

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            show(en.target);
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.05 },
    );

    const observe = (el: Element) => !el.classList.contains("in") && io.observe(el);
    document.querySelectorAll(".reveal").forEach(observe);

    // Only look at nodes React adds later (e.g. gallery filters), not the whole document each time.
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.classList.contains("reveal")) observe(n);
          if (n.firstElementChild) n.querySelectorAll(".reveal").forEach(observe);
        });
      }
    });
    const main = document.getElementById("main") ?? document.body;
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
