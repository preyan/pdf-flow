<div align="center">

<img src="public/icon.svg" alt="PDFFlow" width="84" height="84" />

# PDFFlow

### All your PDFs. None of our business.

[![Version](https://img.shields.io/github/package-json/v/preyan/pdf-flow?style=flat-square&label=version&color=637cff)](https://github.com/preyan/pdf-flow/releases)
[![Deploy](https://github.com/preyan/pdf-flow/actions/workflows/deploy.yml/badge.svg)](https://github.com/preyan/pdf-flow/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2F2F2F.svg?style=flat-square)](./LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-5A0FC8.svg?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bundle ~120 KB gzip](https://img.shields.io/badge/initial%20js-~120%20KB%20gzip-success.svg?style=flat-square)](#performance)
[![Zero tracking](https://img.shields.io/badge/tracking-0%20bytes-success.svg?style=flat-square)](#privacy-concretely)

**A privacy-first PDF toolbox. Merge, split, compress, edit, watermark, sign, and convert PDFs — entirely in your browser.**

[**🚀 Open the app**](https://preyan.github.io/pdf-flow/) &nbsp;·&nbsp; [Audit the code](https://github.com/preyan/pdf-flow) &nbsp;·&nbsp; [About](https://preyan.github.io/pdf-flow/#/about)

</div>

---

## Why this exists

Most "free PDF tools" online share the same business model: you upload a file, they process it on their server, you download the result. Somewhere in that loop, your document sits on someone else's disk.

PDFFlow flips the model. Your file never leaves your browser. There's no upload, no temporary storage, no _"we delete files after 24 hours"_ promise to take on faith. The architecture itself makes the privacy claim literal — **there's no server to leak from, because there is no server.**

<table>
  <tr>
    <td align="center">☁️<br><b>No upload</b><br><sub>Zero bytes sent</sub></td>
    <td align="center">👁<br><b>No tracking</b><br><sub>No analytics</sub></td>
    <td align="center">👤<br><b>No account</b><br><sub>Nothing to sign up for</sub></td>
    <td align="center">📶<br><b>Works offline</b><br><sub>After first visit</sub></td>
  </tr>
</table>

---

## How it works

```
┌─────────────────────┐         ┌─────────────────────┐
│   Your browser      │         │   PDFFlow server    │
│                     │         │                     │
│  PDF in → process   │   ❌    │   ⋯ doesn't exist   │
│  → PDF out          │         │                     │
└─────────────────────┘         └─────────────────────┘
```

Everything runs client-side. The whole app is **~120 KB gzipped** on initial load, with `pdf-lib` (mutation) and `pdfjs-dist` (rendering) lazy-loaded only when a tool needs them. After the first visit, the service worker caches the app and it works fully offline as a PWA.

---

## What it does

| Tool | What it does | How |
|:---|:---|:---|
| **Merge** | Combine multiple PDFs into one | Drop multiple files, reorder, merge & download |
| **Split** | Extract pages into a new PDF | Pick by range (`1-3, 7, 10-12`) or click thumbnails |
| **Compress** | Reduce file size | Quality slider, live size estimate |
| **Edit** | Rotate, delete, reorder pages | Thumbnail grid with undo / redo |
| **Watermark** | Add a text watermark | 3×3 position picker, opacity, size, rotation |
| **Sign** | Place a hand-drawn or typed signature | Click any page to place |
| **Convert** | Export PDF → PNG / JPG | DPI slider, single image or ZIP for multi-page |

Files larger than 10 MB are rejected with a clear message. Results download straight to your local downloads folder.

---

## Privacy, concretely

| Concern | What PDFFlow does |
|:---|:---|
| **Files** | Never leave your browser. |
| **Logs** | None. No servers to log from. |
| **Cookies** | Zero. `localStorage` for your theme choice only. |
| **Analytics** | None at all. |
| **External requests at runtime** | Zero. Open DevTools → Network and verify. |
| **Data retention** | Up to 7 days in your own IndexedDB, then auto-purged. |
| **Account** | There isn't one to make. |

The entire source is in this repo. Verify the claims yourself, or open the deployed app's Network tab and watch the silence.

---

## Performance

- **~120 KB gzip** initial JavaScript bundle.
- **pdf-lib** (~177 KB gzip) and **pdfjs-dist** (~122 KB gzip) live in separate chunks, lazy-loaded only when their tool is opened.
- **Vite 8 with Rolldown** — production builds in ~2 seconds.
- **PWA** — service worker precaches all assets; the app loads instantly and works offline after the first visit.
- **Lighthouse target:** Performance ≥ 90, PWA ≥ 90, Accessibility ≥ 90.

---

## Tech stack

| Layer | Choice |
|:---|:---|
| Build & dev | **Vite 8** (Rolldown) |
| UI | **React 19** + **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** with OKLCH tokens · **shadcn/ui** on Base UI |
| Routing | **React Router v7** (`HashRouter` — zero 404 config on GitHub Pages) |
| State | **Zustand** (theme persisted to `localStorage`) |
| Storage | **Dexie** (IndexedDB wrapper, 7-day auto-cleanup) |
| PDF mutation | **pdf-lib** — lazy-loaded |
| PDF rendering | **pdfjs-dist** — lazy-loaded |
| Signatures | **signature_pad** |
| Archives | **jszip** — for multi-page Convert output |
| Motion | **Motion** (`motion/react`) with `useReducedMotion` |
| Icons | **lucide-react** |
| PWA | **vite-plugin-pwa** |

System sans-serif fonts only. No Google Fonts, no third-party network requests, anywhere.

---

## Run locally

Requirements: Node 22+, npm 10+.

```bash
git clone https://github.com/preyan/pdf-flow.git
cd pdf-flow
npm install
npm run icons        # one-off: generate PWA PNG icons from the SVG
npm run dev          # → http://127.0.0.1:5173
```

## Build & deploy

```bash
npm run build        # → ./dist  (~120 KB gzip initial JS)
npm run preview      # preview the production build locally
npm run deploy       # publish ./dist to the gh-pages branch
```

Every push to `main` redeploys automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Test

```bash
npm test             # vitest + jsdom + fake-indexeddb · 16 unit tests
```

---

## Project structure

```
src/
├── components/
│   ├── ui/          # shadcn primitives (button, slider, drawer, …)
│   ├── shared/      # Header, Footer, TrustStrip, DropZone, FileCard, Workspace, …
│   └── Logo.tsx
├── tools/           # one folder per feature (merge, split, …)
├── pages/           # Home, Tool, About
├── services/
│   ├── pdfService.ts     # pdf-lib wrapper (every op is dynamically imported)
│   └── storageService.ts # Dexie wrapper with 7-day auto-cleanup
├── store/           # Zustand store (theme)
├── hooks/           # useReducedMotion, usePdfPreview
├── lib/             # utils, fileUtils, tools registry
└── index.css        # Tailwind v4 @theme tokens (OKLCH, dark-first)
```

---

## Design

- **Dark by default.** Light mode opt-in via `<html class="light">`.
- **OKLCH tokens** through Tailwind v4 `@theme`. Cards are `oklch(0.18 0 0)`, primary is `oklch(0.65 0.17 255)` (indigo).
- **Mobile-first**, with touch targets ≥ 44 × 44 px.
- **WCAG AA** contrast across light and dark modes.
- **`prefers-reduced-motion`** respected — page transitions disable themselves automatically.

---

## License

[**MIT**](./LICENSE) — do whatever you want, keep the notice.

---

<div align="center">

Built and maintained by **[Preyan Bhowmick](https://preyan.github.io/)** &nbsp;·&nbsp; [github.com/preyan](https://github.com/preyan)

<sub>_Built this. Maintains this. Won't sell your data._</sub>

</div>
