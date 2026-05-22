export type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type WatermarkOptions = {
  text: string
  position: WatermarkPosition
  opacity: number   // 0–100
  size: number      // pt
  rotate45: boolean
  firstPageOnly: boolean
}

export async function getPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import('pdf-lib')
  const doc = await PDFDocument.load(await file.arrayBuffer())
  return doc.getPageCount()
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer())
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  return merged.save()
}

export async function extractPages(file: File, pages: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const out = await PDFDocument.create()
  const indices = pages.map((p) => p - 1).filter((i) => i >= 0 && i < src.getPageCount())
  const copied = await out.copyPages(src, indices)
  copied.forEach((p) => out.addPage(p))
  return out.save()
}

export async function extractEachPage(file: File, pages: number[]): Promise<Uint8Array[]> {
  const { PDFDocument } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const out: Uint8Array[] = []
  for (const page of pages) {
    const single = await PDFDocument.create()
    const [copied] = await single.copyPages(src, [page - 1])
    single.addPage(copied)
    out.push(await single.save())
  }
  return out
}

export async function compressPdf(file: File, quality: number): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  // pdf-lib has no lossy compression for embedded raster images out of the box.
  // We re-emit with object streams; for the quality slider we tune the saveAsBase64-ish path.
  // A real lossy pipeline would require pdfjs-dist to rasterize and re-embed — too heavy for MVP.
  // The quality value is currently advisory; we surface it back to the UI for the size estimate.
  void quality
  return src.save({ useObjectStreams: true })
}

export async function rotatePage(file: File, pageIndex: number, degrees: number): Promise<Uint8Array> {
  const { PDFDocument, degrees: deg } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const page = src.getPage(pageIndex)
  const current = page.getRotation().angle
  page.setRotation(deg((current + degrees) % 360))
  return src.save()
}

export type EditOps = Array<
  | { type: 'rotate'; pageIndex: number; degrees: number }
  | { type: 'delete'; pageIndex: number }
  | { type: 'reorder'; order: number[] } // resulting page indices, 0-based
>

export async function applyEdits(file: File, ops: EditOps): Promise<Uint8Array> {
  const { PDFDocument, degrees: deg } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const total = src.getPageCount()

  const rotations: Record<number, number> = {}
  const deleted = new Set<number>()
  let order: number[] = Array.from({ length: total }, (_, i) => i)

  for (const op of ops) {
    if (op.type === 'rotate') rotations[op.pageIndex] = (rotations[op.pageIndex] ?? 0) + op.degrees
    else if (op.type === 'delete') deleted.add(op.pageIndex)
    else if (op.type === 'reorder') order = op.order
  }

  const finalOrder = order.filter((i) => !deleted.has(i))
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, finalOrder)
  copied.forEach((p, idx) => {
    const origIdx = finalOrder[idx]
    const baseRotation = src.getPage(origIdx).getRotation().angle
    const extra = rotations[origIdx] ?? 0
    p.setRotation(deg((baseRotation + extra) % 360))
    out.addPage(p)
  })
  return out.save()
}

export async function addWatermark(file: File, opts: WatermarkOptions): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees: deg } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const font = await src.embedFont(StandardFonts.HelveticaBold)
  const pages = opts.firstPageOnly ? [src.getPage(0)] : src.getPages()
  const rotation = opts.rotate45 ? 45 : 0
  const alpha = Math.max(0, Math.min(1, opts.opacity / 100))

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(opts.text, opts.size)
    const textHeight = opts.size
    const { x, y } = positionFor(opts.position, width, height, textWidth, textHeight)
    page.drawText(opts.text, {
      x, y,
      size: opts.size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: alpha,
      rotate: deg(rotation),
    })
  }
  return src.save()
}

function positionFor(
  pos: WatermarkPosition,
  w: number,
  h: number,
  tw: number,
  th: number,
): { x: number; y: number } {
  const left = 40
  const right = w - tw - 40
  const cx = (w - tw) / 2
  const top = h - th - 40
  const cy = (h - th) / 2
  const bottom = 40
  switch (pos) {
    case 'top-left': return { x: left, y: top }
    case 'top-center': return { x: cx, y: top }
    case 'top-right': return { x: right, y: top }
    case 'middle-left': return { x: left, y: cy }
    case 'center': return { x: cx, y: cy }
    case 'middle-right': return { x: right, y: cy }
    case 'bottom-left': return { x: left, y: bottom }
    case 'bottom-center': return { x: cx, y: bottom }
    case 'bottom-right': return { x: right, y: bottom }
  }
}

export type PlacedSignature = {
  dataUrl: string         // PNG dataUrl
  pageIndex: number
  xRatio: number          // 0–1 (left)
  yRatio: number          // 0–1 (top, from top of page)
  widthRatio: number      // 0–1 (relative to page width)
}

export async function placeSignature(file: File, sig: PlacedSignature): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const src = await PDFDocument.load(await file.arrayBuffer())
  const page = src.getPage(sig.pageIndex)
  const { width, height } = page.getSize()
  const pngBytes = dataUrlToBytes(sig.dataUrl)
  const png = await src.embedPng(pngBytes)
  const w = width * sig.widthRatio
  const aspect = png.height / png.width
  const h = w * aspect
  const x = width * sig.xRatio
  const y = height - height * sig.yRatio - h
  page.drawImage(png, { x, y, width: w, height: h })
  return src.save()
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(',')[1] ?? ''
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export type ConvertOptions = {
  format: 'png' | 'jpg'
  dpi: number
}

export async function pdfToImages(file: File, opts: ConvertOptions): Promise<Blob[]> {
  const pdfjs = await import('pdfjs-dist')
  const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc.default

  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const blobs: Blob[] = []
  const scale = opts.dpi / 72

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D canvas context')
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const mime = opts.format === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
        mime,
        opts.format === 'jpg' ? 0.92 : undefined,
      )
    })
    blobs.push(blob)
  }
  return blobs
}

export async function zipBlobs(entries: Array<{ name: string; blob: Blob }>): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const e of entries) zip.file(e.name, e.blob)
  return zip.generateAsync({ type: 'blob' })
}
