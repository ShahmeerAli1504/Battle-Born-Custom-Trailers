/* =========================================================
   GALLERY & PAGE CONTENT — add new photos & videos here.

   1. Drop the image in public/assets/img/builds/ (or interiors/)
   2. Add one entry to the matching list below.
   The Home, Builds and Interiors pages update themselves.
   ========================================================= */

import type { IconName } from "@/components/ui/Icon";

export type BuildCategory = "wrap" | "clean" | "shop";

export type Photo = {
  /** Path inside /public, e.g. "/assets/img/builds/new-trailer.jpg" */
  img: string;
  title: string;
  text: string;
};

export type Build = Photo & { cat: BuildCategory };

export type Video = {
  src: string;
  poster?: string;
  title: string;
  text?: string;
};

export const BUILD_CATEGORIES: Record<BuildCategory, { tag: string; filter: string }> = {
  wrap: { tag: "Custom Wrap", filter: "Custom wraps" },
  clean: { tag: "Clean Build", filter: "Clean builds" },
  shop: { tag: "In the Shop", filter: "In the shop" },
};

/** The first build is shown large on /builds; the first 6 appear on the home page. */
export const BUILDS: Build[] = [
  { img: "/assets/img/builds/mendozas-food-truck.jpg", title: "Mendoza's Food Truck", text: "Colorful wrap with full equipment package", cat: "wrap" },
  { img: "/assets/img/builds/grand-pinoy-fiesta.jpg", title: "Grand Pinoy Fiesta", text: "Full custom build with professional kitchen setup", cat: "wrap" },
  { img: "/assets/img/builds/sweetheart-chicks-shakes.jpg", title: "Sweet Heart Chicks & Shakes", text: "Specialty dessert trailer with eye-catching design", cat: "wrap" },
  { img: "/assets/img/builds/carnitas.jpg", title: "Carnitas Specialty Trailer", text: "Custom build for traditional Mexican cuisine", cat: "wrap" },
  { img: "/assets/img/builds/casa-maya-express.jpg", title: "Casa Maya Express", text: "Premium black trailer with artistic custom graphics", cat: "wrap" },
  { img: "/assets/img/builds/wave-on-wheels.jpg", title: "Wave on Wheels", text: "Eye-catching green design with full commercial setup", cat: "wrap" },
  { img: "/assets/img/builds/tacos-specialty.jpg", title: "Tacos Specialty Trailer", text: "Vibrant wrap design optimized for street vending", cat: "wrap" },
  { img: "/assets/img/builds/premium-red.jpg", title: "Premium Red Build", text: "Bold design with complete commercial kitchen", cat: "clean" },
  { img: "/assets/img/builds/bright-yellow.jpg", title: "Bright Yellow Build", text: "High-visibility trailer with professional finish", cat: "clean" },
  { img: "/assets/img/builds/clean-slate.jpg", title: "Custom Build — Clean Slate", text: "Professional foundation ready for customization", cat: "clean" },
  { img: "/assets/img/builds/workshop-in-progress.jpg", title: "Workshop in Progress", text: "Behind-the-scenes look at our fabrication process", cat: "shop" },
];

export const INTERIORS: Photo[] = [
  { img: "/assets/img/interiors/stainless-workstations.jpg", title: "Stainless-Steel Workstations", text: "Professional-grade prep stations built to commercial standards" },
  { img: "/assets/img/interiors/refrigeration.jpg", title: "Commercial Refrigeration Setup", text: "Industrial cooling systems with maximum storage efficiency" },
  { img: "/assets/img/interiors/service-window.jpg", title: "Custom Service Window Design", text: "Ergonomic customer-facing configurations" },
  { img: "/assets/img/interiors/triple-basin.jpg", title: "Triple-Basin Wash Stations", text: "Health code compliant washing and sanitation areas" },
  { img: "/assets/img/interiors/cooking-equipment.jpg", title: "Heavy-Duty Cooking Equipment", text: "High-output grills and cooking surfaces" },
  { img: "/assets/img/interiors/ventilation-hood.jpg", title: "Ventilation & Hood Systems", text: "Superior exhaust and fire suppression integration" },
  { img: "/assets/img/interiors/full-kitchen.jpg", title: "Full-Service Kitchen Setup", text: "Complete cooking line with optimal workflow design" },
  { img: "/assets/img/interiors/prep-cabinets.jpg", title: "Prep Stations & Custom Cabinets", text: "Maximized storage with precision craftsmanship" },
  { img: "/assets/img/interiors/commercial-equipment.jpg", title: "Commercial-Grade Equipment", text: "Premium appliances and fixtures built to last" },
];

