/* Trailer builder — static data. Equipment sizes, cooking presets and colors live here. */


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

/** Wraps are fully custom artwork, so the customer only chooses whether they want one. */
export const WRAPS = [
  ["none", "No wrap"],
  ["full", "Full custom wrap"],
] as const;
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
  | "fryer2"
  | "steam1" | "steam2" | "steam3"
  | "stove2" | "stove4" | "stove6"
  | "grill2" | "grill3" | "grill4"
  | "fridge1" | "fridge2"
  | "ucfridge1" | "ucfridge2" | "ucfridge3"
  | "char2" | "char3" | "char4"
  | "table2" | "table3" | "table4" | "table6"
  | "freezer1" | "freezer2"
  | "prep2" | "prep3" | "prep4" | "prep5"
  | "sink3" | "handsink";

type Equip = { n: string; w: number; row: "b" | "f"; cook?: boolean; cold?: boolean; req?: boolean };

/** w = feet of wall it takes; row b = back wall (street side), f = front (window side). */
export const EQUIP: Record<EquipKey, Equip> = {
  fryer2: { n: "Double-basket fryer", w: 1.5, row: "b", cook: true },
  steam1: { n: "1-well steam table", w: 1.5, row: "f" },
  steam2: { n: "2-well steam table", w: 2.5, row: "f" },
  steam3: { n: "3-well steam table", w: 3.5, row: "f" },
  stove2: { n: "2-burner stove", w: 1, row: "b", cook: true },
  stove4: { n: "4-burner stove", w: 2, row: "b", cook: true },
  stove6: { n: "6-burner stove", w: 3, row: "b", cook: true },
  grill2: { n: "2 ft flat-top grill", w: 2, row: "b", cook: true },
  grill3: { n: "3 ft flat-top grill", w: 3, row: "b", cook: true },
  grill4: { n: "4 ft flat-top grill", w: 4, row: "b", cook: true },
  fridge1: { n: "Single-door upright refrigerator", w: 2.5, row: "b", cold: true },
  fridge2: { n: "Double-door upright refrigerator", w: 4.5, row: "b", cold: true },
  ucfridge1: { n: "Single-door undercounter refrigerator", w: 2.5, row: "f", cold: true },
  ucfridge2: { n: "Double-door undercounter refrigerator", w: 4, row: "f", cold: true },
  ucfridge3: { n: "Triple-door undercounter refrigerator", w: 6, row: "f", cold: true },
  char2: { n: "2 ft charbroiler grill", w: 2, row: "b", cook: true },
  char3: { n: "3 ft charbroiler grill", w: 3, row: "b", cook: true },
  char4: { n: "4 ft charbroiler grill", w: 4, row: "b", cook: true },
  table2: { n: "2 ft stainless work table", w: 2, row: "f" },
  table3: { n: "3 ft stainless work table", w: 3, row: "f" },
  table4: { n: "4 ft stainless work table", w: 4, row: "f" },
  table6: { n: "6 ft stainless work table", w: 6, row: "f" },
  freezer1: { n: "Single-door upright freezer", w: 2.5, row: "b", cold: true },
  freezer2: { n: "Double-door upright freezer", w: 4.5, row: "b", cold: true },
  prep2: { n: "2 ft cold prep table", w: 2, row: "f", cold: true },
  prep3: { n: "3 ft cold prep table", w: 3, row: "f", cold: true },
  prep4: { n: "4 ft cold prep table", w: 4, row: "f", cold: true },
  prep5: { n: "5 ft cold prep table", w: 5, row: "f", cold: true },
  sink3: { n: "Three-compartment sink", w: 5, row: "f", req: true },
  handsink: { n: "Separate hand-wash sink", w: 1.5, row: "f", req: true },
};
export const EQUIP_KEYS = Object.keys(EQUIP) as EquipKey[];

