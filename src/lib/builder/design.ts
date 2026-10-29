import { z } from "zod";
import {
  BOT,
  CUISINES,
  CUISINE_KEYS,
  EQUIP_KEYS,
  FONTS,
  GADGETS,
  GADGET_TYPES,
  LENGTHS,
  TEXT_FONTS,
  TOP,
  WRAPS,
  type CuisineKey,
  type EquipKey,
  type GadgetType,
  type PresetKey,
  type TrailerLength,
  type WrapStyle,
} from "./constants";

/* ---------------- schema (validates shared links & API payloads) ---------------- */

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const fontNames = TEXT_FONTS.map((f) => f[0]) as unknown as [string, ...string[]];

export const itemSchema = z.object({
  id: z.string().max(12),
  type: z.enum(GADGET_TYPES as [GadgetType, ...GadgetType[]]),
  x: z.number().finite().min(-5).max(40),
  y: z.number().finite().min(-200).max(800).optional(),
  role: z.enum(["name", "tag", "phone"]).optional(),
  size: z.number().finite().min(8).max(160).optional(),
  text: z.string().max(40).optional(),
  font: z.enum(fontNames).optional(),
  color: hex.optional(),
  emoji: z.string().max(16).optional(),
});

export const designSchema = z.object({
  len: z
    .number()
    .int()
    .refine((n): n is TrailerLength => (LENGTHS as readonly number[]).includes(n), "Unsupported trailer length"),
  wrap: z.enum(WRAPS.map((w) => w[0]) as unknown as [WrapStyle, ...WrapStyle[]]),
  body: hex,
  accent: hex,
  trim: hex,
  text: hex,
  font: z.enum(FONTS.map((f) => f[0]) as unknown as [string, ...string[]]),
  plate: z.boolean(),
  lights: z.boolean(),
  porch: z.boolean(),
  chrome: z.boolean(),
  propane: z.boolean(),
  generator: z.boolean(),
  smoker: z.boolean(),
  cuisine: z.enum(CUISINE_KEYS as [CuisineKey, ...CuisineKey[]]),
  name: z.string().max(28),
  tag: z.string().max(40),
  phone: z.string().max(24),
  signText: z.string().max(16),
  // the same item can appear more than once (e.g. two fryers)
  equip: z.array(z.enum(EQUIP_KEYS as [EquipKey, ...EquipKey[]])).max(40),
  items: z.array(itemSchema).max(80),
});

export type Item = z.infer<typeof itemSchema>;
export type Design = z.infer<typeof designSchema>;

/* ---------------- ids ---------------- */

let uid = 1;
export const nextId = () => `i${uid++}`;
/** After loading a saved design, keep new ids unique. */
export function syncIds(d: Design) {
  uid = 1 + Math.max(0, ...d.items.map((i) => Number(String(i.id).slice(1)) || 0));
}

export const mk = (type: GadgetType, x: number, extra: Partial<Item> = {}): Item => ({ id: nextId(), type, x, ...extra });

/* ---------------- presets ---------------- */

/** Starting point: a bare trailer with nothing on it. The customer makes every choice. */
export function emptyDesign(): Design {
  return {
    len: 20, wrap: "none", body: "#e9edf2", accent: "#c2cad4", trim: "#2a2f38", text: "#111317", font: "Big Shoulders Display",
    plate: false, lights: false, porch: false, chrome: false, propane: false, generator: false, smoker: false,
    cuisine: "other", name: "", tag: "", phone: "", signText: "", equip: [], items: [],
  };
}

