# Battle Born Custom Trailers — Website

Static multi-page site (plain HTML/CSS/JS — no build step). Deploys straight to Vercel.

## Pages
| File | Page |
|---|---|
| `index.html` | Home — logo video hero, flagship build, recent builds, interiors preview, services, story video |
| `builds.html` | Completed builds gallery (filters + lightbox), Mendoza's flagship spotlight, video build tours |
| `interiors.html` | "Step Inside Excellence" interior gallery |
| `services.html` | Services, process, why us, beyond the build |
| `about.html` | Story, mission, team (David & Oliver), videos |
| `builder.html` | **Build Your Trailer** — interactive designer (size, colors, wraps, drag-and-drop gadgets, branding, kitchen floor plan) that emails the design for an estimate |
| `contact.html` | Quote request form + direct contacts / Instagram |

## Adding photos & videos
Everything in the galleries comes from **`assets/js/gallery-data.js`**.

1. Put the photo in `assets/img/builds/` (or `assets/img/interiors/`).
2. Add a line to `BB_BUILDS` (or `BB_INTERIORS`):
   ```js
   { img: "assets/img/builds/new-trailer.jpg", title: "New Trailer", text: "Short description", cat: "wrap" },
   ```
   `cat` options: `wrap` (custom wrap), `clean` (solid color build), `shop` (in the shop).
3. For videos: put the `.mp4` in `assets/video/` and add a line to `BB_VIDEOS`.

The first item in `BB_BUILDS` is shown large on the Builds page; the first 6 appear on the Home page.

Tip: keep photos ~1600px wide JPGs, and compress phone videos before adding
(`ffmpeg -i in.mp4 -vf scale=720:-2 -crf 27 -movflags +faststart out.mp4`).

## Contact form
The form posts to [FormSubmit](https://formsubmit.co) → `battleborntrailers@gmail.com`.
**The very first submission sends an activation email to that inbox — click "Activate" once** and every form after that is delivered.
To change the destination email, edit the `action` URL in `contact.html`.

## Trailer builder (`builder.html`)
Everything runs in the browser — no backend. Customers design a trailer and hit **Send design for estimate**;
the shop gets an email (via FormSubmit, same inbox as the contact form) with the full spec list and a link that reopens the exact design.
Equipment sizes, cooking-style presets and colors live at the top of the `<script>` in `builder.html` (`EQUIP`, `CUISINES`, `COLORS`).
The home-page preview image is `assets/img/builder-preview.jpg`.

## Deploy
Import the repo in Vercel → Framework preset **Other** → no build command, output directory `/`.
`vercel.json` enables clean URLs (`/builds` instead of `/builds.html`).
