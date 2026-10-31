import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BuildsGallery } from "@/components/gallery/BuildsGallery";
import { Spotlight } from "@/components/gallery/Spotlight";
import { SoundVideo, VideoReels } from "@/components/media/Videos";
import { FeaturedPhotos } from "@/components/gallery/FeaturedPhotos";
import { CtaBand, PageHero, SectionHead } from "@/components/sections/Sections";
import { BUILDS, FEATURED_BUILD, MENDOZA_SPECS, VIDEOS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Custom Food Trailer Builds & Gallery",
  description: "Browse completed custom food trailers by Battle Born Custom Trailers — Los Oaxaqueños, Las Comadres, Las Peribanas, the Mendoza's double-deck flagship, shop photos and video build tours.",
  path: "/builds",
  image: { url: "/assets/img/builds/pollos-asados-oaxaquenos.jpg", alt: "Custom Food Trailer Builds & Gallery — Battle Born Custom Trailers" },
  keywords: ["food trailer gallery", "custom food trailer builds", "food truck wraps Nevada", "double deck food trailer"],
});

export default function BuildsPage() {
  return (
    <>
      <PageHero
        crumb="Builds"
        path="/builds"
        eyebrow="Our work"
        title="Completed builds"
        lede="Every trailer tells a story of an entrepreneur taking control of their future. Browse the builds — tap any photo to see it full size."
      />

      <section className="section">
        <div className="wrap">
          <BuildsGallery builds={BUILDS} filters featureFirst />
        </div>
      </section>

      <section className="section plate border-y">
        <div className="wrap">
          <SectionHead eyebrow="Flagship build" title="Mendoza's double-deck">
            Triple axle, rooftop deck, wrapped staircase and edge-to-edge graphics. Our biggest statement piece so far.
          </SectionHead>
          <Spotlight side={[1, 3]} />
          <ul className="spec-list reveal mt-7">
            {MENDOZA_SPECS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section scroll-mt-20" id="featured">
        <div className="wrap split featured-build">
          <div className="story-video reveal">
            <SoundVideo src={FEATURED_BUILD.video.src} poster={FEATURED_BUILD.video.poster} label={`${FEATURED_BUILD.title} build reel`}>
              <div className="badge">
                <small>Featured</small>Reel
              </div>
            </SoundVideo>
          </div>
          <div>
            <span className="eyebrow reveal">Featured build</span>
            <h2 className="reveal" data-delay="1">
              {FEATURED_BUILD.title}
            </h2>
            <p className="lede reveal" data-delay="2">
              {FEATURED_BUILD.text}
            </p>
            <ul className="spec-list reveal" data-delay="2">
              {FEATURED_BUILD.specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <FeaturedPhotos photos={FEATURED_BUILD.photos} />
          </div>
        </div>
      </section>

      <section className="section bg-ink border-y scroll-mt-20" id="videos">
        <div className="wrap">
          <SectionHead eyebrow="Watch" title="Build tours">
            See finished builds up close — walkthroughs, details and behind-the-scenes from the shop.
          </SectionHead>
          <VideoReels videos={VIDEOS} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
