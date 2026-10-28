/* Trailer builder — SVG scene generation. Pure functions: (design, options) → SVG markup.
   Used for the live stage, the PNG export, and the image attached to estimate emails. */

import { ASPECT, BOT, CUISINES, EQUIP, GROUND, H, LENGTHS, PPF, SCENE_H, TOP, W, WRAPS, type EquipKey, type WrapStyle } from "./constants";
import { itemW, type Design, type Item } from "./design";

export type View = "ext" | "plan";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/* ---------------- color helpers ---------------- */
export function shade(hex: string, amt: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return "#" + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
export const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/* ---------------- geometry ---------------- */
export const axles = (L: number) => (L <= 14 ? 1 : L <= 24 ? 2 : 3);
export const AXLE_LABEL = ["", "Single axle", "Tandem axle", "Triple axle"] as const;

type TonguePart = ["smoker" | "generator" | "propane", number];
function tongueParts(d: Design): TonguePart[] {
  const p: TonguePart[] = [];
  if (d.smoker) p.push(["smoker", 118]);
  if (d.generator) p.push(["generator", 62]);
  if (d.propane) p.push(["propane", 58]);
  return p;
}

export type Layout = { L: number; bw: number; bx: number; tlen: number; tparts: TonguePart[]; porch: number };
export function layout(d: Design): Layout {
  const L = d.len, bw = L * PPF;
  const tparts = tongueParts(d);
  const tlen = 80 + tparts.reduce((a, p) => a + p[1] + 8, 0);
  const porch = d.porch ? 96 : 0;
  const total = tlen + bw + porch;
  const bx = Math.round((W - total) / 2 + tlen);
  return { L, bw, bx, tlen, tparts, porch };
}

export function viewBox(d: Design, view: View): string {
  if (view !== "ext") {
    const vh = W / ASPECT;
    return `0 ${(SCENE_H - vh) / 2} ${W} ${vh}`;
  }
  const g = layout(d);
  const left = g.bx - g.tlen, right = g.bx + g.bw + g.porch;
  const vh0 = GROUND + 62 - (TOP - 110);
  const vw = Math.max(right - left + 140, vh0 * ASPECT), vh = vw / ASPECT;
  const cx = (left + right) / 2;
  return `${cx - vw / 2} ${GROUND + 62 - vh} ${vw} ${vh}`;
}

/** Convert a pointer x (scene units) to feet along the trailer box. */
export const sceneXToFeet = (d: Design, sx: number) => (sx - layout(d).bx) / PPF;

/* ---------------- gadgets ---------------- */
function drawItem(d: Design, it: Item, g: Layout, night: boolean): string {
  const w = itemW(it, d) * PPF, cx = g.bx + it.x * PPF, x = cx - w / 2;
  const trim = d.trim, acc = d.accent;
  let s = "";
  switch (it.type) {
    case "window":
    case "window_s": {
      const y = TOP + 48, h = it.type === "window" ? 118 : 96;
      s += `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="4" fill="${trim}"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>`;
      const panes = it.type === "window" ? 3 : 2;
      for (let i = 1; i < panes; i++) s += `<rect x="${x + (w * i) / panes - 2}" y="${y}" width="4" height="${h}" fill="${trim}"/>`;
      s += `<rect x="${x}" y="${y + h * 0.48}" width="${w}" height="3" fill="${trim}" opacity=".6"/>`;
      s += `<path d="M${x + 10} ${y + 8} l30 0 l-24 40 l-30 0z" fill="#fff" opacity=".18"/>`;
      if (night) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffcf7a" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#warm)" />`;
      break;
    }
    case "awning": {
      const y = TOP + 30, dd = 46;
      const stripes = Math.max(4, Math.round(w / 34));
      s += `<path d="M${x} ${y} L${x + w} ${y} L${x + w + 16} ${y + dd} L${x - 16} ${y + dd} Z" fill="${acc}"/>`;
      for (let i = 0; i < stripes; i += 2) {
        const a = x + (w * i) / stripes, b = x + (w * (i + 1)) / stripes, ka = -16 + (32 * i) / stripes, kb = -16 + (32 * (i + 1)) / stripes;
        s += `<path d="M${a} ${y} L${b} ${y} L${b + kb} ${y + dd} L${a + ka} ${y + dd} Z" fill="${lum(acc) > 0.6 ? "#c62828" : "#ffffff"}" opacity=".9"/>`;
      }
      let sc = `M${x - 16} ${y + dd}`;
      const n = Math.round((w + 32) / 22);
      for (let i = 0; i < n; i++) {
        const a = x - 16 + ((w + 32) * i) / n, b = x - 16 + ((w + 32) * (i + 1)) / n;
        sc += ` Q${(a + b) / 2} ${y + dd + 14} ${b} ${y + dd}`;
      }
      s += `<path d="${sc} Z" fill="${shade(acc, -0.15)}"/>`;
      s += `<line x1="${x - 14}" y1="${y + dd}" x2="${x - 2}" y2="${y + 88}" stroke="${trim}" stroke-width="3"/><line x1="${x + w + 14}" y1="${y + dd}" x2="${x + w + 2}" y2="${y + 88}" stroke="${trim}" stroke-width="3"/>`;
      break;
    }
    case "counter": {
      const y = TOP + 170;
      s += `<rect x="${x - 8}" y="${y}" width="${w + 16}" height="9" rx="2" fill="url(#steel)" stroke="#6d7684" stroke-width="1"/>`;
      s += `<path d="M${x + 8} ${y + 9} l18 26 M${x + w - 8} ${y + 9} l-18 26" stroke="#6d7684" stroke-width="3"/>`;
      break;
    }
    case "door": {
      const y = TOP + 16, h = H - 24;
      s += `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 4}" rx="3" fill="${trim}"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${shade(d.body, -0.12)}"/>`;
      s += `<rect x="${x + w * 0.2}" y="${y + 18}" width="${w * 0.6}" height="54" rx="6" fill="url(#glass)" stroke="${trim}" stroke-width="3"/>`;
      s += `<rect x="${x + w - 18}" y="${y + h * 0.52}" width="10" height="26" rx="3" fill="#cfd5dd"/>`;
      s += `<rect x="${x}" y="${y + h - 40}" width="${w}" height="40" fill="url(#plate)" opacity=".9"/>`;
      break;
    }
    case "menu": {
      const y = TOP + 60, h = 124;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#1b1f26" stroke="${d.trim}" stroke-width="4"/>`;
      s += `<text x="${cx}" y="${y + 22}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="15" fill="${acc === "#111317" ? "#f2b705" : acc}" letter-spacing="2">MENU</text>`;
      for (let i = 0; i < 6; i++) {
        s += `<rect x="${x + 10}" y="${y + 36 + i * 13}" width="${w * 0.5}" height="4" rx="2" fill="#e8ecf2" opacity=".75"/><rect x="${x + w - 26}" y="${y + 36 + i * 13}" width="16" height="4" rx="2" fill="#e8ecf2" opacity=".75"/>`;
      }
      break;
    }
    case "tv": {
      const y = TOP + 40, h = 66;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#0b0d11" stroke="#2a2f38" stroke-width="3"/>`;
      s += `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2" fill="url(#screen)"/>`;
      s += `<text x="${cx}" y="${y + 38}" text-anchor="middle" font-size="22">${CUISINES[d.cuisine].e}</text>`;
      if (night) s += `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="10" fill="#5aa2ff" opacity=".18" filter="url(#glow)"/>`;
      break;
    }
    case "ac": {
      const y = TOP + 14, h = 56;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#e9edf2" stroke="#9aa4b0" stroke-width="2"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${x + 8}" y="${y + 9 + i * 7}" width="${w - 16}" height="3" rx="1" fill="#9aa4b0"/>`;
      break;
    }
    case "vent": {
      const y = TOP - 46;
      s += `<rect x="${x + w * 0.15}" y="${y + 16}" width="${w * 0.7}" height="30" fill="url(#steel)" stroke="#6d7684"/>`;
      s += `<path d="M${x} ${y + 18} Q${cx} ${y - 10} ${x + w} ${y + 18} Z" fill="url(#steel)" stroke="#6d7684"/>`;
      for (let i = 1; i < 5; i++) s += `<line x1="${x + w * 0.15}" y1="${y + 16 + i * 6}" x2="${x + w * 0.85}" y2="${y + 16 + i * 6}" stroke="#6d7684" stroke-width="1.5"/>`;
      break;
    }
    case "sign": {
      const y = TOP - 92, h = 60, t = (d.signText || "EATS").toUpperCase();
      const face = d.body === acc ? "#111317" : acc;
      s += `<rect x="${x + w * 0.2}" y="${y + h}" width="6" height="${TOP - y - h - 8}" fill="${trim}"/><rect x="${x + w * 0.8 - 6}" y="${y + h}" width="6" height="${TOP - y - h - 8}" fill="${trim}"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${face}" stroke="${trim}" stroke-width="5"/>`;
      if (night) s += `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="12" fill="#fff2c4" opacity=".35" filter="url(#glow)"/>`;
      const tc = lum(face) > 0.6 ? "#111317" : "#ffffff";
      s += `<text x="${cx}" y="${y + h / 2 + 15}" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="800" font-size="44" letter-spacing="3" fill="${tc}" ${night ? 'filter="url(#glowText)"' : ""}>${esc(t)}</text>`;
      if (d.lights) {
        const n = Math.max(4, Math.round(w / 26));
        for (let i = 0; i <= n; i++) s += `<circle cx="${x + 6 + ((w - 12) * i) / n}" cy="${y - 2}" r="3.6" fill="${night ? "#ffe39a" : "#fff6dc"}" ${night ? 'filter="url(#glow)"' : ""}/>`;
      }
      break;
    }
    case "text": {
      const txt = it.role ? { name: d.name, tag: d.tag, phone: d.phone }[it.role] : it.text;
      if (!txt) break;
      const font = it.role === "name" ? d.font : it.font || "Barlow Condensed";
      const fw = it.role === "name" && d.font === "Big Shoulders Display" ? 800 : 700;
      const col = it.color || d.text;
      const stroke = lum(col) > 0.55 ? "#111317" : "#ffffff";
      const size = it.size || 28;
      const caps = it.role === "tag" || it.role === "phone";
      s += `<text x="${cx}" y="${it.y}" text-anchor="middle" font-family="${esc(font)},sans-serif" font-weight="${fw}" font-size="${size}" fill="${col}" stroke="${stroke}" stroke-width="${size > 30 ? 4 : 2.5}" paint-order="stroke" stroke-linejoin="round" ${caps ? 'letter-spacing="1.5"' : ""}>${esc(caps ? txt.toUpperCase() : txt)}</text>`;
      break;
    }
    case "decal": {
      s += `<text x="${cx}" y="${it.y}" text-anchor="middle" dominant-baseline="central" font-size="${it.size || 56}">${esc(it.emoji || "⭐")}</text>`;
      break;
    }
  }
  return `<g class="it" data-id="${esc(it.id)}">${s}</g>`;
}

