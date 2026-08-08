# Melody AI — Coming Soon

The "coming soon" landing page for **Melody AI**, the AI growth engine for artists, labels, and managers.

> _The smarter way to grow your music._ Melody AI turns your streaming, social, and sales data into the exact next move — then takes it for you.

## What's here

A single, self-contained static landing page:

- **`index.html`** — the whole page (inline CSS + JS, no build step)
- **`assets/`**
  - `melody-bg.mp4` — looping cinematic background video (violet/fuchsia audio-waveform visualizer, generated with Higgsfield AI)
  - `melody-poster.jpg` — first-frame poster shown while the video loads / on reduced-motion
  - `melody-avatar.png` — the Melody brand mark

## Features

- Full-screen looping background video with a **two-video crossfade** for a seamless loop
- Animated gradient headline, pulsing "coming soon" badge, and an animated equalizer accent
- **Waitlist email capture** (client-side placeholder — swap in a real endpoint before launch)
- Fully responsive (desktop → mobile) and `prefers-reduced-motion` aware (falls back to the poster still)

## Run locally

It's plain static HTML — open `index.html` directly, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

Works as-is on any static host — **GitHub Pages**, **Vercel**, **Netlify**, or **Cloudflare Pages**. Point the host at the repo root; no build command needed.

## Wiring the waitlist → Google Sheets

Signups can drop straight into a Google Sheet via a free Google Apps Script Web App:

1. Open the sheet → **Extensions ▸ Apps Script**, and paste in **`google-apps-script.gs`** (in this repo).
2. **Deploy ▸ New deployment ▸ Web app** — _Execute as: Me_, _Who has access: Anyone_ — then copy the Web app URL (ends in `/exec`).
3. Paste that URL into `WAITLIST_ENDPOINT` near the top of the `<script>` in **`index.html`**.
4. (Optional) run `setup` once in the Apps Script editor to add a header row.

Until `WAITLIST_ENDPOINT` is set, submissions are kept in the browser's `localStorage` as a backup so nothing is lost. Any other provider (Formspree, ConvertKit, Mailchimp, Beehiiv) works the same way — just swap the endpoint.

---

© 2026 Melody AI