/** Flagship spotlight photos (Mendoza's double-deck build) */
export const MENDOZA: Photo[] = [
  { img: "/assets/img/mendoza/mendoza-night-2.jpg", title: "Mendoza's — Triple-Axle Double Deck", text: "Full-wrap flagship build with rooftop deck" },
  { img: "/assets/img/mendoza/mendoza-night-1.jpg", title: "Mendoza's — Rear Stair Access", text: "Wrapped staircase up to the rooftop deck" },
  { img: "/assets/img/mendoza/mendoza-door.jpg", title: "Mendoza's — Service Side", text: "Underglow lighting and full-coverage graphics" },
  { img: "/assets/img/mendoza/mendoza-detail.jpg", title: "Mendoza's — Wrap Detail", text: "Custom branding, edge to edge" },
];

export const MENDOZA_SPECS = ["Triple axle", "Rooftop deck", "Full custom wrap", "LED lighting", "Commercial kitchen"];

/** Vertical (9:16) videos for the "Build Tours" reel. Drop the .mp4 in public/assets/video/. */
export const VIDEOS: Video[] = [
  { src: "/assets/video/team.mp4", poster: "/assets/video/team.jpg", title: "Pollos Asados — Build Tour", text: "A full walkthrough of a finished build (en español)" },
  { src: "/assets/video/one-year.mp4", poster: "/assets/video/one-year.jpg", title: "1 Year of Battle Born", text: "Where it all started" },
  { src: "/assets/video/tour-loop.mp4", poster: "/assets/video/tour-loop.jpg", title: "On the Lot", text: "Clip from a finished-build walkthrough" },
];

export type Service = { id: string; title: string; text: string; icon: IconName };

export const SERVICES: Service[] = [
  { id: "custom", icon: "trailer", title: "Custom Food Trailers", text: "Fully customized mobile kitchens built to your exact specifications. From concept to completion, we design trailers that reflect your brand and business needs." },
  { id: "reinforcement", icon: "shield", title: "Structural Reinforcement", text: "Keep your mobile business running smoothly. We handle everything from equipment to the complete interior." },
  { id: "fabrication", icon: "flame", title: "Fabrication & Metalwork", text: "Custom metal fabrication, welding, and structural enhancements for food trucks and mobile units. Built for durability, safety, and long-lasting performance." },
  { id: "consulting", icon: "chat", title: "Business Consulting", text: "Expert guidance on permits, health codes, location strategies, and menu optimization. We help you avoid costly mistakes and accelerate your success." },
  { id: "branding", icon: "palette", title: "Custom Branding & Wraps", text: "Eye-catching wraps and signage that turn your trailer into a mobile billboard. Professional design that attracts customers." },
  { id: "compliance", icon: "clipboard", title: "Compliance & Certification", text: "Navigate health department requirements, fire codes, and business permits. We make sure your trailer meets the regulations." },
];

export type Feature = { title: string; text: string; icon: IconName };

export const PILLARS: Feature[] = [
  { icon: "shield", title: "Built to last", text: "Premium materials and licensed craftsmanship. Every weld, every detail — done right the first time." },
  { icon: "chat", title: "Honest guidance", text: "Transparent pricing, realistic timelines, and expert advice. We tell you what you need to know, not what you want to hear." },
  { icon: "trend", title: "Your success matters", text: "We're invested in your business journey. From permits to marketing, we help you navigate every challenge along the way." },
];

export const PROCESS = [
  { title: "Consult", text: "Free consultation on your concept, menu, budget and timeline." },
  { title: "Design", text: "Layout, equipment list and branding — with a detailed, transparent quote." },
  { title: "Build", text: "Fabrication, welding, plumbing, electrical and interior fit-out." },
  { title: "Comply", text: "Help navigating health department, fire code and permit requirements." },
  { title: "Launch", text: "Location, pricing and menu guidance as you open for business." },
];

export const WHY_US: Feature[] = [
  { icon: "award", title: "Experienced builders", text: "Fully licensed, insured, and compliant with state regulations. Your investment is protected." },
  { icon: "shield", title: "Premium materials only", text: "Commercial-grade stainless steel, NSF-certified equipment, and top-tier components. No shortcuts, ever." },
  { icon: "dollar", title: "Transparent pricing", text: "Detailed quotes with no hidden fees. You know exactly what you're paying for before we start." },
  { icon: "trend", title: "Real business know-how", text: "We've helped entrepreneurs launch and grow. We share what works — and what doesn't." },
  { icon: "globe", title: "Hispanic community support", text: "A bilingual team that understands the unique challenges and opportunities in our community." },
  { icon: "star", title: "Battle Born guarantee", text: "Our trailers are designed to withstand the demands of daily business." },
];