/* ---------------- exterior ---------------- */
function wrapLayer(d: Design, g: Layout): string {
  const { bx, bw } = g, a = d.accent;
  switch (d.wrap) {
    case "twotone":
      return `<rect x="${bx}" y="${TOP + H * 0.56}" width="${bw}" height="${H}" fill="${a}"/><rect x="${bx}" y="${TOP + H * 0.56 - 7}" width="${bw}" height="7" fill="${d.trim}"/>`;
    case "stripe":
      return `<rect x="${bx}" y="${TOP + H * 0.6}" width="${bw}" height="38" fill="${a}"/><rect x="${bx}" y="${TOP + H * 0.6 - 10}" width="${bw}" height="4" fill="${a}"/><rect x="${bx}" y="${TOP + H * 0.6 + 44}" width="${bw}" height="4" fill="${a}"/>`;
    case "swoosh":
      return `<path d="M${bx} ${BOT} L${bx} ${BOT - 70} C${bx + bw * 0.35} ${BOT - 40} ${bx + bw * 0.6} ${TOP + 90} ${bx + bw} ${TOP + 40} L${bx + bw} ${BOT} Z" fill="${a}"/><path d="M${bx} ${BOT - 70} C${bx + bw * 0.35} ${BOT - 40} ${bx + bw * 0.6} ${TOP + 90} ${bx + bw} ${TOP + 40}" fill="none" stroke="${d.trim}" stroke-width="8"/>`;
    case "flames": {
      const step = 56;
      const flameH = (i: number) => 80 + ((i * 37) % 70) + (i % 3 === 0 ? 40 : 0);
      let p1 = `M${bx} ${BOT}`;
      for (let x = bx, i = 0; x < bx + bw; x += step, i++) {
        const h = flameH(i);
        p1 += ` Q${x + step * 0.15} ${BOT - h * 0.5} ${x + step * 0.5} ${BOT - h} Q${x + step * 0.55} ${BOT - h * 0.45} ${x + step} ${BOT - 20}`;
      }
      p1 += ` L${bx + bw} ${BOT} Z`;
      let p2 = `M${bx} ${BOT}`;
      for (let x = bx, i = 0; x < bx + bw; x += step, i++) {
        const h = flameH(i) * 0.55;
        p2 += ` Q${x + step * 0.2} ${BOT - h * 0.5} ${x + step * 0.5} ${BOT - h} Q${x + step * 0.6} ${BOT - h * 0.4} ${x + step} ${BOT - 10}`;
      }
      p2 += ` L${bx + bw} ${BOT} Z`;
      return `<path d="${p1}" fill="${a}"/><path d="${p2}" fill="${lum(a) > 0.7 ? "#c62828" : "#f2b705"}" opacity=".85"/>`;
    }
    case "checker":
      return `<rect x="${bx}" y="${BOT - 96}" width="${bw}" height="44" fill="url(#checker)"/><rect x="${bx}" y="${BOT - 100}" width="${bw}" height="4" fill="${d.trim}"/><rect x="${bx}" y="${BOT - 52}" width="${bw}" height="4" fill="${d.trim}"/>`;
    default:
      return "";
  }
}

