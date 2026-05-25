# Tilda AR embed — audit and deployment guide

This document explains how the embed works, why local preview can differ from Tilda, and exactly where to put assets.

Sources: [WebKit AR in Safari](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/), [model-viewer FAQ](https://modelviewer.dev/docs/faq.html), [AR Quick Look from the web](https://cwervo.com/writing/quicklook-web/).

## How iOS AR is supposed to work

Two parallel mechanisms:

| Layer | Role |
|--------|------|
| `<model-viewer>` | Shows **GLB** in the page (3D preview, animations) |
| `<a rel="ar" href="*.usdz">` + child `<img>` | Opens **AR Quick Look** on iPhone (native USDZ) |

Requirements from Apple / WebKit:

1. USDZ URL must be reachable over **HTTPS** (HTTP works in theory; production should be HTTPS).
2. Server must send **`Content-Type: model/vnd.usdz+zip`** for `.usdz` (older servers used `model/vnd.pixar.usd`).
3. `rel="ar"` link must have **`<img>` or `<picture>` as the first direct child** (not only CSS pseudo-elements).
4. Safari only — AR Quick Look does not run in Chrome/Firefox on iOS the same way.

`model-viewer` can also use `ios-src` + `activateAR()`, but your working setup used a plain **`rel="ar"`** link; keep that pattern.

## Why old USDZ worked and `pornozamok` may not

Your pipeline can be fine while **one file** fails Quick Look.

| Check | `heart.usdz` (test) | `pornozamok.usdz` (yours) |
|--------|---------------------|---------------------------|
| Size | ~385 KB | ~31 MB |
| GLB in repo | — | ~45 MB |

Apple guidance (community + WWDC): prefer **&lt; ~20 MB**, **≤ 2048 px textures**, **≤ ~100K polygons**. Oversized USDZ often shows **spinner forever** or **Preview / 0 KB** even when the server returns 200.

**Verify the file itself (not the website):**

1. AirDrop `pornozamok.usdz` to iPhone → open in **Files** → tap → AR should start.
2. If it fails there too → re-export USDZ; changing HTML will not help.

## Local preview (`npm run build` + `npm run preview`) — what is “local only”

| Topic | Local Vite preview | Tilda production |
|--------|----------------------|------------------|
| URL | `https://192.168.x.x:4174/...` self-signed cert | `https://yoursite.tilda.ws` valid cert |
| HTML served | **`dist/tilda-embed.html`** after build, not the file in project root | T123 block you paste |
| Paths like `/models/x.glb` | OK if files are in `public/models/` and you ran **`npm run build`** | **Broken** unless that path exists on Tilda host |
| USDZ MIME | Fixed in `vite.config.ts` middleware | Depends on Tilda CDN (often `application/octet-stream`) |

**Common mistakes we hit earlier (wrong direction):**

- Editing `tilda-embed.html` in the repo but opening preview **without** `npm run build` → phone still saw old `dist/`.
- `fetch` + `blob:` for USDZ → Quick Look often shows **0 KB** on iOS.
- Removing `ios-src` / auto-generating USDZ from 45 MB GLB → slow and unreliable.
- Blaming HTTPS only — **heart.usdz worked locally**, so the server setup is capable; **`pornozamok.usdz` is the suspect**.

**Will Tilda fix it?**

Often **yes for deployment**, **no for a bad USDZ file**:

- Tilda gives **real HTTPS** and stable CDN URLs → better than self-signed LAN IP.
- Tilda will **not** fix an oversized or corrupt USDZ.
- You must use **absolute URLs** to uploaded files in the HTML block.

## Where to put files

### A) Local testing (this repo)

```
public/
  models/
    pornozamok.glb    ← model-viewer src
    pornozamok.usdz   ← AR Quick Look (ios-src + rel="ar" href)
  перейти на сайт.png  ← bottom CTA image (filename must match HTML exactly)
```

After any change to `tilda-embed.html`:

```bash
npm run build
npm run preview
```

Open: `https://<your-lan-ip>:4174/tilda-embed.html` (port from terminal).

### B) Tilda (production)

1. **Site settings → File manager** (or page file upload).
2. Upload:
   - `pornozamok.glb`
   - `pornozamok.usdz`
   - `перейти на сайт.png` (or rename and update HTML)
3. For each file, copy the **full CDN URL** (looks like `https://static.tildacdn.com/...`).
4. In T123 HTML block, replace **every** asset path:

```html
<!-- Example — use YOUR URLs from Tilda -->
<model-viewer
  src="https://static.tildacdn.com/xxxxxxxx/pornozamok.glb"
  ios-src="https://static.tildacdn.com/xxxxxxxx/pornozamok.usdz"
  ...
>
<a rel="ar" href="https://static.tildacdn.com/xxxxxxxx/pornozamok.usdz">
  <img src="https://static.tildacdn.com/xxxxxxxx/ar-poster.jpg" alt="" />
</a>
```

5. Bottom CTA:

```html
<img src="https://static.tildacdn.com/xxxxxxxx/перейти-на-сайт.png" alt="Перейти на сайт" />
```

6. Set real site URL in `#poster-site-cta` `href`.

**Do not use** `/models/...` on Tilda unless you host those exact paths on your domain.

### C) If Tilda serves USDZ with wrong MIME

Upload USDZ to a host where you control headers, for example:

- GitHub Pages + `_headers` (Cloudflare Pages)
- S3 / Cloudflare R2 with `Content-Type: model/vnd.usdz+zip`
- Your own nginx

GLB can stay on Tilda; USDZ can be on another HTTPS origin (CORS must allow your Tilda domain for model-viewer GLB fetch if cross-origin).

## Minimal HTML checklist before paste into Tilda

- [ ] `model-viewer` script: `https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js` (or self-hosted)
- [ ] `src` = full URL to **.glb**
- [ ] `ios-src` = full URL to **.usdz** (same file as AR link)
- [ ] `rel="ar"` `href` = same **.usdz** URL
- [ ] First child of `rel="ar"` link = `<img src="...">` with a real image URL (poster)
- [ ] iOS: visible AR control is the `<a rel="ar">`, not only `activateAR()` from a hidden flow
- [ ] Test USDZ in iPhone **Files** app first

## Recommended asset config in embed

At the top of the script block, keep one place for URLs:

```javascript
const ASSETS = {
  glb: 'https://YOUR-CDN/pornozamok.glb',
  usdz: 'https://YOUR-CDN/pornozamok.usdz',
  siteCtaImage: 'https://YOUR-CDN/перейти-на-сайт.png',
  siteUrl: 'https://your-real-site.com',
  arPoster: 'https://YOUR-CDN/ar-poster.jpg' // optional, for rel="ar" img
}
```

Sync `viewer.src`, `ios-src`, `iosCta.href`, and poster `img.src` from `ASSETS`.

## Summary

| Question | Answer |
|----------|--------|
| Is it only a local problem? | Partly: self-signed LAN + stale `dist/` caused confusion. **heart.usdz proved the stack works.** |
| Will Tilda work? | **Yes**, if URLs are absolute and USDZ is valid/light enough. |
| Why 0 KB with pornozamok? | Most likely **USDZ file limits**, not HTML. |
| What to do next? | 1) Test USDZ in Files. 2) Re-export lighter USDZ. 3) Paste embed into Tilda with full CDN URLs. |
