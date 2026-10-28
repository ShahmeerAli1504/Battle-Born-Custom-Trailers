import { NextResponse } from "next/server";
import { designRequestSchema, fieldErrors } from "@/lib/schemas";
import { designSchema, encodeDesign } from "@/lib/builder/design";
import { specList } from "@/lib/builder/scene";
import { MailConfigError, confirmationEmail, confirmationsEnabled, emailShell, escapeHtml, inbox, rowsTable, rowsText, sendMail } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/design — trailer builder "send design for estimate" → email with specs, image and a reopen link. */
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

  // Specs are recomputed on the server from the validated design — never trusted from the client.
  const specs = specList(d);
  const link = `${site.url}/builder#d=${encodeDesign(d)}`;

  const contact: [string, string | undefined][] = [
    ["Name", r.name],
    ["Phone", r.phone],
    ["Email", r.email],
    ["Launch timeline", r.timeline],
    ["Notes", r.notes || "—"],
  ];

  const attachments = r.image
    ? [{ filename: `${(d.name || "trailer").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-design.png`, content: r.image.split(",")[1]!, encoding: "base64" as const, cid: "design@battleborn" }]
    : [];

  const html = emailShell(
    "New trailer design",
    `${r.image ? `<img src="cid:design@battleborn" alt="Trailer design" width="592" style="display:block;width:100%;height:auto;border-radius:8px;border:1px solid #e3e7ec;margin:0 0 16px">` : ""}
     ${rowsTable(contact)}
     <h2 style="font-size:16px;margin:22px 0 8px;color:#07090d;text-transform:uppercase;letter-spacing:1px">Design specs</h2>
     ${rowsTable(specs)}
     <p style="margin:20px 0 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ff7a1a;color:#160800;font-weight:bold;text-decoration:none;padding:12px 18px;border-radius:999px">Open this design in the builder</a></p>`,
  );

  try {
    await sendMail({
      to: inbox(),
      replyTo: { name: r.name, address: r.email },
      subject: `New trailer design — ${r.name}${d.name ? ` (${d.name})` : ""}`,
      text: `${rowsText(contact)}\n\nDESIGN SPECS\n${specs.map(([k, v]) => `• ${k}: ${v}`).join("\n")}\n\nOpen the design: ${link}`,
      html,
      attachments,
    });

    if (confirmationsEnabled()) {
      await sendMail({
        to: { name: r.name, address: r.email },
        subject: "Your trailer design is in — Battle Born Custom Trailers",
        html: confirmationEmail(r.name, "trailer design").replace(
          "</p>",
          `</p><p style="margin:0 0 12px"><a href="${escapeHtml(link)}" style="color:#2457d6">Reopen your design anytime</a></p>`,
        ),
        text: `Thanks ${r.name}! Your trailer design is in. Reopen it anytime: ${link}`,
      }).catch((err) => console.warn("[design] confirmation email failed", err));
    }
  } catch (err) {
    console.error("[design] send failed", err);
    const msg = err instanceof MailConfigError ? "Email isn't configured on the server yet." : "We couldn't send your design right now.";
    return NextResponse.json({ ok: false, error: msg, link }, { status: 502 });
  }

  return NextResponse.json({ ok: true, link });
}
