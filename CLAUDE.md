# PDFFlow — Build Specification

> Give this entire file to Claude Code. It contains the brand, author, design system, tech spec, and build order.
> Verified against May 2026 versions of all libraries.

---

## 1. Brand

- **Name:** PDFFlow
- **Tagline:** All your PDFs. None of our business.
- **Positioning:** Privacy-first PDF tools that run entirely in the browser. No upload, no tracking, no account. Designed for individuals and enterprise users who can't risk shipping documents to a server.
- **Author:** Preyan Bhowmick — [github.com/preyan](https://github.com/preyan) · [preyan.github.io](https://preyan.github.io/)
- **Voice:** Confident, technical, slightly dry. We don't oversell privacy — we just point out we have no servers, so there's nothing to leak.

### Locked copy (use exactly these strings)

| Where | Copy |
|---|---|
| Page `<title>` | `PDFFlow — All your PDFs. None of our business.` |
| Meta description | `Private, in-browser PDF tools. Merge, split, compress, edit, watermark, sign, and convert PDFs without uploading them anywhere.` |
| Hero line 1 (foreground) | `All your PDFs.` |
| Hero line 2 (accent) | `None of our business.` |
| Hero subhead | `Every file you open is processed inside your browser. We don't run servers. We have nothing to leak, lose, or hand over.` |
| Trust strip labels | `No upload` · `No tracking` · `No account` · `Works offline` |
| Trust strip subtext | `Zero bytes sent` · `No analytics` · `Nothing to sign up for` · `After first visit` |
| Footer (single line) | `[lock icon] Audit code · [license icon] MIT · Built by Preyan Bhowmick · v1.0` |
| About page hero | `A privacy-first PDF toolbox.` / `Built in the open. Kept that way.` (line 2 muted) |
| About author blurb | `Built this. Maintains this. Won't sell your data.` |
| About "no stats" callout | `There's nothing to show you here. No user count, no PDF count, no usage graphs. We don't have any of that data. By design.` |

The "Built by Preyan Bhowmick" text in the footer is a link to `/about`. The GitHub URL is `https://github.com/preyan`. The portfolio URL is `https://preyan.github.io/`. Both appear on the About page only — keep the footer compact.

---

## 2. Logo

The mark is a rounded rectangle (a page) with a wave contained inside — "flow within boundaries."

### React component — drop into `src/components/Logo.tsx`

```tsx
type Props = { size?: number; className?: string }

export function LogoMark({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="10" y="9" width="28" height="30" rx="3" />
      <path d="M 15 24 Q 20 17, 24 24 T 33 24" />
    </svg>
  )
}

export function LogoLockup({ size = 26 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid place-items-center rounded-md bg-primary"
        style={{ width: size, height: size }}
      >
        <LogoMark size={size * 0.62} className="text-primary-foreground" />
      </div>
      <span className="text-sm font-medium tracking-tight">PDFFlow</span>
    </div>
  )
}
```

### App icons (PWA + favicon)

Save the mark as `public/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="oklch(0.65 0.17 255)"/>
  <g fill="none" stroke="white" stroke-width="42" stroke-linecap="round" stroke-linejoin="round" transform="translate(106 96) scale(6.25)">
    <rect x="10" y="9" width="28" height="30" rx="3"/>
    <path d="M 15 24 Q 20 17, 24 24 T 33 24"/>
  </g>
</svg>
```

Generate PNGs with `scripts/generate-icons.mjs`:

```js
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

await mkdir('public/icons', { recursive: true })
const svg = 'public/icon.svg'
await sharp(svg).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-maskable.png')
```

Favicon is the SVG: `<link rel="icon" type="image/svg+xml" href="/pdf-flow/icon.svg" />` in `index.html`.

---

## 3. Tech Stack (May 2026)

- **Vite 8** + **React 19** + **TypeScript 5.x** (Vite 8 ships with Rolldown — 10–30x faster builds)
- **Tailwind CSS v4** via `@tailwindcss/vite`. No `tailwind.config.js`. Configure with `@theme` in `index.css`.
- **shadcn/ui** for accessible components
- **Motion** (renamed from Framer Motion). Package: `motion`. Import from `motion/react`.
- **React Router v7** with `HashRouter` (works on GitHub Pages with zero 404 config)
- **Zustand** with `persist` middleware (theme persisted to localStorage)
- **Dexie** for IndexedDB
- **pdf-lib** — PDF manipulation (lazy-loaded via dynamic import)
- **pdfjs-dist** — PDF rendering (lazy-loaded)
- **signature_pad** — hand-drawn signatures
- **jszip** — bundle converted images as a ZIP download
- **vite-plugin-pwa** — service worker + manifest
- **lucide-react** — icons
- **sharp** — dev-only, generates PWA PNG icons from the SVG

---

## 4. Hard Constraints

1. **No boilerplate.** If a file isn't used, don't create it. No example code, no commented-out code, no unused imports.
2. **File size limit:** 10 MB per PDF. Reject larger files with a clear toast.
3. **Hosting:** GitHub Pages. Set `base: '/pdf-flow/'` in `vite.config.ts`. Use `HashRouter`.
4. **Privacy is the product.** Zero analytics. Zero external network calls at runtime. No cookies. The trust strip and tagline describe the architecture and must remain literally true.
5. **Lazy-load heavy libs.** `pdf-lib` and `pdfjs-dist` must be dynamic imports. Verify in `dist/` chunks.
6. **Mobile-first.** Test at 375px. Touch targets ≥ 44×44px.
7. **Dark mode is the default.** Light mode is opt-in.
8. **Type-safe.** No `any`. Strict TypeScript.
9. **Accessible.** WCAG AA contrast. Respect `prefers-reduced-motion`.

---

## 5. Design Tokens

### Colors (OKLCH, dark-first)

Drop into `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-background: oklch(0.145 0 0);     /* #0a0a0a near-black */
  --color-surface: oklch(0.18 0 0);          /* #131313 cards */
  --color-surface-hover: oklch(0.22 0 0);    /* #1f1f1f hover */
  --color-divider: oklch(0.20 0 0);          /* #1f1f1f dividers */
  --color-border: oklch(0.25 0 0);           /* #262626 borders */

  /* Text */
  --color-foreground: oklch(0.985 0 0);      /* #fafafa primary */
  --color-muted: oklch(0.72 0 0);            /* #a3a3a3 secondary */
  --color-muted-2: oklch(0.55 0 0);          /* #737373 tertiary */
  --color-muted-3: oklch(0.42 0 0);          /* #525252 quaternary */

  /* Accent */
  --color-primary: oklch(0.65 0.17 255);     /* indigo */
  --color-primary-foreground: oklch(1 0 0);

  /* Semantic */
  --color-success: oklch(0.65 0.15 145);
  --color-warning: oklch(0.75 0.16 75);
  --color-danger: oklch(0.62 0.22 25);

  --radius: 0.625rem;
}

html { color-scheme: dark; }
html.light { color-scheme: light; }
body { @apply bg-background text-foreground; }
```

shadcn init will scaffold light-mode token overrides — merge with the above.

### Typography

- **Font:** system sans-serif stack only. No Google Fonts — that would be a third-party request and would break the privacy story.
- **Weights:** 400 regular, 500 medium. Two only.
- **Hero:** `text-3xl font-medium tracking-tight leading-[1.1]`
- **Section labels (eyebrow):** `text-[11px] uppercase tracking-[0.04em] text-muted-2`
- **Body:** `text-sm leading-relaxed`
- **Microcopy:** `text-[11px] text-muted-2`
- **Sentence case everywhere** except the tiny tracking-wide eyebrow labels.

### Spacing, radius, motion

- Component padding: `p-3` (12px) inside cards, `p-4` (16px) inside panels, `p-7` (28px) outside containers
- Grid gaps: `gap-2` (8px) tool cards, `gap-3` (12px) sections
- Radius: `rounded-md` (6px) controls, `rounded-lg` (8px) cards/buttons, `rounded-xl` (12px) outer cards
- Borders: 1px or 0.5px max, never thicker
- Motion: import `motion/react`. Only animate `opacity` and `transform`. Pages fade + 4px Y translate, 200ms. Tools crossfade via `AnimatePresence`. Wrap in `useReducedMotion()`.

---

## 6. Routes

```
/              → Home
/tool/:name    → Tool view (name = merge | split | compress | edit | watermark | sign | convert)
/about         → About page
```

Use `HashRouter` from `react-router-dom` — works on GitHub Pages without 404 config.

---

## 7. Layout Sketches

### Home page

```
┌──────────────────────────────────────────────────────────┐
│ [▢] PDFFlow                          [↗ Source]  [☾]    │
│                                                          │
│  All your PDFs.                                          │
│  None of our business.            ← line 2 in accent     │
│  Every file you open is processed inside your browser.   │
│  We don't run servers. We have nothing to leak, lose,    │
│  or hand over.                                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [☁] No upload      [👁] No tracking              │   │  ← trust strip
│  │ [👤] No account    [📶] Works offline            │   │     (4 cells)
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │Merg│ │Spli│ │Comp│ │Edit│   ← 4-column tool grid     │
│  └────┘ └────┘ └────┘ └────┘                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌╌╌╌╌┐                            │
│  │Wate│ │Sign│ │Conv│ │Drop│   ← last card is dashed,   │
│  └────┘ └────┘ └────┘ └╌╌╌╌┘     global dropzone        │
│                                                          │
│  ──────────────────────────────────────────────────     │
│  [🔒] Audit code · [📜] MIT · Built by Preyan B. · v1.0 │
└──────────────────────────────────────────────────────────┘
```

Each tool card: icon top-left (18px, accent), title (13px medium), one-line description (11px muted). Whole card clickable.

### Workspace (shared layout for every tool except Edit)

```
┌────────────────────────────────────────────────────────────┐
│ [← Back]  [▢ Tool name]                [🛡] Processing local│
├─────────────────────────────────────┬──────────────────────┤
│ PREVIEW · N PAGES TOTAL    [−] [+] │ [Right panel —       │
│                                     │  changes per tool,   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  see § 8]            │
│  │ p1 │ │ p2 │ │ p3 │ │ p4 │       │                      │
│  └────┘ └────┘ └────┘ └────┘       │                      │
│                                     │ ┌──────────────────┐ │
│                                     │ │ [⬇] Primary CTA  │ │
│                                     │ └──────────────────┘ │
└─────────────────────────────────────┴──────────────────────┘
```

Right panel is 220px fixed on desktop. On mobile (< md / 768px), it becomes a bottom drawer (shadcn `Drawer`, built on `vaul`) with a drag handle.

### About page

```
┌──────────────────────────────────────────────────────┐
│ [▢] PDFFlow                       [↗ Source]  [☾]   │
│                                                      │
│ ABOUT                                                │
│ A privacy-first PDF toolbox.                         │
│ Built in the open. Kept that way.   ← muted line 2   │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ THE PERSON                                   │    │
│ │ ┌──┐  Preyan Bhowmick                        │    │
│ │ │PB│  Built this. Maintains this.            │    │
│ │ └──┘  Won't sell your data.                  │    │
│ │       [github.com/preyan ↗] [preyan.io ↗]    │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ PRIVACY, CONCRETELY                          │    │
│ │ Files          Never leave your browser      │    │
│ │ Logs           None, no servers              │    │
│ │ Cookies        Zero. localStorage for theme  │    │
│ │ Analytics      None at all                   │    │
│ │ External req.  Zero at runtime. Check DevT.  │    │
│ │ Data retention 7 days in your own IndexedDB  │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ NO USAGE STATS                               │    │
│ │ There's nothing to show you here. No user    │    │
│ │ count, no PDF count, no usage graphs. We     │    │
│ │ don't have any of that data. By design.      │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ──────────────────────────────────────────────────  │
│ [🔒] Audit code · MIT · Built by Preyan B. · v1.0   │
└──────────────────────────────────────────────────────┘
```

The "PB" avatar is initials on a tinted accent background (`oklch(0.28 0.06 255)` bg, `oklch(0.88 0.1 255)` text). Render with a simple `Avatar` component — no images.

The "No usage stats" block uses a subtle horizontal gradient from `rgba(99, 124, 255, 0.06)` to transparent, with a 0.5px divider border. Same treatment used for any callout box across the app.

### Mobile workspace (sign tool, bottom drawer)

```
┌────────────────────────┐
│  9:41          🛜 🔋    │
│ [←] Sign PDF [●] Local │
├────────────────────────┤
│ PAGE 1 OF 3            │
│      ┌────────────┐    │
│      │  page mock │    │
│      │      ┌──┐  │    │
│      │      │↗ │  │    │  ← dashed signature target
│      │      └──┘  │    │
│      └────────────┘    │
├────────────────────────┤
│      ───               │  ← drawer handle
│ YOUR SIGNATURE         │
│ [Draw │ Type]          │  ← segmented control
│ ┌──────────────────┐   │
│ │  ╱╲  ╱╲     [⟲] │   │  ← canvas + clear
│ └──────────────────┘   │
│ [  ✓ Place           ] │  ← primary CTA, full width
│ 🔒 Stored on device    │
└────────────────────────┘
```

---

## 8. Per-tool right panels

Every tool reuses the workspace layout. Only the right panel changes. All right panels share this structure:

```
HEADER:    [icon] [tool name]                    [N file(s)]
FILE CARD: [color swatch] [filename]                    [X]
           [pages count] · [size]
CONTROLS:  (tool-specific — see below)
SUMMARY:   (optional, output estimate)
CTA:       [icon] [Primary action]
```

### Merge

- File list (multiple files, stacked file cards)
- "+ Add file" dashed button at the end of the list
- Summary: total pages, output size estimate
- Each file gets a distinct color swatch from a 4-color rotation; the same swatch is shown on its pages in the left preview
- CTA: `[⬇] Merge & download`

### Split

- Single file card
- Mode toggle: `[Range] | [Pick pages]` (segmented control)
- If Range: text input with placeholder `1-3, 7, 10-12`. Live count: "6 pages selected"
- If Pick pages: thumbnails in left preview get checkboxes
- Output toggle: `[One PDF] | [Separate]`
- CTA: `[⬇] Extract pages`

### Compress

- Single file card showing current size
- Quality slider 0–100, default 70
- Estimated output box: `2.4 MB → ~1.2 MB` with `−50%` in success green
- CTA: `[⬇] Compress & download`

### Watermark

- Single file card
- Text input (`CONFIDENTIAL` default placeholder)
- Position picker: 3×3 grid of clickable dots, one selected (default: center)
- Opacity slider, 0–100, default 40
- Size slider, 12–96pt, default 48
- Rotation toggle: `[0°] | [45°]`
- Apply scope: `[All pages] | [First only]`
- CTA: `[✓] Apply watermark`

### Sign

- Mode toggle: `[Draw] | [Type]`
- If Draw: `signature_pad` canvas (light bg). `[⟲] Clear` button top-right of canvas
- If Type: text input + cursive font preview
- User clicks anywhere on a page in the left preview to place the signature (shows dashed placement target)
- CTA: `[✓] Place signature`

### Convert

- Single file card
- Format toggle: `[PNG] | [JPG]`
- DPI slider, 72–300, default 150
- Output note: `12 images bundled as ZIP` (shown when file has >1 page)
- CTA: `[⬇] Convert & download`

---

## 9. Edit tool (different layout — actions live on thumbnails)

```
┌────────────────────────────────────────────────────────────┐
│ [← Back]  [▢ Edit pages] contract.pdf  [🛡] Processing loc.│
├────────────────────────────────────────────────────────────┤
│ [↺ Rotate L] [↻ Rotate R] [🗑 Delete] | [↶ Undo] [↷ Redo] │  ← floating toolbar
│                              1 selected · 6 pages total    │
├────────────────────────────────────────────────────────────┤
│  ┌────┐  ┌────┐  ┌════┐  ┌────┐  ┌────┐                   │
│  │ p1 │  │ p2 │  │[≡] │  │ p4 │  │ p5 │   ← thumbnail grid│
│  │    │  │-90°│  │[↺][🗑] │    │ 180°│      (5 per row    │
│  └────┘  └────┘  └════┘  └────┘  └────┘     desktop)      │
│   1       2        3·selected 4    5                       │
│                                                            │
│  ⠿ Drag to reorder · Hover for actions · Click to select   │
├────────────────────────────────────────────────────────────┤
│ Changes: 3 · unsaved              [⬇ Save & download]      │
└────────────────────────────────────────────────────────────┘
```

- No right panel. The thumbnail grid fills the whole canvas.
- Hovering a thumbnail reveals: grip handle (top-left, for drag), rotate icon (bottom-center), delete icon (bottom-center).
- Selected thumbnail has a 1.5px accent border + subtle accent overlay.
- Rotated pages render visually rotated and show a small `-90°` / `180°` badge top-right.
- Bottom bar always visible: shows unsaved change count + primary CTA.

---

## 10. Folder Structure

```
src/
├── components/
│   ├── ui/              # shadcn (button, dialog, slider, sonner, drawer, tabs, dropdown-menu, tooltip)
│   ├── Logo.tsx         # LogoMark + LogoLockup
│   └── shared/          # DropZone, FileCard, ProgressBar, ThemeToggle, TrustStrip, Avatar
├── tools/
│   ├── merge/
│   ├── split/
│   ├── compress/
│   ├── edit/
│   ├── watermark/
│   ├── sign/
│   └── convert/
├── pages/
│   ├── Home.tsx
│   ├── Tool.tsx         # router for tool views
│   └── About.tsx
├── store/               # appStore.ts (Zustand)
├── services/
│   ├── pdfService.ts    # pdf-lib wrapper, all dynamic imports
│   └── storageService.ts # Dexie wrapper, 7-day auto-cleanup
├── hooks/               # usePdfProcessor, useTheme, useReducedMotion
├── lib/                 # utils.ts (shadcn cn), fileUtils.ts
├── types/
├── App.tsx
├── main.tsx
└── index.css
public/
├── icon.svg
└── icons/               # icon-192.png, icon-512.png, icon-maskable.png (generated)
scripts/
└── generate-icons.mjs
tests/
├── fixtures/
└── e2e/
```

---

## 11. Key Implementation Notes

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  base: '/pdf-flow/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PDFFlow',
        short_name: 'PDFFlow',
        description: "All your PDFs. None of our business.",
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/pdf-flow/',
        scope: '/pdf-flow/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        maximumFileSizeToCacheInBytes: 5_000_000
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['pdf-lib'],
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  }
})
```

### `services/pdfService.ts`

Every pdf-lib usage is dynamic-imported:

```ts
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer())
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach(p => merged.addPage(p))
  }
  return merged.save()
}
```

Same pattern for every other operation.

### `services/storageService.ts`

```ts
import Dexie, { type EntityTable } from 'dexie'