function defs(d: Design, night: boolean): string {
  const g = layout(d);
  return `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${night ? '<stop offset="0" stop-color="#05070c"/><stop offset=".7" stop-color="#0d1730"/><stop offset="1" stop-color="#141c2c"/>' : '<stop offset="0" stop-color="#d6e0ea"/><stop offset=".75" stop-color="#eef2f6"/><stop offset="1" stop-color="#e3e7ec"/>'}</linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${night ? "#2a3550" : "#9fb4c8"}"/><stop offset="1" stop-color="${night ? "#141a28" : "#3e5468"}"/></linearGradient>
  <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3c" stop-opacity=".35"/></linearGradient>
  <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f7"/><stop offset=".5" stop-color="#b9c1cc"/><stop offset="1" stop-color="#8e98a6"/></linearGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b3f8a"/><stop offset="1" stop-color="#0b1838"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <pattern id="plate" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#b7bec8"/><path d="M2 5l4-3M9 12l4-3" stroke="#e9edf2" stroke-width="2.4" stroke-linecap="round"/><path d="M3 6l4-3M10 13l4-3" stroke="#7d8794" stroke-width="1" stroke-linecap="round"/></pattern>
  <pattern id="checker" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${d.accent}"/><rect width="11" height="11" fill="${d.trim === d.accent ? "#fff" : d.trim}"/><rect x="11" y="11" width="11" height="11" fill="${d.trim === d.accent ? "#fff" : d.trim}"/></pattern>
  <clipPath id="bodyClip"><rect x="${g.bx}" y="${TOP}" width="${d.len * PPF}" height="${H}" rx="6"/></clipPath>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="glowText" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="shadow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>`;
}

