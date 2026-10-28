"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import type { Design } from "@/lib/builder/design";
import { designToPng } from "@/lib/builder/export";
import { TIMELINES } from "@/lib/content";
import { designRequestSchema, fieldErrors } from "@/lib/schemas";
import { primaryPhone, site } from "@/lib/site";

type Props = {
  design: Design;
  night: boolean;
  specs: [string, string][];
  onClose: () => void;
  onDownload: () => void;
  designLink: () => string;
};

type Result = { ok: boolean; message?: string; summary: string };

export function EstimateModal({ design, night, specs, onClose, onDownload, designLink }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    designToPng(design, { scale: 1.4, night }).then((url) => alive && setImage(url));
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // The snapshot is taken once, when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();
    const payload = { name: s("name"), phone: s("phone"), email: s("email"), timeline: s("timeline"), notes: s("notes"), website: s("website"), design, image };

    const parsed = designRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(fe)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setSending(true);

    const specText = specs.map(([k, v]) => `• ${k}: ${v}`).join("\n");
    const summary = [
      `Name:     ${payload.name}`,
      `Phone:    ${payload.phone}`,
      `Email:    ${payload.email}`,
      `Launch:   ${payload.timeline}`,
      "",
      "DESIGN SPECS",
      specText,
      payload.notes ? `\nNotes: ${payload.notes}` : "",
    ].join("\n");

    try {
      const res = await fetch("/api/design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Send failed");
      setResult({ ok: true, summary });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : undefined, summary });
    } finally {
      setSending(false);
    }
  }

  const mailto = () =>
    `mailto:${site.email}?subject=${encodeURIComponent("Trailer design")}&body=${encodeURIComponent(`${specs.map(([k, v]) => `• ${k}: ${v}`).join("\n")}\n\n${designLink()}`)}`;

  const err = (k: string) => errors[k] && <span className="err">{errors[k]}</span>;

  return createPortal(
    <div className="tb-modal" role="dialog" aria-modal="true" aria-labelledby="mTitle" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button type="button" className="x" aria-label="Close" onClick={onClose}>
          <Icon name="close" strokeWidth={2.4} />
        </button>

        {!result ? (
          <>
            <h2 id="mTitle">Get your free estimate</h2>
            <p className="m-0 text-steel-dim">Your design and full spec list are attached automatically. David or Oliver will follow up with pricing and next steps.</p>
            <div className="preview">{image && <img src={image} alt="Your trailer design" />}</div>
            <form className="mform" onSubmit={onSubmit} noValidate>
              <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div>
                <label className="f" htmlFor="mName">
                  Your name *
                </label>
                <input ref={firstField} className="inp" id="mName" name="name" autoComplete="name" required aria-invalid={!!errors.name} />
                {err("name")}
              </div>
              <div>
                <label className="f" htmlFor="mPhone">
                  Phone *
                </label>
                <input className="inp" id="mPhone" name="phone" type="tel" autoComplete="tel" required aria-invalid={!!errors.phone} />
                {err("phone")}
              </div>
              <div>
                <label className="f" htmlFor="mEmail">
                  Email *
                </label>
                <input className="inp" id="mEmail" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
                {err("email")}
              </div>
              <div>
                <label className="f" htmlFor="mWhen">
                  When do you want to launch?
                </label>
                <select className="inp" id="mWhen" name="timeline" defaultValue={TIMELINES[0]}>
                  {TIMELINES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="full">
                <label className="f" htmlFor="mNotes">
                  Anything else?
                </label>
                <textarea className="inp" id="mNotes" name="notes" rows={3} placeholder="Budget, where you'll operate, special equipment…" />
              </div>
              <div className="full flex flex-wrap items-center justify-between gap-2.5">
                <small className="text-steel-dim">Free consultation · Transparent pricing · Hablamos Español</small>
                <button className="btn btn-spark" type="submit" disabled={sending}>
                  {sending ? "Sending…" : "Send to Battle Born"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 id="mTitle">{result.ok ? "Design sent!" : "Almost there"}</h2>
            {result.ok ? (
              <div className="okmsg" role="status">
                ✔{" "}
                <span>
                  <b>Thank you!</b> Your design is on its way to the Battle Born team. David or Oliver will reach out with pricing and next steps. ¡Gracias!
                </span>
              </div>
            ) : (
              <div className="okmsg bad" role="alert">
                <span>
                  We couldn&apos;t send automatically{result.message ? ` (${result.message})` : ""}. Please call <a href={`tel:${primaryPhone.tel}`}>{primaryPhone.phone}</a> or email{" "}
                  <a href={mailto()}>{site.email}</a> — your design details are below.
                </span>
              </div>
            )}
            <p className="mt-4 mb-0 font-label text-[.82rem] tracking-[.14em] text-steel-dim uppercase">Your request</p>
            <div className="mail">{result.summary}</div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button type="button" className="btn btn-spark" onClick={onDownload}>
                Save my design image
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Keep designing
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
