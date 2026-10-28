import { z } from "zod";
import { BUDGETS, HEARD_FROM, LANGUAGES, QUOTE_SERVICES, TIMELINES, TRAILER_SIZES } from "@/lib/content";

/** Optional select: "" from the form becomes undefined; otherwise must be one of the options. */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum(values).optional());

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().max(max).optional().default(""));

const name = z.string().trim().min(2, "Please enter your name").max(80);
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a phone number")
  .max(30)
  .regex(/^[0-9+().\-\s]+$/, "Use digits, spaces, + ( ) - only");
const email = z.string().trim().max(120).email("Please enter a valid email");

/** Shared by the contact form (client) and /api/quote (server). */
export const quoteSchema = z.object({
  name,
  phone,
  email,
  business: optionalText(80),
  services: z.array(z.enum(QUOTE_SERVICES)).max(QUOTE_SERVICES.length).default([]),
  size: optionalEnum(TRAILER_SIZES),
  food: optionalText(120),
  budget: optionalEnum(BUDGETS),
  timeline: optionalEnum(TIMELINES),
  language: optionalEnum(LANGUAGES),
  message: z.string().trim().min(10, "Tell us a little about your project (10+ characters)").max(4000),
  heard: optionalEnum(HEARD_FROM),
  /** Honeypot — real people never fill this in. */
  website: z.string().max(500).optional().default(""),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type Quote = z.output<typeof quoteSchema>;

/** Builder "send design for estimate" request. The design itself is validated by designSchema. */
export const designRequestSchema = z.object({
  name,
  phone,
  email,
  timeline: optionalEnum(TIMELINES),
  notes: optionalText(2000),
  design: z.unknown(),
  /** PNG snapshot from the builder, attached to the email. */
  image: z
    .string()
    .max(4_000_000)
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/)
    .optional()
    .nullable(),
  website: z.string().max(500).optional().default(""),
});

export type DesignRequest = z.output<typeof designRequestSchema>;

/** Flatten zod issues into { field: message } for the UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