function wheel(d: Design, cx: number): string {
  const rim = d.chrome ? "url(#steel)" : "#1e2228";
  return (
    `<circle cx="${cx}" cy="${GROUND - 38}" r="38" fill="#14161a"/><circle cx="${cx}" cy="${GROUND - 38}" r="30" fill="#24282f"/><circle cx="${cx}" cy="${GROUND - 38}" r="22" fill="${rim}" stroke="${d.chrome ? "#8e98a6" : "#3a404a"}" stroke-width="2"/>` +
    [0, 72, 144, 216, 288]
      .map((a) => {
        const r = (a * Math.PI) / 180;
        return `<circle cx="${cx + Math.cos(r) * 13}" cy="${GROUND - 38 + Math.sin(r) * 13}" r="2.6" fill="${d.chrome ? "#6d7684" : "#5a616c"}"/>`;
      })
      .join("") +
    `<circle cx="${cx}" cy="${GROUND - 38}" r="6" fill="${d.chrome ? "#dfe4ea" : "#3a404a"}"/>`
  );
}

const LAYER: Partial<Record<Item["type"], number>> = { door: 1, window: 2, window_s: 2, menu: 3, tv: 3, ac: 3, text: 5, decal: 4, counter: 6, awning: 7, vent: 0, sign: 0 };

