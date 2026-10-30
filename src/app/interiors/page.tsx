import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InteriorGallery } from "@/components/gallery/InteriorGallery";
import { CtaBand, FeatureCards, PageHero } from "@/components/sections/Sections";
import { EquipmentOptions } from "@/components/sections/Highlights";
import { INSIDE, INTERIORS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Commercial Food Trailer Kitchens & Interiors",
  description: "Commercial-grade food trailer kitchens built in Nevada: undercounter refrigerators, charbroilers, stainless work tables, three-compartment and hand-wash sinks, hoods and fire suppression.",
  path: "/interiors",
  image: { url: "/assets/img/interiors/full-kitchen.jpg", alt: "Commercial Food Trailer Kitchens & Interiors — Battle Born Custom Trailers" },
  keywords: ["food trailer kitchen", "commercial mobile kitchen", "food truck interior", "NSF food trailer equipment"],
});

export default function InteriorsPage() {
  return (
    <>
      <PageHero
        crumb="Interiors"
        path="/interiors"
        eyebrow="Step inside excellence"
        title="Kitchens built to work"
        lede="Every inch of your trailer is designed with precision, efficiency, and durability in mind. Explore real projects built for chefs, entrepreneurs, and mobile business owners."
      />

      <section className="section">
        <div className="wrap">
          <InteriorGallery items={INTERIORS} rhythm />
        </div>
      </section>

      <section className="section bg-ink border-y">
        <div className="wrap split split-top">
          <div>
            <span className="eyebrow reveal">What goes inside</span>
            <h2 className="reveal" data-delay="1">
              Commercial grade. No shortcuts.
            </h2>
            <p className="lede reveal" data-delay="2">
              Commercial-grade stainless steel, NSF-certified equipment and top-tier components — laid out around your menu and your workflow.
            </p>
          </div>
          <FeatureCards items={INSIDE} className="pillars two" />
        </div>
      </section>

      <EquipmentOptions />

      <CtaBand />
    </>
  );
}
