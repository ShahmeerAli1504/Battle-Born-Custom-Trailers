import { NextResponse } from "next/server";
import { designRequestSchema, fieldErrors } from "@/lib/schemas";
import { designSchema, encodeDesign } from "@/lib/builder/design";
import { specSections } from "@/lib/builder/scene";
import { MailConfigError, confirmationEmail, confirmationsEnabled, emailShell, escapeHtml, inbox, rowsTable, rowsText, sendMail } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PICTURES = [
  { key: "exterior", title: "Outside — daytime", file: "outside-day" },
  { key: "night", title: "Outside — at night", file: "outside-night" },
  { key: "plan", title: "Kitchen floor plan", file: "floor-plan" },
] as const;

/** POST /api/design — trailer builder "send design for estimate" → email with every picture, the full spec sheet and a reopen link. */
export async function POST(req: Request) {
  const rl = rateLimit(`design:${clientIp(req)}`);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests — please try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = designRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const r = parsed.data;
  if (r.website) return NextResponse.json({ ok: true });

  const design = designSchema.safeParse(r.design);
  if (!design.success) {
    return NextResponse.json({ ok: false, error: "That design couldn't be read — please refresh the builder and try again." }, { status: 422 });
  }
  const d = design.data;

  // The spec sheet is rebuilt on the server from the validated design — never trusted from the client.
  const sections = specSections(d);
  const link = `${site.url}/builder#d=${encodeDesign(d)}`;
  const slug = (d.name || "trailer").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "trailer";

  const contact: [string, string | undefined][] = [
    ["Name", r.name],
    ["Phone", r.phone],
    ["Email", r.email],
    ["Launch timeline", r.timeline],
    ["Notes", r.notes || "—"],
  ];

  // Every picture is attached (so it can be saved/forwarded) and shown inline in the email.
  const pics = PICTURES.flatMap((p) => {
    const url = r.images?.[p.key];
    if (!url) return [];
    const [meta, data] = url.split(",");
    const ext = meta!.includes("jpeg") ? "jpg" : "png";
    return [{ ...p, cid: `${p.key}@battleborn`, attachment: { filename: `${slug}-${p.file}.${ext}`, content: data!, encoding: "base64" as const, cid: `${p.key}@battleborn` } }];
  });

  const img = (cid: string, alt: string) =>
    `<img src="cid:${cid}" alt="${escapeHtml(alt)}" width="592" style="display:block;width:100%;height:auto;border-radius:8px;border:1px solid #e3e7ec">`;
  const h2 = (t: string) => `<h2 style="font-size:15px;margin:26px 0 8px;color:#07090d;text-transform:uppercase;letter-spacing:1px">${escapeHtml(t)}</h2>`;
  const swatchRow = (label: string, value: string, swatch?: string) =>
    `<tr><td style="padding:8px 10px;border-bottom:1px solid #e3e7ec;color:#5b6677;width:38%;vertical-align:top;font-weight:bold">${escapeHtml(label)}</td><td style="padding:8px 10px;border-bottom:1px solid #e3e7ec">${
      swatch ? `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid #9aa4b0;background:${escapeHtml(swatch)};vertical-align:-2px;margin-right:8px"></span>` : ""
    }${escapeHtml(value)}</td></tr>`;

  const html = emailShell(
    `New trailer design${d.name ? ` — ${d.name}` : ""}`,
    `${pics[0] ? img(pics[0].cid, pics[0].title) : ""}
     ${h2("Customer")}
     ${rowsTable(contact)}
     ${
       pics.length > 1
         ? `${h2("More views")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${pics
             .slice(1)
             .map((p) => `<tr><td style="padding:0 0 6px;font-size:12px;color:#5b6677;text-transform:uppercase;letter-spacing:1px">${escapeHtml(p.title)}</td></tr><tr><td style="padding:0 0 14px">${img(p.cid, p.title)}</td></tr>`)
             .join("")}</table>`
         : ""
     }
     ${sections
       .map(
         (s) =>
           `${h2(s.title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">${s.rows.map((row) => swatchRow(row.label, row.value, row.swatch)).join("")}</table>`,
       )
       .join("")}
     <p style="margin:24px 0 6px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ff7a1a;color:#160800;font-weight:bold;text-decoration:none;padding:12px 18px;border-radius:999px">Open this design in the builder</a></p>
     <p style="margin:0;font-size:12px;color:#5b6677">Pictures are also attached to this email. Reply to answer ${escapeHtml(r.name)} directly.</p>`,
  );

  const text = [
    rowsText(contact),
    ...sections.map((s) => `\n${s.title.toUpperCase()}\n${s.rows.map((row) => `• ${row.label}: ${row.value}`).join("\n")}`),
    `\nPictures attached: ${pics.map((p) => p.title).join(", ") || "none"}`,
    `Open the design: ${link}`,
  ].join("\n");

  try {
    await sendMail({
      to: inbox(),
      replyTo: { name: r.name, address: r.email },
      subject: `New trailer design — ${r.name}${d.name ? ` (${d.name})` : ""}`,
      text,
      html,
      attachments: pics.map((p) => p.attachment),
    });

    if (confirmationsEnabled()) {
      const first = pics[0];
      await sendMail({
        to: { name: r.name, address: r.email },
        subject: "Your trailer design is in — Battle Born Custom Trailers",
        html: confirmationEmail(r.name, "trailer design").replace(
          "</p>",
          `</p>${first ? `<div style="margin:0 0 14px">${img(first.cid, "Your trailer design")}</div>` : ""}<p style="margin:0 0 12px"><a href="${escapeHtml(link)}" style="color:#2457d6">Reopen your design anytime</a></p>`,
        ),
        text: `Thanks ${r.name}! Your trailer design is in. Reopen it anytime: ${link}`,
        attachments: first ? [first.attachment] : [],
      }).catch((err) => console.warn("[design] confirmation email failed", err));
    }
  } catch (err) {
    console.error("[design] send failed", err);
    const msg = err instanceof MailConfigError ? "Email isn't configured on the server yet." : "We couldn't send your design right now.";
    return NextResponse.json({ ok: false, error: msg, link }, { status: 502 });
  }

  return NextResponse.json({ ok: true, link });
}
