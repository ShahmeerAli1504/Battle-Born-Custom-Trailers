/* Browser-only: turn a design into a PNG. Embeds the page's web fonts into the SVG so the
   business name, sign and labels render in the right typeface in the downloaded / emailed image. */

import { SCENE_H, W } from "./constants";
import type { Design } from "./design";
import { standaloneSvg, type View } from "./scene";

const FAMILIES = ["Big Shoulders Display", "Barlow Condensed", "Barlow", "Bungee", "Pacifico", "Lobster", "Rye", "Permanent Marker"];
let fontCssPromise: Promise<string> | null = null;

const toDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

/** Collect @font-face rules for the builder fonts (latin subset only) and inline their files. */
async function collectFontCss(): Promise<string> {
  const rules: CSSFontFaceRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let list: CSSRuleList;
    try {
      list = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    const walk = (rs: CSSRuleList) => {
      for (const r of Array.from(rs)) {
        if (r instanceof CSSFontFaceRule) rules.push(r);
        else if ("cssRules" in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules);
      }
    };
    walk(list);
  }
  const wanted = rules.filter((r) => {
    const fam = r.style.getPropertyValue("font-family").replace(/["']/g, "").trim();
    const range = r.style.getPropertyValue("unicode-range");
    return FAMILIES.includes(fam) && (!range || /U\+0+-F{2}/i.test(range) || /U\+0000-00FF/i.test(range));
  });
  const out = await Promise.all(
    wanted.map(async (r) => {
      const src = r.style.getPropertyValue("src");
      const m = src.match(/url\(["']?([^"')]+\.woff2[^"')]*)["']?\)/) || src.match(/url\(["']?([^"')]+)["']?\)/);
      if (!m?.[1]) return "";
      try {
        const url = new URL(m[1], r.parentStyleSheet?.href || location.href).href;
        const data = await toDataUrl(await (await fetch(url)).blob());
        return `@font-face{font-family:"${r.style.getPropertyValue("font-family").replace(/["']/g, "").trim()}";font-weight:${r.style.getPropertyValue("font-weight") || "400"};font-style:${r.style.getPropertyValue("font-style") || "normal"};src:url(${data}) format("woff2");}`;
      } catch {
        return "";
      }
    }),
  );
  return out.join("");
}

export function fontCss() {
  fontCssPromise ??= collectFontCss().catch(() => "");
  return fontCssPromise;
}

export async function designToPng(d: Design, opts: { scale?: number; night?: boolean; view?: View } = {}): Promise<string | null> {
  const scale = opts.scale ?? 2;
  const svg = standaloneSvg(d, { view: opts.view ?? "ext", night: opts.night, fontCss: await fontCss() });
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W * scale;
      c.height = SCENE_H * scale;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, W, SCENE_H);
      try {
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
