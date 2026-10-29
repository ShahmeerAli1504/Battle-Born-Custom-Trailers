import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { FOUNDER, PARTNER, type OwnerProfile } from "@/lib/content";
import { instagramUrl, site } from "@/lib/site";

const contactFor = (name: string) => site.people.find((p) => p.name === name);

function Monogram({ initials }: { initials: string }) {
  return (
    <div className="founder-mark" aria-hidden="true">
      <span>{initials}</span>
      <svg viewBox="0 0 24 24" className="star">
        <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Full owner story for the About page. `flip` puts the profile card on the right. */
export function OwnerStory({ profile, flip = false, tone = "warm" }: { profile: OwnerProfile; flip?: boolean; tone?: "warm" | "cool" }) {
  const person = contactFor(profile.name);
  const titleId = `${profile.id}-title`;
  return (
    <section className={clsx("section founder scroll-mt-20", tone === "cool" && "cool")} id={profile.id} aria-labelledby={titleId}>
      <div className={clsx("wrap founder-grid", flip && "flip")}>
        <aside className="founder-card reveal">
          <Monogram initials={profile.initials} />
          <span className="eyebrow">{profile.eyebrow}</span>
          <h2 id={titleId}>{profile.name}</h2>
          <ul className="founder-titles">
            {profile.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul className="founder-facts">
            {profile.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {person && (
            <div className="founder-actions">
              <a className="btn btn-spark" href={`tel:${person.tel}`}>
                <Icon name="phone" />
                Call {profile.name.split(" ")[0]} · {person.phone}
              </a>
              <a className="btn btn-ghost" href={instagramUrl(person.instagram)} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" />@{person.instagram}
              </a>
            </div>
          )}
        </aside>

        <div className="founder-story">
          <p className="founder-intro reveal">{profile.intro}</p>
          {profile.story.map((p, i) => (
            <p key={i} className="reveal" data-delay={i % 3 || undefined}>
              {p}
            </p>
          ))}
          <div className="founder-goal reveal">
            <span>
              {profile.highlight.stars && (
                <b className="stars" aria-label="5 stars">
                  ★★★★★
                </b>
              )}
              {profile.highlight.label}
            </span>
            <p>{profile.highlight.text}</p>
          </div>
          <p className="founder-signoff reveal">{profile.signoff}</p>
          <div className="founder-sign reveal">
            — {profile.name}, {profile.signLabel}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Both owners, as on the About page. */
export function FounderStory() {
  return (
    <>
      <OwnerStory profile={FOUNDER} />
      <OwnerStory profile={PARTNER} flip tone="cool" />
    </>
  );
}

/** Short version for the home page, linking to the full stories. */
export function FounderTeaser() {
  return (
    <section className="section founder" aria-labelledby="founder-teaser-title">
      <div className="wrap founder-grid teaser">
        <div className="founder-card reveal">
          <Monogram initials={FOUNDER.initials} />
          <span className="eyebrow">{FOUNDER.eyebrow}</span>
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
          <div className="founder-links reveal" data-delay="2">
            <Link className="text-link" href={`/about#${FOUNDER.id}`}>
              Read Oliver&apos;s story <Icon name="arrow" />
            </Link>
            <Link className="text-link" href={`/about#${PARTNER.id}`}>
              Meet David, your partner <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
