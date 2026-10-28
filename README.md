# Battle Born Custom Trailers — Website v2

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zod · Nodemailer (Gmail SMTP). Deploys to Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the Gmail app password
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Email setup (Gmail SMTP)

The quote form and the trailer builder send email from the server (`/api/quote`, `/api/design`) through Gmail.

1. Sign in to the Gmail account that will send the emails (e.g. battleborntrailers@gmail.com).
2. Turn on **2-Step Verification** in Google Account → Security.
3. Go to **App passwords**, create one called "Website", and copy the 16-character password.
4. Set these environment variables in `.env.local` **and** in Vercel → Project → Settings → Environment Variables:

| Variable | Example | What it does |
|---|---|---|
| `GMAIL_USER` | `battleborntrailers@gmail.com` | Gmail account that sends |
| `GMAIL_APP_PASSWORD` | `abcd efgh ijkl mnop` | App password from step 3 |
| `CONTACT_TO_EMAIL` | `battleborntrailers@gmail.com` | Inbox that receives leads (comma-separate several) |
| `SEND_CONFIRMATION_EMAIL` | `true` | Sends customers an automatic bilingual "we got it" email |
| `NEXT_PUBLIC_SITE_URL` | `https://battleborncustomtrailers.com` | Used for design links, sitemap and social previews |

Lead emails use **Reply-To = the customer**, so hitting Reply answers them directly.
Builder emails include the design image, the full spec list and an "Open this design" link.

## Project layout

```
src/
  app/                    pages (/, /builds, /interiors, /services, /about, /builder, /contact)
    api/quote/route.ts    quote form → email
    api/design/route.ts   trailer design → email with PNG + reopen link
    globals.css           design system (tokens + components, Tailwind v4)
    sitemap.ts, robots.ts
  components/
    builder/              Trailer builder (React) + scoped CSS
    gallery/              Builds grid w/ filters, interiors grid, flagship spotlight, lightbox
    forms/QuoteForm.tsx
    layout/               Header (mobile menu), footer
    motion/               Scroll reveal, sparks, count-up
  lib/
    content.ts            ← gallery photos, videos, services text
    site.ts               ← phone numbers, email, Instagram handles
    schemas.ts            Zod validation shared by forms and API
    builder/              Builder data, presets, SVG scene renderer, PNG export
    mailer.ts             Gmail transport + email templates
public/assets/            images & videos
```

## Adding photos & videos

1. Put the photo in `public/assets/img/builds/` (or `interiors/`).
2. Add a line to `BUILDS` (or `INTERIORS`) in `src/lib/content.ts`:
   ```ts
   { img: "/assets/img/builds/new-trailer.jpg", title: "New Trailer", text: "Short description", cat: "wrap" },
   ```
   `cat`: `wrap` (custom wrap) · `clean` (solid-color build) · `shop` (in the shop).
3. Videos: put the `.mp4` in `public/assets/video/` and add a line to `VIDEOS`.

The first build is shown large on /builds; the first 6 appear on the home page. Images are automatically resized and served as AVIF/WebP.

Tip: keep photos ~1600px wide JPGs, and compress phone videos first
(`ffmpeg -i in.mp4 -vf scale=720:-2 -crf 27 -movflags +faststart out.mp4`).

## Trailer builder

Equipment sizes, cooking presets, colors and gadgets live in `src/lib/builder/constants.ts`; templates in `src/lib/builder/design.ts`.
Share links (`/builder#d=…`) from the old site still open.

## Deploy

Push to GitHub → Vercel auto-detects Next.js (no settings needed). Add the environment variables above, then redeploy.
Old URLs like `/builds.html` permanently redirect to `/builds`.
