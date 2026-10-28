import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Feature } from "@/lib/content";
import { primaryPhone } from "@/lib/site";

export function PageHero({ crumb, eyebrow, title, lede }: { crumb: string; eyebrow: string; title: string; lede: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / {crumb}
        </nav>
        <span className="eyebrow reveal">{eyebrow}</span>
        <h1 className="reveal" data-delay="1">
          {title}
        </h1>
        <p className="lede reveal" data-delay="2">
          {lede}
        </p>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow reveal">{eyebrow}</span>
        <h2 className="reveal" data-delay="1">
          {title}
        </h2>
      </div>
      {children && (
        <p className="reveal" data-delay="2">
          {children}
        </p>
      )}
    </div>
  );
}

export function FeatureCards({ items, className = "pillars" }: { items: Feature[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((f, i) => (
        <div key={f.title} className="card reveal" data-delay={i % 3 || undefined}>
          <div className="icon">
            <Icon name={f.icon} />
          </div>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </div>
      ))}
    </div>
  );
}

export function EsBadge() {
  return (
    <span className="es-badge">
      <Icon name="globe" /> Hablamos Español
    </span>
  );
}

export function CtaBand() {
  return (
    <section className="section-tight">
      <div className="wrap">
        <div className="cta-band reveal">
          <div>
            <span className="eyebrow">Free consultation</span>
            <h2>Ready to start your journey?</h2>
            <p>
              Your mobile business success story starts here. Let&apos;s build something incredible together — a trailer that works as hard as you
              do, and a partnership that lasts.
            </p>
            <div className="fine">Free consultations • Transparent pricing • Licensed &amp; insured</div>
          </div>
          <div className="actions">
            <Link className="btn btn-spark" href="/contact">
              Start Your Build <Icon name="arrow" />
            </Link>
            <a className="btn btn-ghost" href={`tel:${primaryPhone.tel}`}>
              <Icon name="phone" />
              {primaryPhone.phone}
            </a>
            <EsBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
