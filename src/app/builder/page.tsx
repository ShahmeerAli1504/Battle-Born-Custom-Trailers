import type { Metadata } from "next";
import { TrailerBuilder } from "@/components/builder/TrailerBuilder";

export const metadata: Metadata = {
  title: "Build Your Trailer",
  description: "Design your own custom food trailer — size, colors, wrap, windows, signage and kitchen layout — then send it to Battle Born Custom Trailers for a free estimate.",
  alternates: { canonical: "/builder" },
};

export default function BuilderPage() {
  return <TrailerBuilder />;
}