interface StoredFile { id?: number; filename: string; blob: Blob; createdAt: number }
interface StoredSignature { id?: number; dataUrl: string; createdAt: number }

const db = new Dexie('pdfflow') as Dexie & {
  files: EntityTable<StoredFile, 'id'>
  signatures: EntityTable<StoredSignature, 'id'>
}

db.version(1).stores({
  files: '++id, filename, createdAt',
  signatures: '++id, createdAt'
})

const sevenDays = 7 * 24 * 60 * 60 * 1000
db.files.where('createdAt').below(Date.now() - sevenDays).delete()

export { db }
```

### TrustStrip + Footer

Two shared components that appear across the app:
- `TrustStrip` — 4 cells with icon + label + subtext. Used on Home (full) and as a compact icons-only variant on Tool views and About.
- `Footer` — single line: `[lock] Audit code · [license] MIT · Built by Preyan Bhowmick · v1.0`. The author name is a link to `/about` (not GitHub — GitHub is the "Source" button in the header).

---

## 12. Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "icons": "node scripts/generate-icons.mjs",
    "deploy": "gh-pages -d dist",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

`gh-pages` and `sharp` as dev deps.

---

## 13. Testing

### Unit (Vitest)

Install: `vitest @vitest/ui @testing-library/react @testing-library/jest-dom fake-indexeddb jsdom`.

`vitest.config.ts` with `environment: 'jsdom'` and `setupFiles` that imports `fake-indexeddb/auto`.

Tests for every function in `services/pdfService.ts`:
- `mergePdfs` — output page count is the sum of inputs
- `extractPages` — output contains only selected pages
- `addWatermark` — text appears on every page (parse the output)
- `rotatePage` — rotation value is set correctly
- `storageService` — saves, retrieves, and 7-day auto-cleanup deletes old entries

### E2E (Playwright)

Install `@playwright/test`, then `npx playwright install`.

Generate small sample PDFs in `tests/fixtures/` via a setup script using pdf-lib.

One spec per tool. Standard flow:

```
1. Visit /
2. Click the tool
3. Upload sample PDF(s)
4. Configure (slider, text input, drawing, etc.)
5. Click the primary CTA
6. Wait for download event
7. Assert the downloaded blob is valid
```

Also write a spec for the About page: visit `/#/about`, verify Preyan's name + both links appear.

