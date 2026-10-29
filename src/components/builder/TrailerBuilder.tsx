"use client";

import "@fontsource/bungee/400.css";
import "@fontsource/lobster/400.css";
import "@fontsource/pacifico/400.css";
import "@fontsource/permanent-marker/400.css";
import "@fontsource/rye/400.css";
import "./builder.css";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as RPointerEvent } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import {
  BOT,
  COLORS,
  CUISINES,
  CUISINE_KEYS,
  EQUIP,
  EQUIP_GROUPS,
  MAX_QTY,
  EXTERIOR_OPTIONS,
  FONTS,
  GADGETS,
  LENGTHS,
  PALETTE,
  PPF,
  PRESETS,
  ROLE_FIELD,
  ROLE_LABEL,
  TEXT_FONTS,
  TOP,
  WRAPS,
  type ColorKey,
  type CuisineKey,
  type ExteriorOption,
  type GadgetType,
  type PresetKey,
  type TextRole,
} from "@/lib/builder/constants";
import { clampItem, decodeDesign, emptyDesign, encodeDesign, isFree, itemW, mk, nextId, preset, syncIds, type Design, type Item } from "@/lib/builder/design";
import { ALL_PICKS, STEP_ORDER, isComplete, progress, requirements, type Pick, type Requirement } from "@/lib/builder/steps";
import { AXLE_LABEL, GADGET_ICONS, axles, layout, planData, renderEmptyStage, renderScene, specList, viewBox, wrapThumb, type View } from "@/lib/builder/scene";
import { designToPng } from "@/lib/builder/export";
import { EstimateModal } from "./EstimateModal";

type Tab = "style" | "gadgets" | "brand" | "kitchen";
const TABS: [Tab, string][] = [
  ["style", "Size & Style"],
  ["gadgets", "Gadgets"],
  ["brand", "Branding"],
  ["kitchen", "Kitchen"],
];
type Box = { x: number; y: number; width: number; height: number };
type Drag = { id: string; dx: number; dy: number; moved: boolean };

const ROLE_DEFAULTS: Record<TextRole, { y: number; size: number }> = {
  name: { y: TOP + 205, size: 46 },
  tag: { y: TOP + 236, size: 20 },
  phone: { y: TOP + 140, size: 16 },
};

