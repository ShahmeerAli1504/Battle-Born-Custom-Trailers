import type { MetadataRoute } from "next";
import { nav, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return nav.map((item) => ({
    url: `${site.url}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/builds" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : item.href === "/contact" || item.href === "/builder" ? 0.9 : 0.7,
  }));
}
