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
  equip: z.array(z.enum(EQUIP_KEYS as [EquipKey, ...EquipKey[]])).max(EQUIP_KEYS.length),
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

export function preset(kind: PresetKey): Design {
  const base: Omit<Design, "equip" | "items"> = {
    len: 20, wrap: "twotone", body: "#c62828", accent: "#111317", trim: "#111317", text: "#ffffff", font: "Big Shoulders Display",
    plate: true, lights: true, porch: true, chrome: false, propane: true, generator: true, smoker: false,
    cuisine: "tacos", name: "Your Business Name", tag: "Authentic street food", phone: "775-555-0123", signText: "TACOS",
  };
  const P: Record<PresetKey, Partial<Design>> = {
    tacos: {},
    bbq: { len: 20, wrap: "flames", body: "#111317", accent: "#ff7a1a", trim: "#2a2f38", text: "#f2b705", font: "Rye", smoker: true, cuisine: "bbq", name: "Smokestack BBQ", tag: "Low & slow, every day", signText: "BBQ" },
    desserts: { len: 18, wrap: "swoosh", body: "#ff4f9a", accent: "#ffffff", trim: "#111317", text: "#ffffff", font: "Pacifico", cuisine: "desserts", name: "Sweet Spot", tag: "Shakes · Sundaes · Treats", signText: "SHAKES", generator: false },
    coffee: { len: 14, wrap: "stripe", body: "#0f1b33", accent: "#c9a24a", trim: "#c9a24a", text: "#ffffff", font: "Lobster", cuisine: "coffee", name: "Rolling Roast", tag: "Espresso on the go", signText: "COFFEE", propane: false, porch: false },
    blank: { wrap: "solid", body: "#f3f4f6", accent: "#9aa4b0", trim: "#111317", text: "#111317", lights: false, porch: false, name: "", tag: "", phone: "", signText: "", cuisine: "other" },
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
    mk("vent", L * 0.25),
    mk("sign", L * 0.45),
    mk("text", L * 0.42, { y: TOP + 205, role: "name", size: 46 }),
    mk("text", L * 0.42, { y: TOP + 236, role: "tag", size: 20 }),
    mk("text", L * 0.1, { y: TOP + 140, role: "phone", size: 16 }),
  ];
  const deco: Partial<Record<PresetKey, [string, string]>> = { tacos: ["🌮", "🌶️"], bbq: ["🔥", "🍖"], desserts: ["🍦", "🍩"], coffee: ["☕", "🧋"] };
  const d = deco[kind];
  if (d) {
    s.items.push(mk("decal", L * 0.1, { y: TOP + 80, emoji: d[0], size: 64 }));
    s.items.push(mk("decal", L * 0.7, { y: TOP + 180, emoji: d[1], size: 52 }));
  }
  if (kind !== "coffee") s.items.push(mk("menu", L * 0.66));
  if (kind === "bbq" || kind === "tacos") s.items.push(mk("window_s", L * 0.12, { y: 0 }));
  if (kind === "bbq") {
    const first = s.items.find((i) => i.type === "decal");
    if (first) {
      first.x = L * 0.12;
      first.y = TOP + 30;
    }
    s.items = s.items.filter((i) => !(i.type === "decal" && i.emoji === "🔥"));
    s.items.push(mk("decal", L * 0.12, { y: TOP + 215, emoji: "🔥", size: 54 }));
  }
  return s;
}

/* ---------------- item helpers ---------------- */

export function itemW(it: Pick<Item, "type">, d: Pick<Design, "signText">): number {
  if (it.type === "sign") return Math.max(4.2, (d.signText || "EATS").length * 0.95 + 1.6);
  return GADGETS[it.type]?.w ?? 2;
}

export const isFree = (t: GadgetType) => t === "text" || t === "decal";

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
    const parsed = designSchema.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
