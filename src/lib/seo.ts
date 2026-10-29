import type { Metadata } from "next";
import { SERVICES } from "@/lib/content";
import { site } from "@/lib/site";

export const OG_IMAGE = { url: "/assets/img/og.jpg", width: 1200, height: 630, alt: `${site.name} — custom food trailers built in Nevada` };

export const absoluteUrl = (path = "/") => `${site.url}${path === "/" ? "" : path}`;

type PageSeo = {
  /** Page title; the layout template appends " | Battle Born Custom Trailers". */
  title: string;
  description: string;
  /** Route path, e.g. "/builds". Used for the canonical URL and og:url. */
  path: string;
  /** Social share image (defaults to the site OG image). */
  image?: { url: string; width?: number; height?: number; alt?: string };
  keywords?: string[];
  noIndex?: boolean;
  /** Use the title as-is (no " | Battle Born Custom Trailers" suffix). */
  absoluteTitle?: boolean;
};

/**
 * Full per-page metadata: title, description, canonical, Open Graph and Twitter.
 * Next.js replaces (not merges) openGraph/twitter objects from the layout, so each page sets its own.
 */
export function pageMetadata({ title, description, path, image = OG_IMAGE, keywords, noIndex, absoluteTitle }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      locale: "en_US",
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Site-wide structured data: the business, its website and its services. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}/#business`,
      name: site.name,
      alternateName: site.shortName,
      description: site.description,
      slogan: "Build your business. Not just your trailer.",
      url: site.url,
      email: site.email,
      telephone: site.people[0].tel,
      image: `${site.url}${OG_IMAGE.url}`,
      logo: `${site.url}/assets/img/logo.jpg`,
      foundingDate: String(site.founded),
      address: { "@type": "PostalAddress", addressRegion: "NV", addressCountry: "US" },
      areaServed: [
        { "@type": "State", name: "Nevada" },
        { "@type": "City", name: "Reno" },
        { "@type": "City", name: "Sparks" },
        { "@type": "City", name: "Carson City" },
      ],
      knowsLanguage: ["en", "es"],
      founder: site.people.map((p) => ({ "@type": "Person", name: p.name, jobTitle: p.role })),
      contactPoint: site.people.map((p) => ({
        "@type": "ContactPoint",
        telephone: p.tel,
        contactType: "sales",
        name: p.name,
        areaServed: "US",
        availableLanguage: ["English", "Spanish"],
      })),
      sameAs: site.people.map((p) => `https://www.instagram.com/${p.instagram}/`),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Food trailer services",
        itemListElement: SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.text, url: `${site.url}/services#${s.id}` },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "en-US",
      publisher: { "@id": `${site.url}/#business` },
    },
  ],
};

/** BreadcrumbList for an inner page. */
export const breadcrumbJsonLd = (name: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: site.url },
    { "@type": "ListItem", position: 2, name, item: absoluteUrl(path) },
  ],
});

/** Safe JSON-LD serialisation (escapes "<" so content can't close the script tag). */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
