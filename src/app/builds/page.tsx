import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BuildsGallery } from "@/components/gallery/BuildsGallery";
import { Spotlight } from "@/components/gallery/Spotlight";
import { VideoReels } from "@/components/media/Videos";
import { CtaBand, PageHero, SectionHead } from "@/components/sections/Sections";
import { BUILDS, MENDOZA_SPECS, VIDEOS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Custom Food Trailer Builds & Gallery",
  description: "Browse completed custom food trailers by Battle Born Custom Trailers in Nevada — custom wraps, clean builds, the Mendoza's double-deck flagship and video build tours.",
  path: "/builds",
  image: { url: "/assets/img/builds/mendozas-food-truck.jpg", alt: "Custom Food Trailer Builds & Gallery — Battle Born Custom Trailers" },
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

      <section className="section scroll-mt-20" id="videos">
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