export function renderExterior(d: Design, night: boolean): string {
  const g = layout(d), { bx, bw, L } = g;
  let s = defs(d, night);
  s += `<rect x="-800" y="-200" width="${W + 1600}" height="1000" fill="url(#sky)"/>`;
  s += `<rect x="-800" y="${GROUND}" width="${W + 1600}" height="400" fill="${night ? "#0e131c" : "#cfd5dc"}"/>`;
  s += `<rect x="-800" y="${GROUND}" width="${W + 1600}" height="2" fill="${night ? "#1d2533" : "#b8c0c9"}"/>`;
  if (!night) {
    for (let i = 0; i < 8; i++) s += `<rect x="${120 + i * 170}" y="${GROUND + 30}" width="80" height="4" fill="#e9edf1" opacity=".8"/>`;
  } else {
    s += `<ellipse cx="${bx + bw / 2}" cy="${GROUND + 10}" rx="${bw * 0.55}" ry="24" fill="#ffb066" opacity=".12" filter="url(#glow)"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${(i * 137) % W}" cy="${((i * 59) % 150) - 30}" r="${i % 5 === 0 ? 1.6 : 1}" fill="#fff" opacity="${0.3 + (i % 4) * 0.15}"/>`;
  }
  // scale ruler
  const rc = night ? "#5b6677" : "#8b97a8";
  s += `<g opacity=".7"><line x1="${bx}" y1="${GROUND + 44}" x2="${bx + bw}" y2="${GROUND + 44}" stroke="${rc}" stroke-width="1.5"/><line x1="${bx}" y1="${GROUND + 38}" x2="${bx}" y2="${GROUND + 50}" stroke="${rc}" stroke-width="1.5"/><line x1="${bx + bw}" y1="${GROUND + 38}" x2="${bx + bw}" y2="${GROUND + 50}" stroke="${rc}" stroke-width="1.5"/><text x="${bx + bw / 2}" y="${GROUND + 40}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="15" letter-spacing="2" fill="${night ? "#8b97a8" : "#5b6677"}" style="paint-order:stroke" stroke="${night ? "#0e131c" : "#cfd5dc"}" stroke-width="8">${L} FT BOX</text></g>`;
  s += `<ellipse cx="${bx + bw / 2}" cy="${GROUND + 2}" rx="${bw / 2 + 40}" ry="10" fill="#000" opacity="${night ? 0.5 : 0.22}" filter="url(#shadow)"/>`;

  // tongue (A-frame)
  const ty = BOT + 24, tx0 = bx - g.tlen + 10;
  s += `<path d="M${bx} ${ty - 4} L${tx0 + 16} ${ty + 4} L${bx} ${ty + 10}" fill="none" stroke="#1e2228" stroke-width="9" stroke-linejoin="round"/>`;
  s += `<rect x="${tx0}" y="${ty - 2}" width="26" height="14" rx="5" fill="#1e2228"/><circle cx="${tx0 + 6}" cy="${ty + 5}" r="8" fill="#3a404a"/>`;
  s += `<rect x="${tx0 + 44}" y="${ty - 26}" width="9" height="${GROUND - ty + 20}" fill="#2a2f38"/><rect x="${tx0 + 36}" y="${GROUND - 6}" width="25" height="6" rx="2" fill="#2a2f38"/><rect x="${tx0 + 40}" y="${ty - 34}" width="17" height="10" rx="2" fill="#1e2228"/>`;
  let tpos = bx - 10;
  for (const [k, w] of g.tparts) {
    const x = tpos - w;
    tpos = x - 8;
    if (k === "propane") s += `<g><rect x="${x}" y="${ty - 74}" width="26" height="70" rx="12" fill="#f3f4f6" stroke="#9aa4b0" stroke-width="2"/><rect x="${x + 30}" y="${ty - 74}" width="26" height="70" rx="12" fill="#f3f4f6" stroke="#9aa4b0" stroke-width="2"/><rect x="${x + 8}" y="${ty - 84}" width="10" height="10" rx="2" fill="#9aa4b0"/><rect x="${x + 38}" y="${ty - 84}" width="10" height="10" rx="2" fill="#9aa4b0"/></g>`;
    if (k === "generator") s += `<g><rect x="${x}" y="${ty - 64}" width="${w}" height="58" rx="4" fill="url(#plate)" stroke="#6d7684" stroke-width="2"/><rect x="${x + 8}" y="${ty - 56}" width="${w - 16}" height="6" rx="2" fill="#6d7684"/><text x="${x + w / 2}" y="${ty - 22}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="11" fill="#2a2f38" letter-spacing="1">GEN</text></g>`;
    if (k === "smoker") s += `<g><rect x="${x + 6}" y="${ty - 58}" width="${w - 12}" height="52" rx="26" fill="#1b1d21" stroke="#3a404a" stroke-width="3"/><rect x="${x + w - 30}" y="${ty - 112}" width="14" height="58" fill="#1b1d21"/><rect x="${x + w - 34}" y="${ty - 118}" width="22" height="8" rx="2" fill="#2a2f38"/><path d="M${x + 20} ${ty - 34} h${w - 46}" stroke="#3a404a" stroke-width="3"/><rect x="${x + w / 2 - 10}" y="${ty - 40}" width="20" height="5" rx="2" fill="#9aa4b0"/>${night ? `<circle cx="${x + w - 23}" cy="${ty - 130}" r="10" fill="#ffb066" opacity=".2" filter="url(#glow)"/>` : ""}<path d="M${x + w - 23} ${ty - 124} q-10 -14 2 -26 q10 -12 -2 -26" fill="none" stroke="${night ? "#5b6677" : "#b8c0c9"}" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>`;
  }

  // chassis, wheels, fenders
  s += `<rect x="${bx - 6}" y="${BOT}" width="${bw + 12}" height="18" fill="#1e2228"/>`;
  const ax = axles(L), mid = bx + bw * 0.56, sp = 90;
  const wx = Array.from({ length: ax }, (_, i) => mid + (i - (ax - 1) / 2) * sp);
  const w0 = wx[0]!, wN = wx[ax - 1]!;
  s += `<path d="M${w0 - 56} ${BOT + 18} Q${w0 - 56} ${BOT - 14} ${w0 - 24} ${BOT - 14} L${wN + 24} ${BOT - 14} Q${wN + 56} ${BOT - 14} ${wN + 56} ${BOT + 18} Z" fill="#14161a"/>`;
  wx.forEach((x) => (s += wheel(d, x)));
  s += `<path d="M${w0 - 58} ${BOT + 16} Q${w0 - 58} ${BOT - 18} ${w0 - 24} ${BOT - 18} L${wN + 24} ${BOT - 18} Q${wN + 58} ${BOT - 18} ${wN + 58} ${BOT + 16}" fill="none" stroke="${d.chrome ? "url(#steel)" : "#2a2f38"}" stroke-width="7"/>`;

  // body
  s += `<g clip-path="url(#bodyClip)">`;
  s += `<rect x="${bx}" y="${TOP}" width="${bw}" height="${H}" fill="${d.body}"/>`;
  s += wrapLayer(d, g);
  if (d.plate) s += `<rect x="${bx}" y="${BOT - 34}" width="${bw}" height="34" fill="url(#plate)"/><rect x="${bx}" y="${BOT - 36}" width="${bw}" height="2" fill="#7d8794"/>`;
  s += `<rect x="${bx}" y="${TOP}" width="${bw}" height="${H}" fill="url(#sheen)"/>`;
  if (night) s += `<rect x="${bx}" y="${TOP}" width="${bw}" height="${H}" fill="#050812" opacity=".38"/>`;
  s += `</g>`;
  s += `<path d="M${w0 - 52} ${BOT} Q${w0 - 52} ${BOT - 10} ${w0 - 24} ${BOT - 10} L${wN + 24} ${BOT - 10} Q${wN + 52} ${BOT - 10} ${wN + 52} ${BOT} Z" fill="#14161a"/>`;
  // trim
  s += `<rect x="${bx - 4}" y="${TOP - 10}" width="${bw + 8}" height="14" rx="4" fill="${d.trim}"/>`;
  s += `<rect x="${bx - 4}" y="${TOP}" width="9" height="${H}" fill="${d.trim}"/><rect x="${bx + bw - 5}" y="${TOP}" width="9" height="${H}" fill="${d.trim}"/>`;
  s += `<rect x="${bx - 4}" y="${BOT - 4}" width="${bw + 8}" height="8" fill="${d.trim}"/>`;
  s += `<rect x="${bx + bw - 2}" y="${BOT - 58}" width="7" height="20" rx="2" fill="#e53935"/><rect x="${bx - 5}" y="${TOP + 6}" width="6" height="10" rx="2" fill="#ffb300"/>`;
  s += `<g opacity=".9"><rect x="${bx + bw - 128}" y="${BOT - (d.plate ? 60 : 30)}" width="112" height="18" rx="3" fill="#0d1118"/><text x="${bx + bw - 72}" y="${BOT - (d.plate ? 47 : 17)}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="11" letter-spacing="1.6" fill="#c9d2de">★ BATTLE BORN BUILT</text></g>`;
  // porch
  if (d.porch) {
    const px = bx + bw + 4;
    s += `<rect x="${px}" y="${BOT + 2}" width="${g.porch - 8}" height="8" fill="url(#plate)" stroke="#2a2f38"/>`;
    s += `<path d="M${px + 4} ${BOT + 2} V${BOT - 66} M${px + g.porch - 14} ${BOT + 2} V${BOT - 66} M${px + 4} ${BOT - 66} H${px + g.porch - 14} M${px + 4} ${BOT - 40} H${px + g.porch - 14}" stroke="${d.trim}" stroke-width="5" stroke-linecap="round"/>`;
    for (let i = 1; i < 5; i++) s += `<line x1="${px + 4 + ((g.porch - 18) * i) / 5}" y1="${BOT - 66}" x2="${px + 4 + ((g.porch - 18) * i) / 5}" y2="${BOT + 2}" stroke="${d.trim}" stroke-width="2.5"/>`;
    s += `<path d="M${px + g.porch - 30} ${BOT + 10} l14 26 h22 l-14 -26z" fill="#2a2f38"/>`;
  }
  // marquee lights
  if (d.lights) {
    const bulb = (cx: number, cy: number, r: number, inner: number) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${night ? "#ffe39a" : "#fff3d0"}" stroke="${night ? "none" : "#d8c79c"}" ${night ? 'filter="url(#glow)"' : ""}/>` + (night ? `<circle cx="${cx}" cy="${cy}" r="${inner}" fill="#fffbe8"/>` : "");
    const n = Math.round(bw / 32);
    for (let i = 0; i <= n; i++) s += bulb(bx + 6 + ((bw - 12) * i) / n, TOP + 6, 4.2, 3);
    const m = Math.round(H / 32);
    for (let i = 1; i < m; i++) for (const x of [bx, bx + bw]) s += bulb(x, TOP + 6 + ((H - 40) * i) / m, 3.6, 2.6);
  }
  [...d.items].sort((a, b) => (LAYER[a.type] ?? 3) - (LAYER[b.type] ?? 3)).forEach((it) => (s += drawItem(d, it, g, night)));
  return s;
}

/* ---------------- floor plan ---------------- */
export type PlanData = {
  rows: { b: EquipKey[]; f: EquipKey[] };
  used: { b: number; f: number };
  avail: { b: number; f: number };
  rec: number;
  hasCook: boolean;
  over: boolean;
};

export function planData(d: Design): PlanData {
  const rows: PlanData["rows"] = { b: [], f: [] };
  d.equip.forEach((k) => {
    const e = EQUIP[k];
    if (e) rows[e.row].push(k);
  });
  rows.b.sort((a, b) => Number(!!EQUIP[b].cook) - Number(!!EQUIP[a].cook));
  rows.f.sort((a, b) => Number(!!EQUIP[a].req) - Number(!!EQUIP[b].req));
  const hasDoor = d.items.some((i) => i.type === "door");
  const used = { b: rows.b.reduce((t, k) => t + EQUIP[k].w, 0), f: rows.f.reduce((t, k) => t + EQUIP[k].w, 0) };
  const avail = { b: d.len - 1, f: d.len - 1 - (hasDoor ? 3 : 0) };
  const need = Math.max(used.b + 1, used.f + 1 + (hasDoor ? 3 : 0));
  const rec = LENGTHS.find((l) => l >= need) ?? 28;
  return { rows, used, avail, rec, hasCook: d.equip.some((k) => EQUIP[k]?.cook), over: used.b > avail.b || used.f > avail.f };
}

export function renderPlan(d: Design, night: boolean): string {
  const L = d.len, pd = planData(d);
  const ppf = Math.min(46, 1280 / L), iw = L * ppf, ih = 8 * ppf;
  const x0 = (W - iw) / 2, y0 = (SCENE_H - ih) / 2 + 14;
  const depth = 2.6 * ppf;
  const dim = night ? "#8b97a8" : "#5b6677";
  const lbl = (x: number, y: number, t: string, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="15" letter-spacing="2.5" fill="${dim}">${t}</text>`;
  let s = `<defs><pattern id="grid" width="${ppf}" height="${ppf}" patternUnits="userSpaceOnUse" x="${x0}" y="${y0}"><path d="M${ppf} 0V${ppf}H0" fill="none" stroke="${night ? "#1b2333" : "#dde3ea"}" stroke-width="1"/></pattern>
  <pattern id="floor" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${night ? "#161d2a" : "#eef1f4"}"/><path d="M3 6l4-3M11 14l4-3" stroke="${night ? "#222b3b" : "#d9dee5"}" stroke-width="2" stroke-linecap="round"/></pattern></defs>`;
  s += `<rect y="-200" width="${W}" height="1000" fill="${night ? "#0b0f17" : "#f6f8fa"}"/><rect y="-200" width="${W}" height="1000" fill="url(#grid)"/>`;
  s += lbl(x0, y0 - 44, "STREET SIDE") + lbl(x0, y0 + ih + 56, "CUSTOMER SIDE · SERVICE WINDOWS") + lbl(x0 + iw, y0 - 44, `${L} FT × 8 FT INTERIOR`, "end");
  const hc = night ? "#5b6677" : "#9aa4b0";
  s += `<path d="M${x0 - 16} ${y0 + ih / 2} l-50 0 m10 -10 l-10 10 l10 10" stroke="${hc}" stroke-width="3" fill="none"/><text x="${x0 - 44}" y="${y0 + ih / 2 - 14}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="12" letter-spacing="1.5" fill="${hc}">HITCH</text>`;
  const wall = night ? "#c9d2de" : "#2a2f38";
  s += `<rect x="${x0}" y="${y0}" width="${iw}" height="${ih}" fill="url(#floor)" stroke="${wall}" stroke-width="7"/>`;
  d.items
    .filter((i) => i.type === "window" || i.type === "window_s" || i.type === "door")
    .forEach((it) => {
      const w = itemW(it, d) * ppf, cx = x0 + (it.x / L) * iw;
      if (it.type === "door")
        s += `<rect x="${cx - w / 2}" y="${y0 + ih - 5}" width="${w}" height="10" fill="${night ? "#0b0f17" : "#f6f8fa"}"/><path d="M${cx - w / 2} ${y0 + ih} A${w} ${w} 0 0 1 ${cx + w / 2} ${y0 + ih - w}" fill="none" stroke="${hc}" stroke-width="1.6" stroke-dasharray="4 4"/><line x1="${cx - w / 2}" y1="${y0 + ih}" x2="${cx - w / 2}" y2="${y0 + ih - w}" stroke="${wall}" stroke-width="3"/>`;
      else s += `<rect x="${cx - w / 2}" y="${y0 + ih - 6}" width="${w}" height="12" fill="#7fb2e5" stroke="${wall}" stroke-width="2"/>`;
    });
  const block = (k: EquipKey, x: number, y: number, w: number, h: number, over: boolean) => {
    const e = EQUIP[k];
    const col = e.cook ? "#ff7a1a" : e.req ? "#2457d6" : /fridge|reachin|freezer|ice/.test(k) ? "#00a0a8" : "#6d7684";
    return `<g><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="5" fill="${col}" fill-opacity="${over ? 0.25 : 0.16}" stroke="${over ? "#ff5a4a" : col}" stroke-width="2.4" ${over ? 'stroke-dasharray="6 4"' : ""}/>
      <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="${Math.max(8, Math.min(14, (w - 10) / (e.n.length * 0.56)))}" fill="${night ? "#e8ecf2" : "#1b2230"}">${esc(e.n.toUpperCase())}</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 15}" text-anchor="middle" font-family="Barlow,sans-serif" font-size="11" fill="${dim}">${e.w} ft</text></g>`;
  };
  let bxp = x0 + 0.5 * ppf;
  let hoodStart: number | null = null, hoodEnd = 0;
  pd.rows.b.forEach((k) => {
    const w = EQUIP[k].w * ppf;
    const over = bxp + w > x0 + iw - 0.5 * ppf + 1;
    if (EQUIP[k].cook) {
      hoodStart ??= bxp;
      hoodEnd = bxp + w;
    }
    s += block(k, bxp, y0 + 6, w, depth, over);
    bxp += w;
  });
  if (pd.hasCook && hoodStart !== null)
    s += `<rect x="${hoodStart - 6}" y="${y0 + 3}" width="${hoodEnd - hoodStart + 12}" height="${depth + 10}" fill="none" stroke="#ff7a1a" stroke-width="2" stroke-dasharray="10 6"/><text x="${hoodStart}" y="${y0 + depth + 30}" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="12" letter-spacing="1.4" fill="#ff7a1a">HOOD + FIRE SUPPRESSION</text>`;
  const door = d.items.find((i) => i.type === "door");
  let fxp = x0 + iw - 0.5 * ppf;
  [...pd.rows.f].reverse().forEach((k) => {
    const w = EQUIP[k].w * ppf;
    if (door) {
      const dc = x0 + (door.x / L) * iw, dw = itemW(door, d) * ppf + 0.4 * ppf;
      if (fxp - w < dc + dw / 2 && fxp > dc - dw / 2) fxp = dc - dw / 2;
    }
    const over = fxp - w < x0 + 0.5 * ppf - 1;
    s += block(k, fxp - w, y0 + ih - depth - 6, w, depth, over);
    fxp -= w;
  });
  s += `<text x="${x0 + iw / 2}" y="${y0 + ih / 2 + 5}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="14" letter-spacing="4" fill="${night ? "#3a4558" : "#c2cad4"}">WORK AISLE</text>`;
  const legend: [string, string][] = [["#ff7a1a", "Cooking"], ["#00a0a8", "Cold storage"], ["#2457d6", "Sinks (required)"], ["#6d7684", "Prep / service"]];
  legend.forEach(([c, t], i) => {
    const lx = x0 + i * 170;
    s += `<rect x="${lx}" y="${y0 + ih + 72}" width="14" height="14" rx="3" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="2"/><text x="${lx + 22}" y="${y0 + ih + 84}" font-family="Barlow,sans-serif" font-size="13" fill="${dim}">${t}</text>`;
  });
  return s;
}

export const renderScene = (d: Design, view: View, night: boolean) => (view === "ext" ? renderExterior(d, night) : renderPlan(d, night));

/** A complete standalone SVG document (for PNG export / email image). */
export function standaloneSvg(d: Design, opts: { view?: View; night?: boolean; fontCss?: string } = {}): string {
  const view = opts.view ?? "ext";
  const style = opts.fontCss ? `<style>${opts.fontCss}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox(d, view)}" width="${W}" height="${SCENE_H}">${style}${renderScene(d, view, !!opts.night)}</svg>`;
}

/* ---------------- spec list (used in the UI and in the estimate email) ---------------- */
export function specList(d: Design): [string, string][] {
  const pd = planData(d), it = d.items;
  const cnt = (t: Item["type"]) => it.filter((i) => i.type === t).length;
  const wrapName = WRAPS.find((w) => w[0] === (d.wrap as WrapStyle))?.[1] ?? d.wrap;
  const out: [string, string][] = [
    ["Size", `${d.len} ft · ${["", "single", "tandem", "triple"][axles(d.len)]} axle`],
    ["Wrap", `${wrapName} · body ${d.body} · accent ${d.accent} · trim ${d.trim}`],
    ["Cooking style", CUISINES[d.cuisine].n],
  ];
  if (d.name) out.push(["Business name", `${d.name} (${d.font})`]);
  const g: string[] = [];
  (
    [
      ["window", "service window"], ["window_s", "small window"], ["awning", "awning"], ["counter", "serving shelf"], ["door", "side door"],
      ["menu", "menu board"], ["tv", "TV menu"], ["ac", "A/C unit"], ["vent", "roof vent"], ["sign", "roof sign"],
    ] as const
  ).forEach(([t, n]) => {
    const c = cnt(t);
    if (c) g.push(`${c} ${n}${c > 1 ? "s" : ""}`);
  });
  if (g.length) out.push(["Exterior", g.join(", ")]);
  const o: string[] = [];
  if (d.plate) o.push("diamond plate");
  if (d.lights) o.push("marquee lights");
  if (d.porch) o.push("rear porch");
  if (d.chrome) o.push("chrome wheels");
  if (d.propane) o.push("propane tanks");
  if (d.generator) o.push("generator box");
  if (d.smoker) o.push("BBQ smoker");
  if (o.length) out.push(["Options", o.join(", ")]);
  if (cnt("sign") && d.signText) out.push(["Roof sign", `"${d.signText}"`]);
  out.push(["Kitchen", d.equip.map((k) => EQUIP[k]?.n).filter(Boolean).join(", ") + (pd.hasCook ? ", hood + fire suppression" : "")]);
  if (pd.over) out.push(["Note", `Equipment needs ~${pd.rec} ft`]);
  return out;
}

/* ---------------- control thumbnails ---------------- */
export function wrapThumb(w: WrapStyle): string {
  const b = "#2457d6", a = "#ff7a1a";
  const m: Record<WrapStyle, string> = {
    solid: "",
    twotone: `<rect y="26" width="80" height="22" fill="${a}"/>`,
    stripe: `<rect y="28" width="80" height="8" fill="${a}"/>`,
    swoosh: `<path d="M0 48V34C30 40 50 14 80 8V48Z" fill="${a}"/>`,
    flames: `<path d="M0 48Q6 34 10 24Q14 36 20 40Q24 26 30 18Q34 34 40 40Q46 28 50 22Q54 36 60 40Q64 30 70 24Q74 36 80 38V48Z" fill="${a}"/>`,
    checker: `<g fill="#111">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 8}" y="${30 + (i % 2) * 5}" width="4" height="5"/><rect x="${i * 8 + 4}" y="${30 + ((i + 1) % 2) * 5}" width="4" height="5"/>`).join("")}</g><rect y="30" width="80" height="10" fill="${a}" opacity=".5"/>`,
  };
  return `<rect width="80" height="48" fill="${b}"/>${m[w]}`;
}

export const GADGET_ICONS: Record<string, string> = {
  window: '<rect x="6" y="6" width="42" height="24" rx="2" fill="#7fa0bd" stroke="#c9d2de" stroke-width="2.5"/><path d="M20 6v24M34 6v24" stroke="#c9d2de" stroke-width="2"/>',
  window_s: '<rect x="14" y="6" width="26" height="22" rx="2" fill="#7fa0bd" stroke="#c9d2de" stroke-width="2.5"/><path d="M27 6v22" stroke="#c9d2de" stroke-width="2"/>',
  awning: '<path d="M10 8h34l6 14H4z" fill="#ff7a1a"/><path d="M17 8h7l-2 14h-8zM31 8h7l4 14h-8z" fill="#fff"/>',
  counter: '<rect x="4" y="12" width="46" height="5" rx="1" fill="#b9c1cc"/><path d="M10 17l7 10M44 17l-7 10" stroke="#8b97a8" stroke-width="2.5"/>',
  door: '<rect x="18" y="2" width="18" height="32" rx="1" fill="#2a3442" stroke="#c9d2de" stroke-width="2"/><rect x="21" y="6" width="12" height="9" rx="2" fill="#7fa0bd"/><rect x="31" y="18" width="3" height="6" fill="#c9d2de"/>',
  menu: '<rect x="15" y="3" width="24" height="30" rx="2" fill="#1b1f26" stroke="#c9d2de" stroke-width="2"/><path d="M19 11h12M19 16h14M19 21h10M19 26h13" stroke="#e8ecf2" stroke-width="2"/>',
  tv: '<rect x="9" y="6" width="36" height="22" rx="2" fill="#1b3f8a" stroke="#c9d2de" stroke-width="2"/><path d="M21 33h12" stroke="#c9d2de" stroke-width="2"/>',
  ac: '<rect x="11" y="6" width="32" height="22" rx="3" fill="#e9edf2"/><path d="M15 11h24M15 15h24M15 19h24M15 23h24" stroke="#8b97a8" stroke-width="1.6"/>',
  vent: '<path d="M12 18Q27 2 42 18Z" fill="#b9c1cc"/><rect x="17" y="18" width="20" height="13" fill="#b9c1cc"/><path d="M17 22h20M17 26h20" stroke="#6d7684"/>',
  sign: '<rect x="5" y="4" width="44" height="18" rx="3" fill="#ff7a1a"/><text x="27" y="18" text-anchor="middle" font-family="Impact,sans-serif" font-size="12" fill="#fff">EATS</text><path d="M14 22v10M40 22v10" stroke="#c9d2de" stroke-width="2.5"/>',
  text: '<text x="27" y="27" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#f3f6fa">Aa</text>',
};
