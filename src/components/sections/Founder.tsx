import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FOUNDER } from "@/lib/content";
import { instagramUrl, site } from "@/lib/site";

const oliver = site.people.find((p) => p.name === FOUNDER.name);

function Monogram() {
  return (
    <div className="founder-mark" aria-hidden="true">
      <span>{FOUNDER.initials}</span>
      <svg viewBox="0 0 24 24" className="star">
        <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Full founder story — the About page. */
export function FounderStory() {
  return (
    <section className="section founder border-y scroll-mt-20" id="founder" aria-labelledby="founder-title">
      <div className="wrap founder-grid">
        <aside className="founder-card reveal">
          <Monogram />
          <span className="eyebrow">Meet the founder</span>
          <h2 id="founder-title">{FOUNDER.name}</h2>
          <ul className="founder-titles">
            {FOUNDER.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul className="founder-facts">
            {FOUNDER.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {oliver && (
            <div className="founder-actions">
              <a className="btn btn-spark" href={`tel:${oliver.tel}`}>
                <Icon name="phone" />
                Call Oliver · {oliver.phone}
              </a>
              <a className="btn btn-ghost" href={instagramUrl(oliver.instagram)} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" />@{oliver.instagram}
              </a>
            </div>
          )}
        </aside>

        <div className="founder-story">
          <p className="founder-intro reveal">{FOUNDER.intro}</p>
          {FOUNDER.story.map((p, i) => (
            <p key={i} className="reveal" data-delay={i % 3 || undefined}>
              {p}
            </p>
          ))}
          <div className="founder-goal reveal">
            <span>My goal is simple</span>
            <p>{FOUNDER.goal}</p>
          </div>
          <p className="founder-signoff reveal">{FOUNDER.signoff}</p>
          <div className="founder-sign reveal">— {FOUNDER.name}, Founder</div>
        </div>
      </div>
    </section>
  );
}

/** Short version for the home page, linking to the full story. */
export function FounderTeaser() {
  return (
    <section className="section founder border-y" aria-labelledby="founder-teaser-title">
      <div className="wrap founder-grid teaser">
        <div className="founder-card reveal">
          <Monogram />
          <span className="eyebrow">Meet the founder</span>
          <h2 id="founder-teaser-title">{FOUNDER.name}</h2>
          <ul className="founder-titles">
            {FOUNDER.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="founder-story">
          <p className="founder-intro reveal">{FOUNDER.intro}</p>
          <p className="reveal" data-delay="1">
            {FOUNDER.story[0]} {FOUNDER.story[1]}
          </p>
          <p className="founder-signoff reveal" data-delay="2">
            {FOUNDER.signoff}
          </p>
          <Link className="text-link reveal" data-delay="2" href="/about#founder">
            Read Oliver&apos;s story <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
