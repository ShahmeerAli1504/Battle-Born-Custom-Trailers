/* Trailer builder — graphic wraps. Each wrap draws inside a box (the trailer body, or a picker
   thumbnail) using sizes relative to the box height, so the same code renders both. */

type Box = { x: number; y: number; w: number; h: number };
type Cols = { body: string; accent: string; trim: string };

export const FANCY_WRAPS = [
  ["racing", "Racing"],
  ["retrowave", "Retro Wave"],
  ["sunburst", "Sunburst"],
  ["mountains", "Nevada Peaks"],
  ["serape", "Serape"],
  ["drip", "Paint Drip"],
  ["lightning", "Lightning"],
  ["camo", "Camo"],
  ["carbon", "Carbon"],
  ["fade", "Fade"],
] as const;
export type FancyWrap = (typeof FANCY_WRAPS)[number][0];
export const isFancyWrap = (w: string): w is FancyWrap => FANCY_WRAPS.some(([k]) => k === w);

/* ---------- helpers ---------- */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("");
}
/** Small deterministic RNG so camo / drips look the same every render. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;
const pts = (p: [number, number][]) => p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");

function star(cx: number, cy: number, R: number) {
  const p: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.42 : R;
    p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts(p);
}

/* ---------- the wraps ---------- */
const DRAW: Record<FancyWrap, (b: Box, c: Cols, id: string) => string> = {
  racing: ({ x, y, w, h }, c) => {
    const u = h / 270, rise = Math.min(h * 0.22, w * 0.08), t = 26 * u;
    let s = "";
    for (let k = 0; k < 2; k++) {
      const y0 = y + h * 0.56 + k * 40 * u;
      s += `<polygon points="${pts([[x, y0], [x + w, y0 - rise], [x + w, y0 - rise + t], [x, y0 + t]])}" fill="${c.accent}"/>`;
    }
    const line = (yy: number) => `<polygon points="${pts([[x, yy], [x + w, yy - rise], [x + w, yy - rise + 3 * u], [x, yy + 3 * u]])}" fill="${c.trim}"/>`;
    return s + line(y + h * 0.56 - 9 * u) + line(y + h * 0.56 + 40 * u + t + 6 * u);
  },

  retrowave: ({ x, y, w, h }, c) => {
    const u = h / 270, cols = [shade(c.accent, 0.4), c.trim, c.accent];
    return cols
      .map((col, i) => {
        const base = y + h * (0.4 + i * 0.13), amp = 14 * u, wl = 180 * u, step = Math.max(2, w / 60);
        let d = `M${r1(x)} ${r1(y + h)} L${r1(x)} ${r1(base)}`;
        for (let xx = x; xx <= x + w + step; xx += step) d += ` L${r1(xx)} ${r1(base + Math.sin(((xx - x) / wl) * Math.PI * 2 + i * 1.3) * amp)}`;
        return `<path d="${d} L${r1(x + w + step)} ${r1(y + h)} Z" fill="${col}"/>`;
      })
      .join("");
  },

  sunburst: ({ x, y, w, h }, c) => {
    const cx = x + w * 0.16, cy = y + h * 1.08, L = Math.max(w, h) * 3, n = 18;
    let s = "";
    for (let i = 0; i < n; i += 2) {
      const a0 = (-175 + (170 * i) / n) * (Math.PI / 180), a1 = (-175 + (170 * (i + 1)) / n) * (Math.PI / 180);
      s += `<polygon points="${pts([[cx, cy], [cx + Math.cos(a0) * L, cy + Math.sin(a0) * L], [cx + Math.cos(a1) * L, cy + Math.sin(a1) * L]])}" fill="${c.accent}" opacity=".85"/>`;
    }
    return s + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(h * 0.42)}" fill="${c.trim}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(h * 0.3)}" fill="${c.accent}"/>`;
  },

  mountains: ({ x, y, w, h }, c) => {
    const u = h / 270;
    const ridge = (base: number, peaks: number[], col: string) => {
      const n = peaks.length, p: [number, number][] = [[x, y + h]];
      peaks.forEach((pk, i) => {
        p.push([x + (w * i) / (n - 1) - (i % 2 ? w * 0.03 : 0), base - pk * h]);
        if (i < n - 1) p.push([x + (w * (i + 0.5)) / (n - 1), base - pk * h * 0.35]);
      });
      p.push([x + w, y + h]);
      return `<polygon points="${pts(p)}" fill="${col}"/>`;
    };
    // sun + the Battle Born star over a two-layer Sierra skyline
    return (
      `<circle cx="${r1(x + w * 0.74)}" cy="${r1(y + h * 0.42)}" r="${r1(46 * u)}" fill="${shade(c.accent, 0.55)}"/>` +
      ridge(y + h * 0.72, [0.18, 0.34, 0.2, 0.42, 0.24, 0.36, 0.16, 0.3], shade(c.accent, 0.3)) +
      ridge(y + h * 0.86, [0.12, 0.26, 0.14, 0.3, 0.1, 0.24, 0.18, 0.12, 0.22], c.accent) +
      `<rect x="${r1(x)}" y="${r1(y + h * 0.86)}" width="${r1(w)}" height="${r1(h * 0.14)}" fill="${c.trim}"/>` +
      `<polygon points="${star(x + w * 0.56, y + h * 0.2, 24 * u)}" fill="${c.trim}"/>`
    );
  },

  serape: ({ x, y, w, h }, c) => {
    const u = h / 270;
    const band: [string, number][] = [[c.accent, 16], ["#f2b705", 5], ["#c62828", 10], ["#1f8a4c", 4], ["#2457d6", 12], ["#ff4f9a", 5], ["#ffffff", 3], ["#7a4a2a", 8]];
    let s = "", yy = y + h * 0.46, i = 0;
    while (yy < y + h) {
      const [col, t] = band[i % band.length]!;
      s += `<rect x="${r1(x)}" y="${r1(yy)}" width="${r1(w)}" height="${r1(t * u + 0.5)}" fill="${col}"/>`;
      yy += t * u;
      i++;
    }
    return s;
  },

  drip: ({ x, y, w, h }, c) => {
    const u = h / 270, rand = rng(7), top = 44 * u;
    let s = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(top)}" fill="${c.accent}"/>`;
    for (let xx = x + 6 * u; xx < x + w - 8 * u; xx += (22 + rand() * 26) * u) {
      const dw = (10 + rand() * 14) * u, len = (18 + rand() * 110) * u;
      s += `<rect x="${r1(xx)}" y="${r1(y + top - dw / 2)}" width="${r1(dw)}" height="${r1(len + dw / 2)}" rx="${r1(dw / 2)}" fill="${c.accent}"/>`;
      if (rand() > 0.6) s += `<circle cx="${r1(xx + dw / 2)}" cy="${r1(y + top + len + 14 * u)}" r="${r1(dw * 0.32)}" fill="${c.accent}"/>`;
    }
    return s + `<rect x="${r1(x)}" y="${r1(y + h * 0.9)}" width="${r1(w)}" height="${r1(h * 0.1)}" fill="${c.trim}"/>`;
  },

  lightning: ({ x, y, w, h }, c) => {
    const u = h / 270;
    const P: [number, number][] = [[0, 0.62], [0.38, 0.5], [0.33, 0.62], [0.7, 0.42], [0.64, 0.56], [1, 0.36], [1, 0.5], [0.68, 0.7], [0.73, 0.57], [0.36, 0.77], [0.41, 0.65], [0, 0.79]];
    return `<polygon points="${pts(P.map(([px, py]) => [x + px * w, y + py * h]))}" fill="${c.accent}" stroke="${c.trim}" stroke-width="${r1(5 * u)}" stroke-linejoin="round"/>`;
  },

  camo: ({ x, y, w, h }, c) => {
    const u = h / 270, rand = rng(11), cols = [c.accent, c.trim, shade(c.body, -0.35), shade(c.accent, 0.35)];
    const n = Math.max(10, Math.min(140, Math.round((w * h) / (2200 * u * u))));
    let s = "";
    for (let i = 0; i < n; i++) {
      const cx = x + rand() * w, cy = y + rand() * h, rx = (18 + rand() * 34) * u, ry = (12 + rand() * 22) * u, rot = Math.round(rand() * 180);
      s += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(${rot} ${r1(cx)} ${r1(cy)})" fill="${cols[i % cols.length]}" opacity=".92"/>`;
    }
    return s;
  },

  carbon: ({ x, y, w, h }, c, id) => {
    const u = h / 270, s = 12 * u;
    return (
      `<defs><pattern id="${id}cf" width="${r1(s)}" height="${r1(s)}" patternUnits="userSpaceOnUse" x="${r1(x)}" y="${r1(y)}"><rect width="${r1(s)}" height="${r1(s)}" fill="#15171b"/><rect width="${r1(s / 2)}" height="${r1(s / 2)}" fill="#2a2e35"/><rect x="${r1(s / 2)}" y="${r1(s / 2)}" width="${r1(s / 2)}" height="${r1(s / 2)}" fill="#2a2e35"/></pattern></defs>` +
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="url(#${id}cf)"/>` +
      `<rect x="${r1(x)}" y="${r1(y + h * 0.62)}" width="${r1(w)}" height="${r1(12 * u)}" fill="${c.accent}"/>` +
      `<rect x="${r1(x)}" y="${r1(y + h * 0.62 + 18 * u)}" width="${r1(w)}" height="${r1(4 * u)}" fill="${c.accent}"/>`
    );
  },

  fade: ({ x, y, w, h }, c, id) =>
    `<defs><linearGradient id="${id}fd" x1="0" y1="0" x2="0.25" y2="1"><stop offset=".15" stop-color="${c.accent}" stop-opacity="0"/><stop offset=".95" stop-color="${c.accent}"/></linearGradient></defs>` +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="url(#${id}fd)"/>`,
};

/** Draw a graphic wrap into `box`. `id` keeps gradient / pattern ids unique on the page. */
export function drawFancyWrap(wrap: FancyWrap, box: Box, cols: Cols, id = "w"): string {
  return DRAW[wrap](box, cols, id);
}