export const BEYOND: Feature[] = [
  { icon: "users", title: "Real owners", text: "From business plan to first sale, we walk you through every stage." },
  { icon: "pin", title: "Location & strategy", text: "Find profitable spots, understand local rules, and work with event organizers." },
  { icon: "list", title: "Menu & pricing", text: "Manage food costs and price competitively while keeping healthy margins." },
  { icon: "chat", title: "Community network", text: "Connect with other food truck owners and learn from those who've been there." },
];

export const INSIDE: Feature[] = [
  { icon: "wrench", title: "Plumbing", text: "Triple-basin and hand-wash stations set up for health inspections." },
  { icon: "flame", title: "Hood & fire", text: "Exhaust hoods with fire-suppression integration." },
  { icon: "award", title: "Electrical", text: "Power planned for your equipment list, not an afterthought." },
  { icon: "list", title: "Layout", text: "Prep, cook and serve lines designed for high-volume service." },
];

/* ---------- Quote form options (shared by the form UI and the API validation) ---------- */
export const QUOTE_SERVICES = [
  "New custom food trailer",
  "Repairs / fabrication",
  "Structural reinforcement",
  "Wrap & branding",
  "Permits & compliance help",
  "Business consulting",
] as const;
export const TRAILER_SIZES = ["Under 14 ft", "14–16 ft", "18–20 ft", "22–24 ft", "26 ft +", "Not sure yet"] as const;
export const BUDGETS = ["Under $25,000", "$25,000 – $50,000", "$50,000 – $80,000", "$80,000 +", "Not sure — need guidance"] as const;
export const TIMELINES = ["As soon as possible", "1–3 months", "3–6 months", "6+ months", "Just exploring"] as const;
export const HEARD_FROM = ["Instagram", "Facebook", "Google", "Referral / word of mouth", "Saw one of your trailers", "Other"] as const;
export const LANGUAGES = ["English", "Español"] as const;

/* ---------- Owner profiles (About page; short version of Oliver's on Home) ---------- */
export type OwnerProfile = {
  /** anchor on the About page: /about#<id> */
  id: string;
  name: string;
  initials: string;
  eyebrow: string;
  titles: string[];
  facts: string[];
  intro: string;
  story: string[];
  highlight: { label: string; text: string; stars?: boolean };
  signoff: string;
  signLabel: string;
};

export const FOUNDER: OwnerProfile = {
  id: "founder",
  name: "Oliver Mendoza",
  initials: "OM",
  eyebrow: "Meet the founder",
  titles: ["Founder of Battle Born Custom Trailers", "Entrepreneur", "Business Owner"],
  facts: ["28 years old", "Born & raised in Northern Nevada", "Restaurants · taco shops · meat markets · a coffee shop"],
  intro:
    "My name is Oliver Mendoza. I'm 28 years old, born and raised in Northern Nevada, and a proud local entrepreneur. Over the years, I've built and operated multiple businesses, including restaurants, taco shops, meat markets, and a coffee shop.",
  story: [
    "But my journey wasn't always easy. When I first started, I had no guidance, made costly mistakes, and lost valuable time and money learning how to run a business.",
    "Those experiences taught me lessons that I now use to help others.",
    "Today, through Battle Born Custom Trailers, my passion goes beyond building and selling food trailers. I want to help aspiring entrepreneurs turn their dreams into reality, guide them through the process, and help them avoid the same expensive mistakes I once made.",
    "I know firsthand what it takes to start from nothing, take risks, and build something successful.",
  ],
  highlight: { label: "My goal is simple", text: "Help others succeed, save them time and money, and give them the guidance I wish I had when I first started." },
  signoff: "Your dream. Your business. Let's build it together.",
  signLabel: "Founder",
};

export const PARTNER: OwnerProfile = {
  id: "david",
  name: "David Mendoza",
  initials: "DM",
  eyebrow: "Meet your partner",
  titles: ["Partner, Battle Born Custom Trailers", "Sales & Project Specialist", "Owner of multiple food businesses"],
  facts: ["Real food-business experience", "Designs & builds from scratch", "5-star customer reviews"],
  intro: "I'm not just here to sell you a food trailer — I'm here to help you build a successful business!",
  story: [
    "As a salesman and owner of multiple food businesses, I know firsthand what works, where to save money, and how to maximize your profits. I'll help you design and build your dream food truck or trailer from scratch, with real business experience behind every recommendation.",
    "For me, it's not just about making a sale. It's about building trust, long-term relationships, and helping your business succeed.",
  ],
  highlight: {
    label: "Backed by real clients",
    text: "My multiple 5-star customer reviews speak for themselves! My work, dedication, and customer satisfaction are backed by real clients who trust what I do.",
    stars: true,
  },
  signoff: "Your success is my priority. Let's build something great together!",
  signLabel: "Partner",
};

export const OWNERS = [FOUNDER, PARTNER];
