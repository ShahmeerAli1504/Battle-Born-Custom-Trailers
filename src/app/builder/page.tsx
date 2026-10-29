import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TrailerBuilder } from "@/components/builder/TrailerBuilder";

export const metadata: Metadata = pageMetadata({
  title: "Design Your Own Food Trailer Online",
  description: "Design your own custom food trailer online — size, colors, wrap, windows, signage and kitchen layout — then send it to Battle Born Custom Trailers for a free estimate.",
  path: "/builder",
  image: { url: "/assets/img/builder-preview.jpg", width: 1600, height: 730, alt: "Trailer designed in the Battle Born trailer builder" },
  keywords: ["food trailer builder", "design a food truck online", "food trailer configurator", "custom trailer design"],
});

export default function BuilderPage() {
  return <TrailerBuilder />;
}
