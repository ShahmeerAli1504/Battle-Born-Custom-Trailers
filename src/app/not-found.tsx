import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="page-hero flex min-h-[70vh] items-center">
      <div className="wrap">
        <span className="eyebrow">404</span>
        <h1>Wrong turn</h1>
        <p className="lede">That page isn&apos;t here. Let&apos;s get you back on the road.</p>
        <div className="hero-actions mt-7">
          <Link className="btn btn-spark" href="/">
            Back home
          </Link>
          <Link className="btn btn-ghost" href="/builds">
            See builds
          </Link>
        </div>
      </div>
    </section>
  );
}
