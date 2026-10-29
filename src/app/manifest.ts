import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07090d",
    theme_color: "#07090d",
    lang: "en-US",
    icons: [
      { src: "/assets/img/favicon.png", sizes: "64x64", type: "image/png" },
      { src: "/assets/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
