/* Trailer builder — static data. Equipment sizes, cooking presets and colors live here. */

import { FANCY_WRAPS } from "./wraps";

/** Scene geometry (SVG units). PPF = pixels per foot of trailer length. */
export const W = 1500;
export const SCENE_H = 560;
export const PPF = 36;
export const TOP = 150;
export const H = 270;
export const BOT = TOP + H;
export const GROUND = 498;
export const ASPECT = 2.2;

export const LENGTHS = [12, 14, 16, 18, 20, 24, 28] as const;
export type TrailerLength = (typeof LENGTHS)[number];

export const COLORS = {
  body: ["#c62828", "#ff7a1a", "#f2b705", "#1f8a4c", "#2457d6", "#0f1b33", "#111317", "#f3f4f6", "#7a4a2a", "#8e24aa", "#9aa4b0", "#00a0a8"],
  accent: ["#ff7a1a", "#f2b705", "#c62828", "#ffffff", "#111317", "#2457d6", "#1f8a4c", "#ff4f9a", "#9aa4b0"],
  trim: ["#111317", "#9aa4b0", "#ffffff", "#2a2f38", "#c9a24a"],
  text: ["#ffffff", "#111317", "#f2b705", "#ff7a1a", "#c62828", "#2457d6"],
} as const;
export type ColorKey = keyof typeof COLORS;

export const BASIC_WRAPS = [
  ["solid", "Solid"],
  ["twotone", "Two-tone"],
  ["stripe", "Stripe"],
  ["swoosh", "Swoosh"],
  ["flames", "Flames"],
  ["checker", "Checker"],
] as const;
/** All wraps: the classic paint layouts, then the graphic wraps from wraps.ts. */
export const WRAPS = [...BASIC_WRAPS, ...FANCY_WRAPS] as const;
export type WrapStyle = (typeof WRAPS)[number][0];

export const FONTS = [
  ["Big Shoulders Display", "Bold"],
  ["Bungee", "Street"],
  ["Pacifico", "Script"],
  ["Lobster", "Retro"],
  ["Rye", "Western"],
  ["Permanent Marker", "Marker"],
] as const;
export const TEXT_FONTS = [...FONTS, ["Barlow Condensed", "Clean"]] as const;

export type EquipKey =
  | "griddle" | "charbroil" | "fryer" | "fryer2" | "range" | "wok" | "pizza" | "warmer" | "rice"
  | "reachin" | "freezer" | "ice" | "prepfridge" | "steam" | "espresso" | "blender" | "sink3" | "handsink";

/** w = feet of wall; row b = back wall (street side), f = front (window side). */
export const EQUIP: Record<EquipKey, { n: string; w: number; row: "b" | "f"; cook?: boolean; req?: boolean }> = {
  griddle: { n: "Flat-top griddle", w: 3, row: "b", cook: true },
  charbroil: { n: "Charbroiler", w: 3, row: "b", cook: true },
  fryer: { n: "Fryer", w: 1.5, row: "b", cook: true },
  fryer2: { n: "Double fryer", w: 3, row: "b", cook: true },
  range: { n: "6-burner range", w: 3, row: "b", cook: true },
  wok: { n: "Wok range", w: 3, row: "b", cook: true },
  pizza: { n: "Pizza oven", w: 4, row: "b", cook: true },
  warmer: { n: "Holding cabinet", w: 2, row: "b" },
  rice: { n: "Rice cooker / warmer", w: 2, row: "f" },
  reachin: { n: "Reach-in fridge", w: 2.5, row: "b" },
  freezer: { n: "Freezer", w: 2.5, row: "b" },
  ice: { n: "Ice machine", w: 2.5, row: "b" },
  prepfridge: { n: "Prep table fridge", w: 4, row: "f" },
  steam: { n: "Steam table", w: 4, row: "f" },
  espresso: { n: "Espresso machine", w: 3, row: "f" },
  blender: { n: "Blender station", w: 3, row: "f" },
  sink3: { n: "3-compartment sink", w: 5, row: "f", req: true },
  handsink: { n: "Hand-wash sink", w: 1.5, row: "f", req: true },
};
export const EQUIP_KEYS = Object.keys(EQUIP) as EquipKey[];

export type CuisineKey = "tacos" | "bbq" | "burgers" | "pizza" | "desserts" | "coffee" | "asian" | "other";

