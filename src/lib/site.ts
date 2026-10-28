/** Business details used across the site, metadata and emails. Edit here, updates everywhere. */
export const site = {
  name: "Battle Born Custom Trailers",
  shortName: "Battle Born",
  tagline: "Custom Food Trailers & Mobile Kitchens in Nevada",
  description:
    "Battle Born Custom Trailers builds custom food trailers and mobile kitchens in Nevada — fabrication, wraps, permits and business guidance from design to launch.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://battleborncustomtrailers.com").replace(/\/$/, ""),
  email: "battleborntrailers@gmail.com",
  region: "Nevada",
  founded: 2025,
  people: [
    {
      name: "David Mendoza",
      initials: "DM",
      role: "Co-Founder / Project Specialist",
      shortRole: "Project Specialist",
      phone: "775-200-4169",
      tel: "+17752004169",
      instagram: "ldavid_mendoza",
    },
    {
      name: "Oliver Mendoza",
      initials: "OM",
      role: "Co-Founder / Operations & Builds",
      shortRole: "Operations & Builds",
      phone: "775-203-2833",
      tel: "+17752032833",
      instagram: "mendozaa_3",
    },
  ],
} as const;

export const primaryPhone = site.people[0];

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle}/`;

export type NavItem = { href: string; label: string };

export const nav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/builds", label: "Builds" },
  { href: "/interiors", label: "Interiors" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/builder", label: "Build Yours" },
  { href: "/contact", label: "Contact" },
];
