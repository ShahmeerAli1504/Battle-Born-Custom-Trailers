"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { nav, site } from "@/lib/site";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const solid = pathname.startsWith("/builder");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation; lock page scroll while it's open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={clsx("site-header", (scrolled || solid || open) && "scrolled", solid && "solid")}>
        <div className="wrap nav">
          <Link className="brand" href="/" aria-label={`${site.name} home`}>
            <Image src="/assets/img/logo-sm.jpg" alt="" width={46} height={46} priority />
            <span className="brand-name">
              Battle Born<small>Custom Trailers</small>
            </span>
          </Link>
          <nav aria-label="Main">
            <ul className="nav-links">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-cta">
            <Link className="btn btn-spark" href="/contact">
              Free Quote
            </Link>
            <button
              className="menu-toggle"
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-menu" id="mobile-menu">
          {nav.map((item) => (
            <Link
              key={item.href}
              className="m-link"
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
              <Icon name="arrow" />
            </Link>
          ))}
          <div className="m-contact">
            <Link className="btn btn-spark" href="/contact" onClick={() => setOpen(false)}>
              Get a Free Quote
            </Link>
            {site.people.map((p) => (
              <a key={p.tel} className="btn btn-ghost" href={`tel:${p.tel}`}>
                <Icon name="phone" />
                Call {p.name.split(" ")[0]} · {p.phone}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
