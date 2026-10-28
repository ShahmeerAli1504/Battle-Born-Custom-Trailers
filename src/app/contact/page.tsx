import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { PageHero } from "@/components/sections/Sections";
import { instagramUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Free Quote",
  description: "Request a free quote for a custom food trailer. Call David (775-200-4169) or Oliver (775-203-2833), or send us your project details. Hablamos Español.",
  alternates: { canonical: "/contact" },
};

const EXPECT = ["Free consultation, no pressure", "Detailed quote with no hidden fees", "Licensed & insured builds", "Hablamos Español"];

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Free consultation"
        title="Let's build your trailer"
        lede="Tell us about your concept and we'll get back to you with next steps. Free consultations • Transparent pricing • Licensed & insured."
      />

      <section className="section">
        <div className="wrap contact-grid">
          <div className="card form-card reveal">
            <h2 className="text-[clamp(2rem,3.4vw,2.6rem)]">Request a quote</h2>
            <p className="muted">
              Fields marked <span className="accent">*</span> are required. ¿Prefiere español? Just let us know below.
            </p>
            <QuoteForm />
          </div>

          <aside className="contact-side">
            {site.people.map((p, i) => (
              <a key={p.tel} className="card contact-item reveal" data-delay={i || undefined} href={`tel:${p.tel}`}>
                <div className="icon">
                  <Icon name="phone" />
                </div>
                <div>
                  <small>
                    {p.name} · {p.shortRole}
                  </small>
                  <b>{p.phone}</b>
                </div>
              </a>
            ))}
            <a className="card contact-item reveal" data-delay="1" href={`mailto:${site.email}`}>
              <div className="icon">
                <Icon name="mail" />
              </div>
              <div>
                <small>Email</small>
                <b>{site.email}</b>
              </div>
            </a>
            {site.people.map((p) => (
              <a key={p.instagram} className="card contact-item reveal" data-delay="2" href={instagramUrl(p.instagram)} target="_blank" rel="noopener noreferrer">
                <div className="icon">
                  <Icon name="instagram" />
                </div>
                <div>
                  <small>{p.name.split(" ")[0]} on Instagram</small>
                  <b>@{p.instagram}</b>
                </div>
              </a>
            ))}
            <div className="card reveal" data-delay="3">
              <h3>What to expect</h3>
              <ul className="expect">
                {EXPECT.map((t) => (
                  <li key={t}>
                    <Icon name="check" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
