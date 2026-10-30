import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FeatureCards, SectionHead } from "@/components/sections/Sections";
import {
  ASSURANCES,
  CALIFORNIA_POINTS,
  COMPANY_VALUES,
  CONSULTING,
  EQUIPMENT_OPTIONS,
  MAIN_MESSAGE,
  MANDATORY_EQUIPMENT,
} from "@/lib/content";

/** Thin celebratory ribbon: two years in business. */
export function AnniversaryBanner() {
  return (
    <section className="anniv" aria-label="Two-year anniversary">
      <div className="wrap anniv-inner">
        <div className="anniv-mark" aria-hidden="true">
          <b>2</b>
          <span>Years</span>
        </div>
        <p>
          <b>Celebrating 2 years in business.</b> Thank you to every customer who trusted us, recommended us, and let us be part of their journey.
        </p>
        <Link className="text-link" href="/about#anniversary">
          Our story <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}

/** Delivery, warranties, inspections, financing, turnaround. */
export function AssuranceStrip() {
  return (
    <div>
      <span className="eyebrow reveal">Peace of mind</span>
      <FeatureCards items={ASSURANCES} className="services-grid mt-5" />
      <p className="fine-print reveal">
        Inspection guarantee applies to the build specifications we agree on and the requirements of your jurisdiction.
      </p>
    </div>
  );
}

/** California certification callout. */
export function CaliforniaBadge() {
  return (
    <section className="section ca-cert" aria-labelledby="ca-title">
      <div className="wrap ca-grid">
        <div className="ca-seal reveal" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="star">
            <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" fill="currentColor" />
          </svg>
          <b>CA</b>
          <span>Certified build</span>
        </div>
        <div>
          <span className="eyebrow reveal">California certified</span>
          <h2 id="ca-title" className="reveal" data-delay="1">
            Certified to build for California
          </h2>
          <p className="lede reveal" data-delay="2">
            Battle Born Custom Trailers is certified to build food trailers for California. California builds include the California insignia and are
            built to meet applicable California requirements.
          </p>
          <ul className="spec-list reveal" data-delay="2">
            {CALIFORNIA_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Equipment options + mandatory sinks (Interiors page). */
export function EquipmentOptions() {
  return (
    <section className="section scroll-mt-20" id="equipment" aria-labelledby="equipment-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">Equipment options</span>
            <h2 id="equipment-title" className="reveal" data-delay="1">
              Build your kitchen
            </h2>
          </div>
          <p className="reveal" data-delay="2">
            Choose the equipment that fits your menu. Every piece is laid out around your workflow and your trailer.
          </p>
        </div>
        <div className="equip-grid">
          {EQUIPMENT_OPTIONS.map((g, i) => (
            <div key={g.title} className="card equip-card reveal" data-delay={i % 3 || undefined}>
              <div className="icon">
                <Icon name={g.icon} />
              </div>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mandatory reveal">
          <div className="mandatory-tag">Mandatory</div>
          <div>
            <h3>Both sinks are mandatory in every build</h3>
            <p>Every Battle Born food trailer includes both of these — they are required in all of our builds.</p>
          </div>
          <ul>
            {MANDATORY_EQUIPMENT.map((m) => (
              <li key={m}>
                <Icon name="check" /> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** "We don't just build trailers" — consulting & customer support (Services page). */
export function ConsultingSupport() {
  return (
    <section className="section plate border-y scroll-mt-20" id="consulting-support">
      <div className="wrap">
        <SectionHead eyebrow="Business consulting & support" title="More than trailer builders">
          As owners of multiple successful local food businesses, we give our customers real-world experience and guidance.
        </SectionHead>
        <FeatureCards items={CONSULTING} className="services-grid" />
        <div className="reveal mt-[clamp(50px,7vw,90px)]">
          <p className="quote max-w-[34ch]">{MAIN_MESSAGE}</p>
          <div className="quote-by">— David &amp; Oliver Mendoza</div>
        </div>
      </div>
    </section>
  );
}

/** About our company (About page). */
export function CompanyValues() {
  return (
    <section className="section bg-ink border-y" aria-labelledby="company-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">About our company</span>
            <h2 id="company-title" className="reveal" data-delay="1">
              Family-owned. Not a corporation.
            </h2>
          </div>
          <p className="reveal" data-delay="2">
            When you call Battle Born, you talk to the owners. We build relationships with our customers — not just trailers.
          </p>
        </div>
        <FeatureCards items={COMPANY_VALUES} className="services-grid" />
      </div>
    </section>
  );
}
