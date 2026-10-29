import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, FeatureCards, PageHero, SectionHead } from "@/components/sections/Sections";
import { BEYOND, PROCESS, SERVICES, WHY_US } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Food Trailer Building, Fabrication & Wrap Services",
  description: "Custom food trailers, structural reinforcement, fabrication & welding, wraps & branding, permits and business consulting in Nevada — everything to launch a mobile food business.",
  path: "/services",
  keywords: ["food trailer fabrication", "trailer welding Reno", "food truck wraps", "food truck permits Nevada", "food truck business consulting"],
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumb="Services"
        path="/services"
        eyebrow="Complete solutions"
        title="Everything your mobile business needs"
        lede="From custom builds to ongoing support, we provide everything you need to launch and grow a successful food truck business."
      />

      <section className="section">
        <div className="wrap">
          <div className="service-list">
            {SERVICES.map((s, i) => (
              <div key={s.id} id={s.id} className="service-row reveal">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section plate border-y">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="From idea to first sale">
            We walk you through every stage of launching your mobile food business.
          </SectionHead>
          <ol className="process">
            {PROCESS.map((p, i) => (
              <li key={p.title} className="step reveal" data-delay={Math.min(i, 3) || undefined}>
                <span className="dot">{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow="Why Battle Born" title="What sets us apart">
            We&apos;re the best value — here&apos;s why.
          </SectionHead>
          <FeatureCards items={WHY_US} className="services-grid" />
        </div>
      </section>

      <section className="section bg-ink border-y">
        <div className="wrap">
          <div className="split split-top">
            <div>
              <span className="eyebrow reveal">Beyond the build</span>
              <h2 className="reveal" data-delay="1">
                Your success is our mission
              </h2>
              <p className="lede reveal" data-delay="2">
                A great trailer is just the beginning. We provide ongoing support and education to help you build a thriving, sustainable business —
                especially for first-time entrepreneurs in the community.
              </p>
            </div>
            <FeatureCards items={BEYOND} className="pillars two" />
          </div>
          <div className="reveal mt-[clamp(60px,8vw,100px)]">
            <p className="quote">We believe every entrepreneur deserves a fighting chance. That&apos;s why we share everything we&apos;ve learned.</p>
            <div className="quote-by">— The Battle Born Team</div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