export const CUISINES: Record<CuisineKey, { e: string; n: string; sign: string; equip: EquipKey[] }> = {
  tacos: { e: "🌮", n: "Tacos", sign: "TACOS", equip: ["griddle", "fryer", "prepfridge", "reachin", "steam", "sink3", "handsink"] },
  bbq: { e: "🔥", n: "BBQ", sign: "BBQ", equip: ["charbroil", "warmer", "prepfridge", "reachin", "sink3", "handsink"] },
  burgers: { e: "🍔", n: "Burgers", sign: "BURGERS", equip: ["griddle", "fryer2", "prepfridge", "freezer", "sink3", "handsink"] },
  pizza: { e: "🍕", n: "Pizza", sign: "PIZZA", equip: ["pizza", "prepfridge", "reachin", "sink3", "handsink"] },
  desserts: { e: "🍦", n: "Desserts", sign: "SHAKES", equip: ["freezer", "reachin", "blender", "prepfridge", "sink3", "handsink"] },
  coffee: { e: "☕", n: "Coffee", sign: "COFFEE", equip: ["espresso", "reachin", "ice", "sink3", "handsink"] },
  asian: { e: "🍜", n: "Asian", sign: "NOODLES", equip: ["wok", "fryer", "rice", "prepfridge", "reachin", "sink3", "handsink"] },
  other: { e: "⭐", n: "Other", sign: "EATS", equip: ["griddle", "prepfridge", "reachin", "sink3", "handsink"] },
};
export const CUISINE_KEYS = Object.keys(CUISINES) as CuisineKey[];

export type GadgetType = "window" | "window_s" | "awning" | "counter" | "door" | "menu" | "tv" | "ac" | "vent" | "sign" | "text" | "decal";

export const GADGETS: Record<GadgetType, { n: string; w: number }> = {
  window: { n: "Service window", w: 6 },
  window_s: { n: "Small window", w: 3.5 },
  awning: { n: "Awning", w: 6.5 },
  counter: { n: "Serving shelf", w: 6 },
  door: { n: "Side door", w: 2.6 },
  menu: { n: "Menu board", w: 2.6 },
  tv: { n: "TV menu", w: 3 },
  ac: { n: "A/C unit", w: 2.3 },
  vent: { n: "Roof vent", w: 2.2 },
  sign: { n: "Roof sign", w: 6 },
  text: { n: "Text", w: 4 },
  decal: { n: "Decal", w: 2 },
};
export const GADGET_TYPES = Object.keys(GADGETS) as GadgetType[];
export const PALETTE: GadgetType[] = ["window", "window_s", "awning", "counter", "door", "menu", "tv", "ac", "vent", "sign", "text"];

export const EMOJI = ["🌮", "🌯", "🍔", "🍟", "🍕", "🌭", "🍗", "🍖", "🔥", "🌶️", "🍦", "🍩", "☕", "🧋", "🍜", "🥟", "🍤", "⭐"];

export type ExteriorOption = "plate" | "lights" | "porch" | "chrome" | "propane" | "generator" | "smoker";
export const EXTERIOR_OPTIONS: { key: ExteriorOption; label: string; group: "exterior" | "tongue" }[] = [
  { key: "plate", label: "Diamond plate", group: "exterior" },
  { key: "lights", label: "Marquee lights", group: "exterior" },
  { key: "porch", label: "Rear porch", group: "exterior" },
  { key: "chrome", label: "Chrome wheels", group: "exterior" },
  { key: "propane", label: "Propane tanks", group: "tongue" },
  { key: "generator", label: "Generator box", group: "tongue" },
  { key: "smoker", label: "BBQ smoker", group: "tongue" },
];

export type PresetKey = "tacos" | "bbq" | "desserts" | "coffee" | "blank";
export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "tacos", label: "🌮 Taco trailer" },
  { key: "bbq", label: "🔥 BBQ smokehouse" },
  { key: "desserts", label: "🍦 Shakes & desserts" },
  { key: "coffee", label: "☕ Coffee bar" },
  { key: "blank", label: "Blank trailer" },
];

export const ROLE_LABEL = { name: "Business name", tag: "Tagline", phone: "Phone" } as const;
export type TextRole = keyof typeof ROLE_LABEL;
export const ROLE_FIELD = { name: "name", tag: "tag", phone: "phone" } as const;