/** How the equipment list is grouped in the builder. Customers can add several of any item. */
export const EQUIP_GROUPS: { title: string; keys: EquipKey[]; note?: string }[] = [
  { title: "Fryers", keys: ["fryer2"] },
  { title: "Steam tables", keys: ["steam1", "steam2", "steam3"] },
  { title: "Burners", keys: ["stove2", "stove4", "stove6"] },
  { title: "Flat-top grills", keys: ["grill2", "grill3", "grill4"] },
  { title: "Charbroiler grills", keys: ["char2", "char3", "char4"] },
  { title: "Upright refrigerators", keys: ["fridge1", "fridge2"] },
  { title: "Undercounter refrigerators", keys: ["ucfridge1", "ucfridge2", "ucfridge3"] },
  { title: "Freezers", keys: ["freezer1", "freezer2"] },
  { title: "Cold prep tables", keys: ["prep2", "prep3", "prep4", "prep5"] },
  { title: "Stainless steel work tables", keys: ["table2", "table3", "table4", "table6"], note: "Custom sizes built to fit your layout" },
  { title: "Sinks", keys: ["sink3", "handsink"], note: "Mandatory in every build — both sinks are always included" },
];
/** Most of one item a customer can add. */
export const MAX_QTY = 4;

export type CuisineKey = "tacos" | "bbq" | "burgers" | "pizza" | "desserts" | "coffee" | "asian" | "other";

export const CUISINES: Record<CuisineKey, { e: string; n: string; sign: string; equip: EquipKey[] }> = {
  tacos: { e: "🌮", n: "Tacos", sign: "TACOS", equip: ["grill3", "fryer2", "prep4", "fridge1", "steam3", "sink3", "handsink"] },
  bbq: { e: "🔥", n: "BBQ", sign: "BBQ", equip: ["steam2", "prep3", "fridge1", "freezer1", "sink3", "handsink"] },
  burgers: { e: "🍔", n: "Burgers", sign: "BURGERS", equip: ["grill4", "fryer2", "prep3", "freezer1", "sink3", "handsink"] },
  pizza: { e: "🍕", n: "Pizza", sign: "PIZZA", equip: ["prep5", "fridge1", "freezer1", "sink3", "handsink"] },
  desserts: { e: "🍦", n: "Desserts", sign: "SHAKES", equip: ["freezer2", "fridge1", "prep3", "sink3", "handsink"] },
  coffee: { e: "☕", n: "Coffee", sign: "COFFEE", equip: ["fridge1", "prep2", "sink3", "handsink"] },
  asian: { e: "🍜", n: "Asian", sign: "NOODLES", equip: ["stove4", "fryer2", "steam2", "prep3", "fridge1", "sink3", "handsink"] },
  other: { e: "⭐", n: "Other", sign: "EATS", equip: ["grill3", "prep3", "fridge1", "sink3", "handsink"] },
};
export const CUISINE_KEYS = Object.keys(CUISINES) as CuisineKey[];

export type GadgetType = "window" | "window_s" | "awning" | "counter" | "door" | "tv" | "ac" | "sign" | "text";

export const GADGETS: Record<GadgetType, { n: string; w: number }> = {
  window: { n: "Service window", w: 6 },
  window_s: { n: "Small window", w: 3.5 },
  awning: { n: "Awning", w: 6.5 },
  counter: { n: "Serving shelf", w: 6 },
  door: { n: "Side door", w: 2.6 },
  tv: { n: "TV menu", w: 3 },
  ac: { n: "A/C unit", w: 2.3 },
  sign: { n: "Roof sign", w: 6 },
  text: { n: "Text", w: 4 },
};
export const GADGET_TYPES = Object.keys(GADGETS) as GadgetType[];
export const PALETTE: GadgetType[] = ["window", "window_s", "awning", "counter", "door", "tv", "ac", "sign", "text"];

export type ExteriorOption = "plate" | "lights" | "porch" | "chrome" | "propane" | "generator";
export const EXTERIOR_OPTIONS: { key: ExteriorOption; label: string; group: "exterior" | "tongue" }[] = [
  { key: "plate", label: "Diamond plate", group: "exterior" },
  { key: "lights", label: "Marquee lights", group: "exterior" },
  { key: "porch", label: "Patio / porch", group: "exterior" },
  { key: "chrome", label: "Chrome wheels", group: "exterior" },
  { key: "propane", label: "Propane tanks", group: "tongue" },
  { key: "generator", label: "Generator box", group: "tongue" },
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