### Run

```bash
npm test                  # unit, once
npm test -- --watch
npm run test:e2e          # headless
npx playwright test --ui  # debugger
```

---

## 14. Deployment (GitHub Pages)

1. Create repo `pdf-flow` on GitHub (under the `preyan` account).
2. Push to `main`.
3. `npm run icons && npm run build && npm run deploy`.
4. Repo Settings → Pages → Source: `gh-pages` branch.
5. Lives at `https://preyan.github.io/pdf-flow/`.

Or set up `.github/workflows/deploy.yml` to run on every push to `main`.

---

## 15. Definition of Done

- [ ] `npm run dev` works with zero console errors and zero TS errors
- [ ] All 7 tools functional end-to-end
- [ ] About page renders with author info, both links, privacy table, "no stats" callout
- [ ] Lighthouse: Performance ≥ 90, PWA ≥ 90, Accessibility ≥ 90
- [ ] Bundle: initial JS < 200KB gzipped, pdf-lib and pdfjs-dist in separate lazy chunks
- [ ] Offline: DevTools → Network → Offline → refresh → app still works
- [ ] Installable as PWA (Chrome install prompt appears)
- [ ] Dark and light modes both polished
- [ ] Mobile responsive at 375px, touch targets ≥ 44px
- [ ] `prefers-reduced-motion` respected
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] **No external network requests at runtime.** Verify in DevTools Network — only same-origin requests should appear.
- [ ] Tagline appears in `<title>`, hero, and PWA manifest description
- [ ] Footer credits Preyan Bhowmick, links to `/about`
- [ ] Deployed to `https://preyan.github.io/pdf-flow/`

