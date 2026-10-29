import type { MetadataRoute } from "next";
import { BUILDS, INTERIORS, MENDOZA } from "@/lib/content";
import { site } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

const abs = (path: string) => `${site.url}${path}`;

/** Every public page, with its images so they can show up in Google Images. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"], images: string[] = []): Entry => ({
    url: path === "/" ? site.url : abs(path),
    lastModified,
    changeFrequency,
    priority,
    ...(images.length ? { images: [...new Set(images)].map(abs) } : {}),
  });

  return [
    page("/", 1, "weekly", ["/assets/img/og.jpg", "/assets/img/logo.jpg", "/assets/img/builder-preview.jpg", ...BUILDS.slice(0, 6).map((b) => b.img)]),
    page("/builds", 0.9, "weekly", [...BUILDS.map((b) => b.img), ...MENDOZA.map((m) => m.img)]),
    page("/builder", 0.9, "monthly", ["/assets/img/builder-preview.jpg"]),
    page("/contact", 0.9, "monthly"),
    page("/services", 0.8, "monthly"),
    page("/interiors", 0.8, "monthly", INTERIORS.map((i) => i.img)),
    page("/about", 0.7, "monthly", ["/assets/video/one-year.jpg", "/assets/video/team.jpg"]),
  ];
}
