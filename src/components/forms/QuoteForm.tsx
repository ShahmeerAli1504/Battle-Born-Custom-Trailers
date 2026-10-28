"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { BUDGETS, HEARD_FROM, LANGUAGES, QUOTE_SERVICES, TIMELINES, TRAILER_SIZES } from "@/lib/content";
import { fieldErrors, quoteSchema } from "@/lib/schemas";
import { primaryPhone, site } from "@/lib/site";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "err"; message: string };

function readForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const s = (k: string) => String(fd.get(k) ?? "");
  return {
    name: s("name"),
    phone: s("phone"),
    email: s("email"),
    business: s("business"),
    services: fd.getAll("services").map(String),
    size: s("size"),
    food: s("food"),
    budget: s("budget"),
    timeline: s("timeline"),
    language: s("language"),
    message: s("message"),
    heard: s("heard"),
    website: s("website"),
  };
}

export function QuoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const err = (k: string) =>
    errors[k] ? (
      <span className="err" id={`err-${k}`}>
        {errors[k]}
      </span>
    ) : null;
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `err-${k}` } : {});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = readForm(form);
    const parsed = quoteSchema.safeParse(data);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      const first = Object.keys(fe)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields);
        throw new Error(json.error || "Send failed");
      }
      form.reset();
      setStatus({ kind: "ok" });
    } catch (e) {
      setStatus({ kind: "err", message: e instanceof Error ? e.message : "Send failed" });
    } finally {
      requestAnimationFrame(() => statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }

  const sending = status.kind === "sending";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-[26px]">
      <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="f-name">
            Full name <span className="req">*</span>
          </label>
          <input id="f-name" name="name" autoComplete="name" required placeholder="Your name" {...aria("name")} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor="f-phone">
            Phone <span className="req">*</span>
          </label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" required placeholder="(775) 555-0123" {...aria("phone")} />
          {err("phone")}
        </div>
        <div className="field">
          <label htmlFor="f-email">
            Email <span className="req">*</span>
          </label>
          <input id="f-email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" {...aria("email")} />
          {err("email")}
        </div>
        <div className="field">
          <label htmlFor="f-biz">Business / concept name</label>
          <input id="f-biz" name="business" placeholder="e.g. Tacos El Primo" />
        </div>

        <fieldset className="field full">
          <legend>What do you need?</legend>
          <div className="chips">
            {QUOTE_SERVICES.map((s) => (
              <label key={s} className="chip">
                <input type="checkbox" name="services" value={s} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="f-size">Trailer size</label>
          <select id="f-size" name="size" defaultValue="">
            <option value="">Select a size…</option>
            {TRAILER_SIZES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-food">Type of food / menu</label>
          <input id="f-food" name="food" placeholder="Tacos, BBQ, desserts, coffee…" />
        </div>
        <div className="field">
          <label htmlFor="f-budget">Estimated budget</label>
          <select id="f-budget" name="budget" defaultValue="">
            <option value="">Select a range…</option>
            {BUDGETS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-time">Timeline</label>
          <select id="f-time" name="timeline" defaultValue="">
            <option value="">When do you want to launch?</option>
            {TIMELINES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <fieldset className="field full">
          <legend>Preferred language</legend>
          <div className="chips">
            {LANGUAGES.map((l) => (
              <label key={l} className="chip">
                <input type="radio" name="language" value={l} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field full">
          <label htmlFor="f-msg">
            Tell us about your project <span className="req">*</span>
          </label>
          <textarea id="f-msg" name="message" required placeholder="Equipment you need, must-haves, where you'll operate, anything else we should know…" {...aria("message")} />
          {err("message")}
        </div>
        <div className="field full">
          <label htmlFor="f-heard">How did you hear about us?</label>
          <select id="f-heard" name="heard" defaultValue="">
            <option value="">Select…</option>
            {HEARD_FROM.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-foot">
        <small>We&apos;ll only use your info to respond to your request.</small>
        <button className="btn btn-spark" type="submit" disabled={sending}>
          {sending ? (
            "Sending…"
          ) : (
            <>
              Send Request <Icon name="arrow" />
            </>
          )}
        </button>
      </div>

      <div ref={statusRef} role="status" aria-live="polite">
        {status.kind === "ok" && (
          <div className="form-status ok">
            <b>Thank you — your request is in.</b> David or Oliver will reach out within one business day. ¡Gracias!
          </div>
        )}
        {status.kind === "err" && (
          <div className="form-status err">
            {status.message} Please email us at <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
            <a href={`tel:${primaryPhone.tel}`}>{primaryPhone.phone}</a>.
          </div>
        )}
      </div>
    </form>
  );
}
