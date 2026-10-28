import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { instagramUrl, site } from "@/lib/site";

const services = [
  { href: "/services#custom", label: "Custom Trailers" },
  { href: "/services#fabrication", label: "Repairs & Fabrication" },
  { href: "/services#branding", label: "Wraps & Branding" },
  { href: "/services#consulting", label: "Consulting" },
  { href: "/contact", label: "Contact" },
];

const explore = [
  { href: "/builds", label: "Completed Builds" },
  { href: "/interiors", label: "Interiors" },
  { href: "/builds#videos", label: "Build Tours" },
  { href: "/builder", label: "Design Your Trailer" },
  { href: "/about", label: "Our Story" },
  { href: "/about#team", label: "Meet the Team" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Image src="/assets/img/logo-sm.jpg" alt={`${site.name} logo`} width={120} height={139} />
            <p>Building dreams, one trailer at a time. Empowering entrepreneurs with quality craftsmanship and honest guidance.</p>
            <div className="proud">Licensed • Insured • Nevada Proud</div>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {services.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Get in touch</h4>
            <ul>
              {site.people.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`}>
                    {p.name.split(" ")[0]} · {p.phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
            <div className="socials">
              {site.people.map((p) => (
                <a key={p.instagram} href={instagramUrl(p.instagram)} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on Instagram`}>
                  <Icon name="instagram" />
                </a>
              ))}
              <a href={`mailto:${site.email}`} aria-label="Email us">
                <Icon name="mail" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Hablamos Español</span>
        </div>
      </div>
    </footer>
  );
}
