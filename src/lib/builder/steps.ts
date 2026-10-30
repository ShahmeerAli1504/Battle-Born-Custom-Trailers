/* Trailer builder — step requirements. A step unlocks only when every earlier step is complete. */

import type { Design } from "./design";
import type { PlanData } from "./scene";

/** Choices the customer has to make themselves (they have no meaningful default). */
export type Pick = "len" | "wrap" | "body" | "accent" | "trim" | "font" | "text" | "cuisine";
export const ALL_PICKS: Pick[] = ["len", "wrap", "body", "accent", "trim", "font", "text", "cuisine"];

export type StepKey = "style" | "gadgets" | "brand" | "kitchen";
export const STEP_ORDER: StepKey[] = ["style", "gadgets", "brand", "kitchen"];

export type Requirement = { label: string; done: boolean };

export function requirements(step: StepKey, d: Design, picked: ReadonlySet<Pick>, pd: PlanData): Requirement[] {
  switch (step) {
    case "style":
      return [
        { label: "Choose a trailer length", done: picked.has("len") },
        { label: "Pick a body color", done: picked.has("body") },
        { label: "Pick an accent color", done: picked.has("accent") },
        { label: "Pick a trim color", done: picked.has("trim") },
      ];
    case "gadgets":
      return [{ label: "Add at least one service window", done: d.items.some((i) => i.type === "window" || i.type === "window_s") }];
    case "brand":
      return [
        { label: "Enter your business name", done: d.name.trim().length > 0 },
        { label: "Pick a name font", done: picked.has("font") },
        { label: "Pick a text color", done: picked.has("text") },
        { label: "Choose full custom wrap or no wrap", done: picked.has("wrap") },
      ];
    case "kitchen":
      return [
        { label: "Choose a cooking style", done: picked.has("cuisine") },
        { label: "Three-compartment sink (mandatory)", done: d.equip.includes("sink3") },
        { label: "Separate hand-wash sink (mandatory)", done: d.equip.includes("handsink") },
        { label: "Fit the equipment in your trailer", done: d.equip.length > 0 && !pd.over },
      ];
  }
}

export const isComplete = (reqs: Requirement[]) => reqs.every((r) => r.done);

/** Progress for every step: complete flags and whether each is unlocked. */
export function progress(d: Design, picked: ReadonlySet<Pick>, pd: PlanData) {
  const complete = STEP_ORDER.map((s) => isComplete(requirements(s, d, picked, pd)));
  const unlocked = STEP_ORDER.map((_, i) => complete.slice(0, i).every(Boolean));
  return { complete, unlocked, allDone: complete.every(Boolean) };
}
