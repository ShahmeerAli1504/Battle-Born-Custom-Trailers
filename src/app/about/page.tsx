import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo";
import { Icon } from "@/components/ui/Icon";
import { SoundVideo } from "@/components/media/Videos";
import { CtaBand, PageHero, SectionHead } from "@/components/sections/Sections";
import { FounderStory } from "@/components/sections/Founder";
import { OWNERS } from "@/lib/content";
import { instagramUrl, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Meet David & Oliver Mendoza",
  description: "Battle Born Custom Trailers was founded in Nevada by David and Oliver Mendoza to build custom food trailers — and to help entrepreneurs become business owners. Hablamos Español.",
  path: "/about",
  image: { url: "/assets/video/one-year.jpg", alt: "About Us — Meet David & Oliver Mendoza — Battle Born Custom Trailers" },
});

/** Tells search engines who the owners are (can show up in Google's knowledge results). */
const founderJsonLd = OWNERS.map((o) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: o.name,
  jobTitle: o.signLabel,
  description: o.intro,
  ...(o.id === "oliver" ? { homeLocation: { "@type": "Place", name: "Northern Nevada" } } : {}),
  worksFor: { "@type": "Organization", name: site.name, url: site.url },
  url: absoluteUrl(`/about#${o.id}`),
  sameAs: site.people.filter((p) => p.name === o.name).map((p) => instagramUrl(p.instagram)),
}));

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumb="About"
        path="/about"
        eyebrow="Our story"
        title="A dream between partners"
        lede="Battle Born Custom Trailers was founded by David and Oliver Mendoza to build custom food trailers — and to help people become business owners."
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(founderJsonLd) }} />
      <FounderStory />

      <section className="section">
        <div className="wrap split">
          <div>
            <span className="eyebrow reveal">One year in</span>
            <h2 className="reveal" data-delay="1">
              Building futures, not just trailers
            </h2>
            <p className="lede reveal" data-delay="2">
              One year ago this all started with a dream between business partners — a vision to build custom food trailers and help others start their
              own businesses.
            </p>
            <p className="reveal" data-delay="2">
              What began as an idea quickly turned into a mission: helping people bring their food concepts to life and guiding them through the process
              of becoming business owners.
            </p>
            <p className="reveal" data-delay="3">
              Through hard work, dedication, and faith, we&apos;ve been blessed with an incredible first year. We&apos;re truly grateful for every client
              who trusted us, supported us, recommended us, and let us be part of their journey.
            </p>
            <p className="reveal" data-delay="3">
              <b className="text-bone">This is only the beginning. Year 2 — we&apos;re building even bigger.</b>
            </p>
          </div>
          <div className="story-video reveal" data-delay="1">
            <SoundVideo src="/assets/video/one-year.mp4" poster="/assets/video/one-year.jpg" label="One year of Battle Born">
              <div className="badge">
                <small>Anniversary</small>1 Year
              </div>
            </SoundVideo>
          </div>
        </div>
      </section>

      <section className="section plate border-y">
        <div className="wrap">
          <span className="eyebrow reveal">Our mission</span>
          <p className="quote reveal max-w-[26ch]" data-delay="1">
            To empower hardworking entrepreneurs — especially in the Hispanic community — with world-class custom trailers and the mentorship they need to
            build sustainable, profitable mobile businesses.
          </p>
        </div>
      </section>

      <section className="section scroll-mt-20" id="team">
        <div className="wrap">
          <SectionHead eyebrow="Meet our team" title="Family-driven">
            A family-driven foundation built on reliability, expertise, and real support for entrepreneurs.
          </SectionHead>
          <div className="team">
            {site.people.map((p) => (
              <div key={p.name} className="card member reveal">
                <div className="avatar" aria-hidden="true">
                  {p.initials}
                </div>
                <div>
                  <h3>{p.name}</h3>
                  <span className="role">{p.role}</span>
                  <div className="member-actions">
                    <a className="btn btn-blue" href={`tel:${p.tel}`}>
                      <Icon name="phone" />
                      {p.phone}
                    </a>
                    <a className="btn btn-ghost" href={instagramUrl(p.instagram)} target="_blank" rel="noopener noreferrer">
                      <Icon name="instagram" />
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-ink border-y">
        <div className="wrap split">
          <div>
            <span className="eyebrow reveal">Grateful</span>
            <h2 className="reveal" data-delay="1">
              An incredible team
            </h2>
            <p className="lede reveal" data-delay="2">
              We&apos;re grateful to have an incredible team behind Battle Born Custom Trailers, and thankful to be part of so many people&apos;s journeys as
              they take the leap into starting their first business.
            </p>
            <p className="reveal" data-delay="2">
              Helping guide our customers in the right direction and bringing their vision to life is something we never take for granted. Huge thank you
              to everyone who continues to support the vision, trust our work, and grow with us.
            </p>
            <Link className="text-link reveal" data-delay="3" href="/builds#videos">
              Watch build tours <Icon name="arrow" />
            </Link>
          </div>
          <div className="story-video reveal" data-delay="1">
            <video muted loop playsInline preload="metadata" poster="/assets/video/team.jpg" controls aria-label="The Battle Born team at work">
              <source src="/assets/video/team.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