---

## 16. Build Order

1. **Scaffold.** `npm create vite@latest pdf-flow -- --template react-ts`. Install deps. Configure Vite 8 + `@tailwindcss/vite` + `vite-plugin-pwa`. Add path alias `@/*`. Install `react-router-dom` and set up `HashRouter`.
2. **shadcn init.** `npx shadcn@latest init` (dark default). Add: `button`, `dialog`, `slider`, `sonner`, `drawer`, `tabs`, `dropdown-menu`, `tooltip`.
3. **Logo + icons.** Create `src/components/Logo.tsx`. Save `public/icon.svg`. Write and run `scripts/generate-icons.mjs`.
4. **App shell.** `App.tsx` with router (`/`, `/tool/:name`, `/about`). Zustand store with `persist` for theme. `ThemeToggle`. Shared layout (header + main + footer with author credit). `index.css` with `@theme` tokens.
5. **Home page.** Hero with locked copy, `TrustStrip`, 7 tool cards + 1 dashed Drop card, footer. Match the layout sketch.
6. **About page.** Static content only. Hero, person card (avatar + bio + GitHub + portfolio links), privacy table, "no stats" callout, footer. No network calls.
7. **Services + unit tests.** `pdfService.ts` (one function per operation, all dynamic-imported) and `storageService.ts`. Vitest tests for each.
8. **Tools.** One at a time, in this order. Write the E2E test for each before moving to the next:
   - Merge → Split → Compress → Edit → Watermark → Sign → Convert
9. **Mobile pass.** Every tool at 375px with bottom drawer. Test via `vite --host` on a real phone.
10. **Polish.** Motion transitions between pages and tools. `useReducedMotion()` checks. PWA icons via `npm run icons`. Lighthouse audit.
11. **Deploy.** Push to GitHub (under `preyan` account), enable Pages, `npm run deploy`.

---
