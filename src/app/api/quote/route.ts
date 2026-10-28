import { NextResponse } from "next/server";
import { fieldErrors, quoteSchema } from "@/lib/schemas";
import { MailConfigError, confirmationEmail, confirmationsEnabled, emailShell, inbox, rowsTable, rowsText, sendMail } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/quote — contact-page quote request → email to the shop (+ optional confirmation). */
export async function POST(req: Request) {
  const rl = rateLimit(`quote:${clientIp(req)}`);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests — please try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const q = parsed.data;

  // Honeypot filled → pretend success, send nothing.
  if (q.website) return NextResponse.json({ ok: true });

  const rows: [string, string | undefined][] = [
    ["Name", q.name],
    ["Phone", q.phone],
    ["Email", q.email],
    ["Business / concept", q.business],
    ["Services needed", q.services.length ? q.services.join(", ") : "—"],
    ["Trailer size", q.size],
    ["Food concept", q.food],
    ["Budget", q.budget],
    ["Timeline", q.timeline],
    ["Preferred language", q.language],
    ["Heard about us", q.heard],
    ["Message", q.message],
  ];

  try {
    await sendMail({
      to: inbox(),
      replyTo: { name: q.name, address: q.email },
      subject: `New quote request — ${q.name}${q.business ? ` (${q.business})` : ""}`,
      text: rowsText(rows),
      html: emailShell("New quote request", `${rowsTable(rows)}<p style="margin:16px 0 0;font-size:13px;color:#5b6677">Reply to this email to answer ${q.name} directly.</p>`),
    });

    if (confirmationsEnabled()) {
      await sendMail({
        to: { name: q.name, address: q.email },
        subject: "We got your request — Battle Born Custom Trailers",
        html: confirmationEmail(q.name, "quote request"),
        text: `Thanks ${q.name}! Your quote request is in. David or Oliver will reach out within one business day. ¡Gracias!`,
      }).catch((err) => console.warn("[quote] confirmation email failed", err));
    }
  } catch (err) {
    console.error("[quote] send failed", err);
    const msg = err instanceof MailConfigError ? "Email isn't configured on the server yet." : "We couldn't send your request right now.";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
