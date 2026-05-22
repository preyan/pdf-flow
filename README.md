# PDFFlow

> All your PDFs. None of our business.

Privacy-first PDF tools that run entirely in the browser. No upload, no
tracking, no account. Every file you open is processed inside your browser.
No servers, nothing to leak, lose, or hand over.

Live: https://preyan.github.io/pdf-flow/

## Features

- **Merge** — combine multiple PDFs into one
- **Split** — extract selected pages into a new PDF or separate files
- **Compress** — reduce file size
- **Edit** — rotate, delete, reorder pages (undo/redo)
- **Watermark** — add text watermark with position, opacity, size, rotation
- **Sign** — hand-drawn (signature_pad) or typed signature, click to place
- **Convert** — PDF → PNG/JPG (single image or ZIP for multi-page)

All processing is local. No analytics, no cookies (except theme), no external
runtime requests.

## Screenshots

_(add screenshots here)_

## Install & run

Requirements: Node 22+.

```bash
npm install
npm run icons          # generate PWA PNG icons from public/icon.svg
npm run dev            # http://127.0.0.1:5173
```

## Build & deploy

```bash
npm run build          # produces dist/
npm run preview        # serve dist/ at http://127.0.0.1:4173
npm run deploy         # publish dist/ to gh-pages branch
```

GitHub Actions publishes on every push to `main` —
see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Test

```bash
npm test               # vitest, jsdom, fake-indexeddb
npm run test:e2e       # playwright (chromium)
```

## Tech stack

Vite 8 (Rolldown) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
(Base UI) · Motion · React Router v7 (HashRouter) · Zustand · Dexie · pdf-lib
· pdfjs-dist · signature_pad · jszip · vite-plugin-pwa · lucide-react.

## Privacy

| | |
|---|---|
| Files          | Never leave your browser |
| Logs           | None, no servers |
| Cookies        | Zero. localStorage for theme |
| Analytics      | None at all |
| External req.  | Zero at runtime. Check DevTools. |
| Data retention | 7 days in your own IndexedDB |

## License

MIT — see [LICENSE](LICENSE).

## Author

Built and maintained by **Preyan Bhowmick** —
[github.com/preyan](https://github.com/preyan) ·
[preyan.github.io](https://preyan.github.io/)