export function preset(kind: PresetKey): Design {
  const base: Omit<Design, "equip" | "items"> = {
    len: 20, wrap: "full", body: "#c62828", accent: "#111317", trim: "#111317", text: "#ffffff", font: "Big Shoulders Display",
    plate: true, lights: true, porch: true, chrome: false, propane: true, generator: true, smoker: false,
    cuisine: "tacos", name: "Your Business Name", tag: "Authentic street food", phone: "775-555-0123", signText: "TACOS",
  };
  const P: Record<PresetKey, Partial<Design>> = {
    tacos: {},
    bbq: { len: 20, wrap: "full", body: "#111317", accent: "#ff7a1a", trim: "#2a2f38", text: "#f2b705", font: "Rye", smoker: true, cuisine: "bbq", name: "Smokestack BBQ", tag: "Low & slow, every day", signText: "BBQ" },
    desserts: { len: 18, wrap: "full", body: "#ff4f9a", accent: "#ffffff", trim: "#111317", text: "#ffffff", font: "Pacifico", cuisine: "desserts", name: "Sweet Spot", tag: "Shakes · Sundaes · Treats", signText: "SHAKES", generator: false },
    coffee: { len: 14, wrap: "full", body: "#0f1b33", accent: "#c9a24a", trim: "#c9a24a", text: "#ffffff", font: "Lobster", cuisine: "coffee", name: "Rolling Roast", tag: "Espresso on the go", signText: "COFFEE", propane: false, porch: false },
    blank: { wrap: "none", body: "#f3f4f6", accent: "#9aa4b0", trim: "#111317", text: "#111317", lights: false, porch: false, name: "", tag: "", phone: "", signText: "", cuisine: "other" },
  };
  const s: Design = { ...base, ...P[kind], equip: [], items: [] };
  const L = s.len;
  s.equip = [...CUISINES[s.cuisine].equip];
  if (kind === "blank") {
    s.items = [mk("window", L * 0.45)];
    return s;
  }
  s.items = [
    mk("window", L * 0.4),
    mk("awning", L * 0.4),
    mk("counter", L * 0.4),
    mk("door", L * 0.82),
    mk("ac", L * 0.66),
    mk("sign", L * 0.45),
    mk("text", L * 0.42, { y: TOP + 205, role: "name", size: 46 }),
    mk("text", L * 0.42, { y: TOP + 236, role: "tag", size: 20 }),
    mk("text", L * 0.1, { y: TOP + 140, role: "phone", size: 16 }),
  ];
  if (kind !== "coffee") s.items.push(mk("tv", L * 0.66));
  if (kind === "bbq" || kind === "tacos") s.items.push(mk("window_s", L * 0.12, { y: 0 }));
  return s;
}

/* ---------------- item helpers ---------------- */

export function itemW(it: Pick<Item, "type">, d: Pick<Design, "signText">): number {
  if (it.type === "sign") return Math.max(4.2, (d.signText || "EATS").length * 0.95 + 1.6);
  return GADGETS[it.type]?.w ?? 2;
}

export const isFree = (t: GadgetType) => t === "text";

export function clampItem(it: Item, d: Design): Item {
  const hw = itemW(it, d) / 2;
  const free = isFree(it.type);
  const lo = free ? 0.3 : hw;
  const hi = free ? d.len - 0.3 : d.len - hw;
  const next = { ...it, x: Math.max(lo, Math.min(hi, it.x)) };
  if (free && next.y != null) next.y = Math.max(TOP + 18, Math.min(BOT - 10, next.y));
  return next;
}

/* ---------------- share links (#d=…) — compatible with links from the old site ---------------- */

export function encodeDesign(d: Design): string {
  const bytes = new TextEncoder().encode(JSON.stringify(d));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export function decodeDesign(code: string): Design | null {
  try {
    const bin = atob(decodeURIComponent(code));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = designSchema.safeParse(migrateDesign(JSON.parse(new TextDecoder().decode(bytes))));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/* ---------------- older saved designs ---------------- */

/** Equipment from earlier versions of the builder → today's closest item (null = no longer offered). */
const OLD_EQUIP: Record<string, EquipKey | null> = {
  griddle: "grill3", charbroil: "grill3", fryer: "fryer2", range: "stove6", wok: "stove4", warmer: "steam2",
  reachin: "fridge1", freezer: "freezer1", prepfridge: "prep4", steam: "steam3",
  pizza: null, rice: null, ice: null, espresso: null, blender: null,
};
const REMOVED_ITEMS = new Set(["decal", "menu", "vent"]);

/** Bring a design saved by an older version of the builder up to date, so old share links still open. */
export function migrateDesign(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const d = { ...(raw as Record<string, unknown>) };
  if (typeof d.wrap === "string" && d.wrap !== "none" && d.wrap !== "full") d.wrap = d.wrap === "solid" ? "none" : "full";
  if (Array.isArray(d.equip)) {
    d.equip = d.equip
      .map((k) => (typeof k === "string" && k in OLD_EQUIP ? OLD_EQUIP[k] : k))
      .filter((k) => k !== null);
  }
  if (Array.isArray(d.items)) d.items = d.items.filter((i) => !(i && typeof i === "object" && REMOVED_ITEMS.has(String((i as { type?: unknown }).type))));
  return d;
}
