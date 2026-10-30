import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { CountUp } from "@/components/motion/CountUp";
import { Sparks } from "@/components/motion/Sparks";
import { BuildsGallery } from "@/components/gallery/BuildsGallery";
import { InteriorGallery } from "@/components/gallery/InteriorGallery";
import { Spotlight } from "@/components/gallery/Spotlight";
import { SoundVideo } from "@/components/media/Videos";
import { CtaBand, FeatureCards, SectionHead } from "@/components/sections/Sections";
import { FounderTeaser } from "@/components/sections/Founder";
import { AnniversaryBanner, AssuranceStrip, CaliforniaBadge } from "@/components/sections/Highlights";
import { BUILDS, INTERIORS, MAIN_MESSAGE, MENDOZA_SPECS, PILLARS, SERVICES } from "@/lib/content";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${site.tagline}`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

const MARQUEE = ["Custom Food Trailers", "California Certified", "Nationwide & Worldwide Delivery", "Fabrication & Welding", "Custom Wraps", "Hablamos Español"];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <Sparks />
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow reveal">Custom food trailers · Nevada</span>
            <h1 className="reveal" data-delay="1">
              <span className="line">Build your</span>
              <span className="line accent">business.</span>
              <span className="line steel-text">Not just your trailer.</span>
            </h1>
            <p className="lede reveal" data-delay="2">
              We empower entrepreneurs with custom food trailers and the guidance to turn their dreams into thriving mobile businesses. From design to
              launch, we&apos;re with you every step.
            </p>
            <div className="hero-actions reveal" data-delay="3">
              <Link className="btn btn-spark" href="/contact">
                Get a Free Quote <Icon name="arrow" />
              </Link>
              <Link className="btn btn-ghost" href="/builds">
                See Our Builds
              </Link>
            </div>
            <div className="hero-badges reveal" data-delay="3">
              <span>Licensed &amp; insured</span>
              <span>California certified</span>
              <span>Warranty included</span>
              <span>Hablamos Español</span>
            </div>
          </div>
          <div className="hero-media reveal" data-delay="2">
            <video autoPlay muted loop playsInline preload="auto" poster="/assets/video/hero-loop.jpg" aria-label="Battle Born Custom Trailers logo animation">
              <source src="/assets/video/hero-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <AnniversaryBanner />

      <section className="section">
        <div className="wrap">
          <div className="stats reveal">
            <div className="stat">
              <CountUp to={5} suffix="+" />
              <span>Years of experience</span>
            </div>
            <div className="stat">
              <CountUp to={50} suffix="+" />
              <span>Trailers built</span>
            </div>
            <div className="stat">
              <CountUp to={100} suffix="%" />
              <span>Licensed &amp; certified</span>
            </div>
            <div className="stat">
              <b>1:1</b>
              <span>Owner-led builds</span>
            </div>
          </div>

          <div className="split mt-[clamp(70px,9vw,120px)]">
            <div className="reveal">
              <span className="eyebrow">More than builders</span>
              <h2>We&apos;re your partners</h2>
            </div>
            <div>
              <p className="lede reveal" data-delay="1">
                {MAIN_MESSAGE}
              </p>
              <Link className="text-link reveal mt-5" data-delay="2" href="/services#consulting-support">
                How we help beyond the build <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <FeatureCards items={PILLARS} />
          </div>
          <div className="mt-[clamp(50px,7vw,90px)]">
            <AssuranceStrip />
          </div>
        </div>
      </section>

      <FounderTeaser />

      <section className="section plate border-y">
        <div className="wrap">
          <SectionHead eyebrow="Flagship build" title="Mendoza's double-deck">
            A triple-axle, fully wrapped mobile kitchen with a rooftop deck and stair access — proof of what Battle Born can fabricate when the vision gets
            big.
          </SectionHead>
          <Spotlight side={[1, 2]} />
          <div className="spotlight-copy">
            <ul className="spec-list reveal">
              {MENDOZA_SPECS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Link className="text-link reveal" href="/builds">
              View all builds <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow="Built Battle Born tough" title="Recent builds">
            Every trailer tells the story of an entrepreneur taking control of their future. Here&apos;s a glimpse of the craftsmanship that goes into
            every build.
          </SectionHead>
          <BuildsGallery builds={BUILDS.slice(0, 6)} />
          <div className="center mt-10">
            <Link className="btn btn-ghost" href="/builds">
              See the full gallery <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section plate border-y">
        <div className="wrap split">
          <div>
            <span className="eyebrow reveal">New · Trailer builder</span>
            <h2 className="reveal" data-delay="1">
              Build your own food trailer
            </h2>
            <p className="lede reveal" data-delay="2">
              Design your dream trailer right here — pick the size, colors and wrap, drag on windows, awnings and signage, add your business name and plan
              your kitchen. Then send it to us for a free estimate.
            </p>
            <ul className="spec-list reveal" data-delay="2">
              {["12–28 ft", "Custom colors & wraps", "Drag-and-drop gear", "Your logo & name", "Kitchen floor plan"].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="hero-actions reveal mt-7" data-delay="3">
              <Link className="btn btn-spark" href="/builder">
                Start Designing <Icon name="arrow" />
              </Link>
              <Link className="btn btn-ghost" href="/builder#templates">
                See templates
              </Link>
            </div>
          </div>
          <Link className="teaser-frame reveal" data-delay="1" href="/builder" aria-label="Open the trailer builder">
            <Image src="/assets/img/builder-preview.jpg" alt="Example trailer designed in the Battle Born trailer builder" width={1600} height={730} sizes="(max-width: 900px) 100vw, 50vw" />
            <span className="teaser-chip c1">🪟 Drag on windows</span>
            <span className="teaser-chip c2">🎨 Pick your colors</span>
            <span className="teaser-chip c3">📐 Floor plan</span>
          </Link>
        </div>
      </section>

      <CaliforniaBadge />

      <section className="section bg-ink border-y">
        <div className="wrap">
          <SectionHead eyebrow="Step inside excellence" title="Kitchens built to code">
            Every inch of your trailer is designed with precision, efficiency, and durability in mind — built for chefs, entrepreneurs, and mobile
            business owners.
          </SectionHead>
          <InteriorGallery items={INTERIORS.slice(0, 3)} />
          <div className="center mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link className="text-link" href="/interiors">
              Explore interiors <Icon name="arrow" />
            </Link>
            <Link className="text-link" href="/interiors#equipment">
              See equipment options <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow="What we do" title="Complete solutions">
            From custom builds to ongoing support, we provide everything you need to launch and grow a successful food truck business.
          </SectionHead>
          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <Link key={s.id} className="card service reveal" data-delay={i % 3 || undefined} href={`/services#${s.id}`}>
                <div className="icon">
                  <Icon name={s.icon} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="text-link mt-5 self-start text-[.9rem]">Learn more</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section plate border-y">
        <div className="wrap split">
          <div className="story-video reveal">
            <SoundVideo src="/assets/video/team.mp4" poster="/assets/video/tour-loop.jpg" label="The Battle Born team">
              <div className="badge">
                <small>Anniversary</small>2 Years
              </div>
            </SoundVideo>
          </div>
          <div>
            <span className="eyebrow reveal">Our story</span>
            <h2 className="reveal" data-delay="1">
              It started with a dream
            </h2>
            <p className="lede reveal" data-delay="2">
              Two years ago, Battle Born began as a vision between business partners: build custom food trailers and help others start their own
              businesses.
            </p>
            <p className="reveal" data-delay="2">
              What began as an idea quickly became a mission — helping people bring their food concepts to life and guiding them through becoming business
              owners. Through hard work, dedication, and faith, we&apos;ve been blessed with two incredible years.
            </p>
            <p className="reveal" data-delay="3">
              <b className="text-bone">Thank you for two years. This is only the beginning — we&apos;re building even bigger.</b>
            </p>
            <Link className="text-link reveal" data-delay="3" href="/about">
              Meet the team <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
