/* Trailer builder — "Full custom wrap" preview.
   Wraps are designed with each customer, so the builder only shows that the trailer is fully
   wrapped: an edge-to-edge graphic in the customer's body / accent / trim colors.
   Sizes are relative to the box height, so the same code draws the trailer and the picker thumbnail. */

type Box = { x: number; y: number; w: number; h: number };
type Cols = { body: string; accent: string; trim: string };

const r1 = (n: number) => Math.round(n * 10) / 10;

export function drawFullWrap({ x, y, w, h }: Box, c: Cols, id = "w"): string {
  const u = h / 270;
  // sweeping bands from the hitch end up toward the rear, like a printed vinyl wrap
  const band = (y0: number, y1: number, rise: number) =>
    `M${r1(x)} ${r1(y + h * y0)} C${r1(x + w * 0.35)} ${r1(y + h * (y0 + 0.08))} ${r1(x + w * 0.62)} ${r1(y + h * (y0 - rise))} ${r1(x + w)} ${r1(y + h * (y0 - rise - 0.18))} L${r1(x + w)} ${r1(y + h * (y1 - rise - 0.18))} C${r1(x + w * 0.62)} ${r1(y + h * (y1 - rise))} ${r1(x + w * 0.35)} ${r1(y + h * (y1 + 0.08))} ${r1(x)} ${r1(y + h * y1)} Z`;
  return (
    `<defs><linearGradient id="${id}fw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.body}"/><stop offset="1" stop-color="${c.accent}" stop-opacity=".55"/></linearGradient></defs>` +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="url(#${id}fw)"/>` +
    `<path d="${band(0.62, 1.05, 0.2)}" fill="${c.accent}"/>` +
    `<path d="${band(0.56, 0.6, 0.2)}" fill="${c.trim}"/>` +
    `<path d="${band(0.48, 0.52, 0.22)}" fill="${c.accent}" opacity=".7"/>` +
    `<circle cx="${r1(x + w * 0.85)}" cy="${r1(y + h * 0.22)}" r="${r1(70 * u)}" fill="${c.accent}" opacity=".18"/>` +
    `<circle cx="${r1(x + w * 0.85)}" cy="${r1(y + h * 0.22)}" r="${r1(40 * u)}" fill="${c.accent}" opacity=".18"/>`
  );
}
