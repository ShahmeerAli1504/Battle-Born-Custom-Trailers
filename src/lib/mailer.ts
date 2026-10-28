import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { site } from "@/lib/site";

/**
 * Gmail SMTP transport. Needs GMAIL_USER + GMAIL_APP_PASSWORD (a Google "App password",
 * which requires 2-Step Verification on the account). See .env.example.
 */
let transporter: Transporter | null = null;

export class MailConfigError extends Error {}

function getTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) throw new MailConfigError("GMAIL_USER / GMAIL_APP_PASSWORD are not set");
  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

export const inbox = () =>
  (process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER || site.email)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const confirmationsEnabled = () => (process.env.SEND_CONFIRMATION_EMAIL ?? "true").toLowerCase() !== "false";

export async function sendMail(opts: Mail.Options) {
  const t = getTransporter();
  return t.sendMail({ from: { name: site.name, address: process.env.GMAIL_USER! }, ...opts });
}

/* ---------------- tiny HTML email templates ---------------- */

export const escapeHtml = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailShell(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;color:#1b2230">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#07090d;padding:20px 24px;border-bottom:4px solid #ff7a1a">
        <div style="font-size:20px;font-weight:800;letter-spacing:1px;color:#f3f6fa;text-transform:uppercase">Battle Born</div>
        <div style="font-size:11px;letter-spacing:3px;color:#ff7a1a;text-transform:uppercase">Custom Trailers</div>
      </td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 16px;font-size:22px;color:#07090d">${escapeHtml(title)}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 24px;background:#f6f8fa;color:#5b6677;font-size:12px">
        ${escapeHtml(site.name)} · ${site.people.map((p) => `${escapeHtml(p.name.split(" ")[0])} ${escapeHtml(p.phone)}`).join(" · ")} · Hablamos Español
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export function rowsTable(rows: [string, string | undefined | null][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">${rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 10px;border-bottom:1px solid #e3e7ec;color:#5b6677;width:34%;vertical-align:top;font-weight:bold">${escapeHtml(k)}</td><td style="padding:8px 10px;border-bottom:1px solid #e3e7ec;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

export const rowsText = (rows: [string, string | undefined | null][]) =>
  rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export function confirmationEmail(name: string, what: string) {
  const first = name.split(" ")[0] || name;
  return emailShell(
    `Thanks, ${first} — we got your ${what}`,
    `<p style="margin:0 0 12px;line-height:1.6">Your ${escapeHtml(what)} is in. David or Oliver will reach out within one business day with next steps.</p>
     <p style="margin:0 0 12px;line-height:1.6"><b>¡Gracias!</b> Recibimos tu solicitud — te contactaremos pronto. Hablamos Español.</p>
     <p style="margin:0;line-height:1.6">Need us sooner? Call ${site.people.map((p) => `<a href="tel:${p.tel}" style="color:#2457d6">${escapeHtml(p.phone)}</a>`).join(" or ")}.</p>`,
  );
}