export function TrailerBuilder() {
  const [design, setDesign] = useState<Design>(() => emptyDesign());
  const [picked, setPicked] = useState<ReadonlySet<Pick>>(() => new Set());
  const [sel, setSel] = useState<string | null>(null);
  const [view, setViewState] = useState<View>("ext");
  const [night, setNight] = useState(false);
  const [tab, setTab] = useState<Tab>("style");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fontsTick, setFontsTick] = useState(0);

  const history = useRef<string[]>([]);
  const designRef = useRef(design);
  const pickedRef = useRef(picked);
  useLayoutEffect(() => {
    designRef.current = design;
    pickedRef.current = picked;
  }, [design, picked]);
  const svgRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<SVGGElement>(null);
  const drag = useRef<Drag | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ---------------- helpers ---------------- */
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const snapshot = useCallback(() => {
    history.current.push(JSON.stringify({ d: designRef.current, p: [...pickedRef.current] }));
    if (history.current.length > 60) history.current.shift();
  }, []);

  /** Apply a change. `snap: true` records an undo step first. */
  const change = useCallback(
    (fn: (d: Design) => Design, snap = true) => {
      if (snap) snapshot();
      setDesign((d) => fn(d));
    },
    [snapshot],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return toast("Nothing to undo");
    const snap = JSON.parse(prev) as { d: Design; p: Pick[] };
    setDesign(snap.d);
    setPicked(new Set(snap.p));
    setSel(null);
  }, [toast]);

  const setView = useCallback((v: View) => {
    setViewState(v);
    setSel(null);
  }, []);

  /** Record that the customer made a choice (used to unlock the next step). */
  const markPicked = useCallback((...keys: Pick[]) => {
    setPicked((prev) => (keys.every((k) => prev.has(k)) ? prev : new Set([...prev, ...keys])));
  }, []);

  const startOver = () => {
    snapshot();
    setDesign(emptyDesign());
    setPicked(new Set());
    setSel(null);
    setTab("style");
    setViewState("ext");
  };

  const loadPreset = (k: PresetKey) => {
    if (k === "blank") {
      startOver();
      toast("Started a blank trailer");
      return;
    }
    snapshot();
    setDesign(preset(k));
    setPicked(new Set(ALL_PICKS));
    setSel(null);
    toast("Template loaded — every step is filled in");
  };

  /* ---------------- boot: open a shared design from #d=… ---------------- */
  useEffect(() => {
    const m = window.location.hash.match(/#d=(.+)/);
    if (m?.[1]) {
      const d = decodeDesign(m[1]);
      if (d) {
        syncIds(d);
        setDesign(d);
        setPicked(new Set(ALL_PICKS));
      } else toast("That design link couldn't be opened");
    } else if (window.location.hash === "#templates") {
      document.getElementById("templates")?.scrollIntoView({ block: "center" });
    }
    // Re-measure once custom fonts are ready (text widths change).
    document.fonts?.ready.then(() => setFontsTick((t) => t + 1));
  }, [toast]);

  /* ---------------- derived ---------------- */
  const started = picked.has("len");
  const markup = useMemo(() => (started ? renderScene(design, view, night) : renderEmptyStage(night)), [design, view, night, started]);
  const vb = useMemo(() => viewBox(design, view), [design, view]);
  const pd = useMemo(() => planData(design), [design]);
  const specs = useMemo(() => specList(design), [design]);
  const selected = design.items.find((i) => i.id === sel) ?? null;
  const prog = useMemo(() => progress(design, picked, pd), [design, picked, pd]);
  const stepReqs = (t: Tab): Requirement[] => requirements(t, design, picked, pd);

  // Selection outline: measure the selected group after each render.
  useLayoutEffect(() => {
    if (view !== "ext" || !sel || !sceneRef.current) return setSelBox(null);
    const el = sceneRef.current.querySelector<SVGGraphicsElement>(`[data-id="${CSS.escape(sel)}"]`);
    if (!el) {
      setSelBox(null);
      setSel(null);
      return;
    }
    const b = el.getBBox();
    setSelBox((prev) => (prev && prev.x === b.x && prev.y === b.y && prev.width === b.width && prev.height === b.height ? prev : { x: b.x, y: b.y, width: b.width, height: b.height }));
  }, [markup, sel, view, fontsTick]);

  /* ---------------- items ---------------- */
  const updateItem = (id: string, patch: Partial<Item>, snap = false) =>
    change((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }), snap);

  const deleteItem = useCallback(
    (id: string) => {
      change((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
      setSel(null);
    },
    [change],
  );

  const duplicateItem = (it: Item) => {
    const d = designRef.current;
    const c: Item = { ...it, id: nextId() };
    delete c.role;
    if (it.role) c.text = d[ROLE_FIELD[it.role]];
    c.x = Math.min(d.len - itemW(c, d) / 2, it.x + itemW(it, d) + 0.3);
    change((dd) => ({ ...dd, items: [...dd.items, c] }));
    setSel(c.id);
  };

  const addItem = (type: GadgetType, opts: { x?: number; y?: number } = {}) => {
    const d = designRef.current;
    const L = d.len, w = type === "sign" ? 6 : (GADGETS[type]?.w ?? 2);
    let x = opts.x ?? L / 2;
    x = isFree(type) ? Math.max(0.5, Math.min(L - 0.5, x)) : Math.max(w / 2, Math.min(L - w / 2, x));
    const it = mk(type, x);
    if (type === "text") Object.assign(it, { y: opts.y ?? TOP + 120, text: "Your text", size: 30, color: d.text });
    change((dd) => ({
      ...dd,
      signText: type === "sign" && !dd.signText ? CUISINES[dd.cuisine].sign : dd.signText,
      items: [...dd.items, it],
    }));
    if (view !== "ext") setViewState("ext");
    setSel(it.id);
    toast(`${GADGETS[type].n} added — drag to place`);
  };

  /** Typing a business name / tagline / phone adds its text block back if it was deleted. */
  const setBrand = (field: "name" | "tag" | "phone" | "signText", value: string) =>
    change((d) => {
      const next = { ...d, [field]: value };
      const role = (field === "signText" ? null : field) as TextRole | null;
      if (role && value && !d.items.some((i) => i.role === role)) {
        next.items = [...d.items, mk("text", d.len * 0.42, { role, ...ROLE_DEFAULTS[role] })];
      }
      return next;
    }, false);

  /* ---------------- pointer drag on the scene ---------------- */
  const svgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (view !== "ext") return;
    const g = (e.target as Element).closest<SVGGElement>(".it");
    if (!g) {
      if (sel) setSel(null);
      return;
    }
    const d = designRef.current;
    const it = d.items.find((i) => i.id === g.dataset.id);
    if (!it) return;
    const p = svgPoint(e.clientX, e.clientY);
    snapshot();
    drag.current = { id: it.id, dx: p.x - (layout(d).bx + it.x * PPF), dy: it.y != null ? p.y - it.y : 0, moved: false };
    setSel(it.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const dr = drag.current;
    if (!dr) return;
    const p = svgPoint(e.clientX, e.clientY);
    setDesign((d) => {
      const it = d.items.find((i) => i.id === dr.id);
      if (!it) return d;
      const moved = clampItem({ ...it, x: (p.x - dr.dx - layout(d).bx) / PPF, y: isFree(it.type) ? p.y - dr.dy : it.y }, d);
      return { ...d, items: d.items.map((i) => (i.id === dr.id ? moved : i)) };
    });
    dr.moved = true;
  };

  const endDrag = () => {
    if (drag.current && !drag.current.moved) history.current.pop();
    drag.current = null;
  };

  /* ---------------- drop from the palette ---------------- */
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover(false);
    let data: { type: GadgetType };
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    if (!data?.type || !(data.type in GADGETS)) return;
    if (view !== "ext") setViewState("ext");
    const p = svgPoint(e.clientX, e.clientY);
    addItem(data.type, { x: (p.x - layout(designRef.current).bx) / PPF, y: Math.max(TOP + 20, Math.min(BOT - 12, p.y)) });
  };

  /* ---------------- keyboard ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || modalOpen) return;
      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        e.preventDefault();
        deleteItem(sel);
      }
      if (e.key === "Escape") setSel(null);
      if (sel && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        setDesign((d) => ({ ...d, items: d.items.map((i) => (i.id === sel ? clampItem({ ...i, x: i.x + (e.key === "ArrowLeft" ? -0.25 : 0.25) }, d) : i)) }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, undo, deleteItem, modalOpen]);

  /* ---------------- export / share ---------------- */
  const download = async () => {
    const url = await designToPng(designRef.current, { night });
    if (!url) return toast("Couldn't create image");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(designRef.current.name || "my-trailer").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-battle-born-design.png`;
    a.click();
  };

  const designLink = () => `${window.location.origin}${window.location.pathname}#d=${encodeDesign(designRef.current)}`;

  const share = async () => {
    const url = designLink();
    try {
      window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied — opens this exact design");
    } catch {
      toast("Link saved in the address bar");
    }
  };

  const switchTab = (t: Tab) => {
    const i = STEP_ORDER.indexOf(t);
    if (!prog.unlocked[i]) {
      toast(`Finish step ${STEP_ORDER.findIndex((_, k) => !prog.complete[k]) + 1} first`);
      return;
    }
    setTab(t);
    if (t === "kitchen") setView("plan");
    else if (view === "plan") setView("ext");
  };

  /* ---------------- render ---------------- */
  // Wrap thumbnails preview the customer's own colors once they've picked them.
  const thumbCols = picked.has("body") || picked.has("accent") ? { body: design.body, accent: design.accent, trim: design.trim } : undefined;

  const bodyColorRows = (["body", "accent", "trim"] as const).map((k) => (
    <ColorRow
      key={k}
      label={k}
      colorKey={k}
      value={design[k]}
      active={picked.has(k)}
      onPick={(c) => (change((d) => ({ ...d, [k]: c })), markPicked(k))}
      onLive={(c) => (change((d) => ({ ...d, [k]: c }), false), markPicked(k))}
      onFocus={snapshot}
    />
  ));

  const summary = (mobile: boolean) => (
    <div className="summary">
      <div className="summary-head">
        <h2>Your build</h2>
        <div className="row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={undo}>
            <Icon name="undo" strokeWidth={2.2} />
            Undo
          </button>
          {!mobile && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={startOver}
            >
              Start over
            </button>
          )}
        </div>
      </div>
      <div className="specs">
        {!started && <span className="spec">Your choices will show up here as you go.</span>}
        {started && specs.slice(0, 7).map(([k, v]) => (
          <span key={k} className="spec">
            {k}: <b>{v.length > 60 ? `${v.slice(0, 58)}…` : v}</b>
          </span>
        ))}
      </div>
      <div className="actions">
        <button
          type="button"
          className={clsx("btn btn-spark", mobile && "grow")}
          disabled={!prog.allDone}
          title={prog.allDone ? undefined : "Finish all 4 steps first"}
          onClick={() => setModalOpen(true)}
        >
          {prog.allDone ? "Send design for estimate" : `Finish all 4 steps to send`} {!mobile && prog.allDone && <Icon name="arrow" strokeWidth={2.4} />}
        </button>
        <button type="button" className="btn btn-ghost" onClick={download} disabled={!started}>
          {mobile ? "Image" : "Download image"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={share} disabled={!started}>
          {mobile ? "Link" : "Copy link"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="tb">
      <section className="intro">
        <div className="tb-wrap">
          <div>
            <div className="eyebrow">Trailer builder</div>
            <h1>
              Build your own <em>food trailer</em>
            </h1>
            <p>Pick a size, choose your colors, drag on windows and gear, add your business name — then send the design to our team for a free estimate.</p>
            <div className="templates" id="templates">
              <small>Start from</small>
              {PRESETS.map((p) => (
                <button key={p.key} type="button" className="tchip" onClick={() => loadPreset(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="steps" aria-hidden="true">
            {["Size & style", "Gadgets", "Branding", "Kitchen", "Send"].map((s, i) => (
              <span key={s} className={clsx((i < 4 ? prog.complete[i] : false) && "done")}>
                <b>{i + 1}</b>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="tb-wrap builder">
        {/* ============ CONTROLS ============ */}
        <div className="panel">
          <div className="tabs" role="tablist" aria-label="Builder steps">
            {TABS.map(([k, label], i) => {
              const locked = !prog.unlocked[i];
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  className={clsx("tab", locked && "locked", prog.complete[i] && "done")}
                  id={`tab-${k}`}
                  aria-controls={`pane-${k}`}
                  aria-selected={tab === k}
                  aria-disabled={locked}
                  title={locked ? "Finish the previous step first" : undefined}
                  onClick={() => switchTab(k)}
                >
                  <b>{locked ? <Icon name="lock" strokeWidth={2.4} /> : prog.complete[i] ? <Icon name="check" strokeWidth={3} /> : i + 1}</b>
                  {label}
                </button>
              );
            })}
          </div>

          {tab === "style" && (
            <div className="pane" role="tabpanel" id="pane-style" aria-labelledby="tab-style">
              <div className="group">
                <div className="g-title">
                  Trailer length <small>{started ? AXLE_LABEL[axles(design.len)] : "Required"}</small>
                </div>
                <div className="len-grid">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className="len"
                      aria-pressed={started && design.len === l}
                      onClick={() => {
                        change((d) => ({ ...d, len: l, items: d.items.map((i) => ({ ...i, x: (i.x * l) / d.len })) }));
                        markPicked("len");
                      }}
                    >
                      {l}&apos;<small>{["", "1 axle", "2 axles", "3 axles"][axles(l)]}</small>
                      {design.equip.length > 0 && pd.rec === l && <span className="rec">FITS</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="group">
                <div className="g-title">Colors</div>
                {bodyColorRows}
              </div>
              {(["exterior", "tongue"] as const).map((grp) => (
                <div className="group" key={grp}>
                  <div className="g-title">{grp === "exterior" ? "Exterior options" : "On the tongue"}</div>
                  <div className="toggles">
                    {EXTERIOR_OPTIONS.filter((o) => o.group === grp).map((o) => (
                      <label key={o.key} className="tg">
                        <input type="checkbox" checked={design[o.key]} onChange={(e) => change((d) => ({ ...d, [o.key as ExteriorOption]: e.target.checked }))} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "gadgets" && (
            <div className="pane" role="tabpanel" id="pane-gadgets" aria-labelledby="tab-gadgets">
              <div className="group">
                <div className="g-title">Drag onto the trailer</div>
                <p className="hint">Drag any piece onto the trailer — or tap it to drop it in the middle. Click a piece on the trailer to move, resize or delete it.</p>
                <div className="palette">
                  {PALETTE.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="gadget"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", JSON.stringify({ type: t }));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => addItem(t)}
                    >
                      <svg viewBox="0 0 54 36" aria-hidden="true" dangerouslySetInnerHTML={{ __html: GADGET_ICONS[t] ?? "" }} />
                      {GADGETS[t].n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "brand" && (
            <div className="pane" role="tabpanel" id="pane-brand" aria-labelledby="tab-brand">
              <div className="group">
                <label className="f" htmlFor="bName">
                  Business name
                </label>
                <input className="inp" id="bName" maxLength={28} placeholder="Your Business Name" value={design.name} onFocus={snapshot} onChange={(e) => setBrand("name", e.target.value)} />
              </div>
              <div className="group">
                <div className="g-title">Name font</div>
                <div className="fonts">
                  {FONTS.map(([f, n]) => (
                    <button
                      key={f}
                      type="button"
                      className="fontopt"
                      aria-pressed={picked.has("font") && design.font === f}
                      style={{ fontFamily: `'${f}', sans-serif`, ...(f === "Big Shoulders Display" ? { fontWeight: 800, textTransform: "uppercase" } : {}) }}
                      onClick={() => (change((d) => ({ ...d, font: f })), markPicked("font"))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="group two">
                <div>
                  <label className="f" htmlFor="bTag">
                    Tagline
                  </label>
                  <input className="inp" id="bTag" maxLength={40} placeholder="Authentic street food" value={design.tag} onFocus={snapshot} onChange={(e) => setBrand("tag", e.target.value)} />
                </div>
                <div>
                  <label className="f" htmlFor="bPhone">
                    Phone / @handle
                  </label>
                  <input className="inp" id="bPhone" maxLength={24} placeholder="775-555-0123" value={design.phone} onFocus={snapshot} onChange={(e) => setBrand("phone", e.target.value)} />
                </div>
              </div>
              <div className="group">
                <ColorRow
                  label="Text"
                  colorKey="text"
                  value={design.text}
                  active={picked.has("text")}
                  onPick={(c) => (change((d) => ({ ...d, text: c, items: d.items.map((i) => (i.role ? { ...i, color: undefined } : i)) })), markPicked("text"))}
                  onLive={(c) => (change((d) => ({ ...d, text: c }), false), markPicked("text"))}
                  onFocus={snapshot}
                />
              </div>
              <div className="group">
                <div className="g-title">
                  Trailer colors <small>shared with step 1</small>
                </div>
                {bodyColorRows}
              </div>
              <div className="group">
                <div className="g-title">
                  Wrap <small>every wrap is custom artwork, designed with you</small>
                </div>
                <div className="wrap-choice">
                  {WRAPS.map(([k, n]) => (
                    <button
                      key={k}
                      type="button"
                      className="wrapopt"
                      aria-pressed={picked.has("wrap") && design.wrap === k}
                      onClick={() => (change((d) => ({ ...d, wrap: k })), markPicked("wrap"))}
                    >
                      <svg viewBox="0 0 80 48" aria-hidden="true" dangerouslySetInnerHTML={{ __html: wrapThumb(k, thumbCols) }} />
                      <b>{n}</b>
                      <small>{k === "full" ? "Edge-to-edge printed wrap. Our team designs the artwork with you." : "Solid paint in your body color."}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="group">
                <label className="f" htmlFor="bSign">
                  Rooftop sign text
                </label>
                <input className="inp" id="bSign" maxLength={16} placeholder="TACOS" value={design.signText} onFocus={snapshot} onChange={(e) => setBrand("signText", e.target.value)} />
                <p className="hint mt-2 mb-0">Add the roof sign from the Gadgets tab if it isn&apos;t on your trailer.</p>
              </div>
            </div>
          )}

          {tab === "kitchen" && (
            <div className="pane" role="tabpanel" id="pane-kitchen" aria-labelledby="tab-kitchen">
              <div className="group">
                <div className="g-title">Cooking style</div>
                <div className="cuisines">
                  {CUISINE_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="cz"
                      aria-pressed={picked.has("cuisine") && design.cuisine === k}
                      onClick={() => {
                        change((d) => {
                          const oldSign = CUISINES[d.cuisine].sign;
                          return {
                            ...d,
                            cuisine: k as CuisineKey,
                            equip: [...CUISINES[k].equip],
                            signText: !d.signText || d.signText === oldSign ? CUISINES[k].sign : d.signText,
                            smoker: k === "bbq" ? true : d.smoker,
                          };
                        });
                        markPicked("cuisine");
                        toast(`${CUISINES[k].n} setup loaded`);
                      }}
                    >
                      <span>{CUISINES[k].e}</span>
                      {CUISINES[k].n}
                    </button>
                  ))}
                </div>
                <p className="hint mt-2.5 mb-0">Picking a style loads a recommended equipment setup — you can change anything below.</p>
              </div>
              <div className="group">
                <div className="g-title">
                  Equipment <small>add as many as you need</small>
                </div>
                {EQUIP_GROUPS.map((g) => (
                  <div key={g.title} className="eq-group">
                    <div className="eq-head">
                      {g.title}
                      {g.note && <small>{g.note}</small>}
                    </div>
                    <div className="equip">
                      {g.keys.map((k) => {
                        const qty = design.equip.filter((x) => x === k).length;
                        return (
                          <div key={k} className={clsx("eq", qty > 0 && "on")}>
                            <span>
                              {EQUIP[k].n}
                              {EQUIP[k].req && <span className="req">Required</span>}
                              <small>{EQUIP[k].w} ft wide</small>
                            </span>
                            <div className="qty" role="group" aria-label={`${EQUIP[k].n} quantity`}>
                              <button
                                type="button"
                                aria-label={`Remove one ${EQUIP[k].n}`}
                                disabled={qty === 0}
                                onClick={() =>
                                  change((d) => {
                                    const at = d.equip.lastIndexOf(k);
                                    return at < 0 ? d : { ...d, equip: d.equip.filter((_, n) => n !== at) };
                                  })
                                }
                              >
                                −
                              </button>
                              <output aria-live="polite">{qty}</output>
                              <button type="button" aria-label={`Add one ${EQUIP[k].n}`} disabled={qty >= MAX_QTY} onClick={() => change((d) => ({ ...d, equip: [...d.equip, k] }))}>
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <StepFooter
            step={TABS.findIndex(([k]) => k === tab)}
            reqs={stepReqs(tab)}
            allDone={prog.allDone}
            onNext={() => {
              const i = TABS.findIndex(([k]) => k === tab);
              const next = TABS[i + 1];
              if (next) switchTab(next[0]);
              else setModalOpen(true);
            }}
          />
        </div>

        {/* ============ STAGE ============ */}
        <div className="stage-col">
          <div
            className={clsx("stage", night && "night", dropHover && "drop-hover")}
            onDragOver={(e) => {
              e.preventDefault();
              setDropHover(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropHover(false);
            }}
            onDrop={onDrop}
          >
            <div className="stage-bar">
              <div className={clsx("seg", !started && "off")} role="group" aria-label="View">
                <button type="button" aria-pressed={view === "ext"} onClick={() => setView("ext")}>
                  Outside
                </button>
                <button type="button" aria-pressed={view === "plan"} onClick={() => setView("plan")}>
                  Floor plan
                </button>
              </div>
              <div className={clsx("seg", !started && "off")} role="group" aria-label="Lighting">
                <button type="button" aria-pressed={!night} onClick={() => setNight(false)}>
                  <Icon name="sun" strokeWidth={2.2} />
                  Day
                </button>
                <button type="button" aria-pressed={night} onClick={() => setNight(true)}>
                  <Icon name="moon" strokeWidth={2.2} />
                  Night
                </button>
              </div>
            </div>

            <svg
              ref={svgRef}
              className="scene"
              viewBox={vb}
              role="img"
              aria-label="Your trailer design"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <g ref={sceneRef} dangerouslySetInnerHTML={{ __html: markup }} />
              {selBox && (
                <rect
                  x={selBox.x - 8}
                  y={selBox.y - 8}
                  width={selBox.width + 16}
                  height={selBox.height + 16}
                  rx={8}
                  fill="none"
                  stroke="#ff7a1a"
                  strokeWidth={2.5}
                  strokeDasharray="7 5"
                  pointerEvents="none"
                />
              )}
            </svg>

            {!started && (
              <div className="stage-empty">
                <b>Your trailer will appear here</b>
                <span>Start with step 1 — choose a trailer length.</span>
              </div>
            )}

            {selected && view === "ext" ? (
              <Inspector
                key={selected.id}
                item={selected}
                design={design}
                onFocus={snapshot}
                onChange={(patch) => updateItem(selected.id, patch)}
                onBrand={(field, v) => setBrand(field, v)}
                onDuplicate={() => duplicateItem(selected)}
                onDelete={() => deleteItem(selected.id)}
                onDone={() => setSel(null)}
              />
            ) : (
              view === "ext" && started && <div className="tip">Drag pieces to move them · click to edit</div>
            )}
          </div>

          <div className="panel" hidden={design.equip.length === 0 && tab !== "kitchen"}>
            <div className="fit">
              {(["b", "f"] as const).map((k) => {
                const over = pd.used[k] > pd.avail[k];
                return (
                  <div key={k} className={clsx("meter", over && "over")}>
                    <div>
                      <span>{k === "b" ? "Back wall" : "Front wall"}</span>
                      <span>
                        {pd.used[k].toFixed(1)} / {pd.avail[k]} ft
                      </span>
                    </div>
                    <i>
                      <b style={{ width: `${Math.min(100, (pd.used[k] / pd.avail[k]) * 100)}%` }} />
                    </i>
                  </div>
                );
              })}
              {pd.over && (
                <div className="fit-note" role="status">
                  ⚠ Your kitchen doesn&apos;t fit in {design.len} ft — try a <b>{pd.rec} ft</b> trailer or remove equipment.
                </div>
              )}
            </div>
          </div>

          <div className="panel summary-card">{summary(false)}</div>
        </div>

        <div className="panel mobile-summary">{summary(true)}</div>
      </div>

      {modalOpen && <EstimateModal design={design} night={night} specs={specs} onClose={() => setModalOpen(false)} onDownload={download} designLink={designLink} />}
      {toastMsg && (
        <div className="tb-toast" role="status">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

/* ---------------- color swatches ---------------- */
function ColorRow({
  label,
  colorKey,
  value,
  active,
  onPick,
  onLive,
  onFocus,
}: {
  label: string;
  colorKey: ColorKey;
  value: string;
  active: boolean;
  onPick: (c: string) => void;
  onLive: (c: string) => void;
  onFocus: () => void;
}) {
  return (
    <div className="color-row">
      <span className="capitalize">{label}</span>
      <div className="swatches">
        {COLORS[colorKey].map((c) => (
          <button key={c} type="button" className="sw" style={{ background: c }} aria-label={`${label} ${c}`} aria-pressed={active && c.toLowerCase() === value.toLowerCase()} onClick={() => onPick(c)} />
        ))}
        <label className="picker" title="Custom color">
          <input type="color" value={value} onFocus={onFocus} onChange={(e) => onLive(e.target.value)} aria-label={`Custom ${label} color`} />
        </label>
      </div>
    </div>
  );
}

/* ---------------- inspector (edit the selected piece) ---------------- */
function Inspector({
  item,
  design,
  onFocus,
  onChange,
  onBrand,
  onDuplicate,
  onDelete,
  onDone,
}: {
  item: Item;
  design: Design;
  onFocus: () => void;
  onChange: (patch: Partial<Item>) => void;
  onBrand: (field: "name" | "tag" | "phone" | "signText", v: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  const label = item.role ? ROLE_LABEL[item.role] : GADGETS[item.type].n;
  return (
    <div className="inspector" onFocus={onFocus}>
      <span className="lbl">{label}</span>
      {item.type === "text" && (
        <>
          <input
            type="text"
            maxLength={40}
            aria-label="Text"
            value={item.role ? design[ROLE_FIELD[item.role]] : (item.text ?? "")}
            onChange={(e) => (item.role ? onBrand(ROLE_FIELD[item.role], e.target.value) : onChange({ text: e.target.value }))}
          />
          {item.role !== "name" && (
            <select aria-label="Font" value={item.font || "Barlow Condensed"} onChange={(e) => onChange({ font: e.target.value })}>
              {TEXT_FONTS.map(([f, n]) => (
                <option key={f} value={f}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <input type="color" title="Color" aria-label="Text color" value={item.color || design.text} onChange={(e) => onChange({ color: e.target.value })} />
          <input type="range" title="Size" aria-label="Text size" min={12} max={90} value={item.size || 28} onChange={(e) => onChange({ size: Number(e.target.value) })} />
        </>
      )}
      {item.type === "sign" && <input type="text" maxLength={16} aria-label="Sign text" value={design.signText} onChange={(e) => onBrand("signText", e.target.value)} />}
      <span className="ispace" />
      <button type="button" className="ibtn" onClick={onDuplicate}>
        <Icon name="copy" strokeWidth={2.2} />
        Copy
      </button>
      <button type="button" className="ibtn del" onClick={onDelete}>
        <Icon name="trash" strokeWidth={2.2} />
        Delete
      </button>
      <button type="button" className="ibtn" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

/* ---------------- step checklist + Next ---------------- */
const NEXT_LABEL = ["Next: Gadgets", "Next: Branding", "Next: Kitchen", "Review & send"];

function StepFooter({ step, reqs, allDone, onNext }: { step: number; reqs: Requirement[]; allDone: boolean; onNext: () => void }) {
  const done = isComplete(reqs);
  const left = reqs.filter((r) => !r.done).length;
  const last = step === NEXT_LABEL.length - 1;
  return (
    <div className="step-foot">
      <ul className="reqs" aria-label={`Step ${step + 1} checklist`}>
        {reqs.map((r) => (
          <li key={r.label} className={clsx(r.done && "ok")}>
            <span className="tick" aria-hidden="true">
              {r.done ? <Icon name="check" strokeWidth={3} /> : null}
            </span>
            {r.label}
            <span className="sr-only">{r.done ? " — done" : " — to do"}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-spark next" disabled={!done || (last && !allDone)} onClick={onNext}>
        {done ? NEXT_LABEL[step] : `${left} ${left === 1 ? "item" : "items"} left`}
        {done && <Icon name="arrow" strokeWidth={2.4} />}
      </button>
    </div>
  );
}
