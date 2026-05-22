import { useEffect, useState } from 'react'

export type ThumbnailSet = {
  thumbnails: string[]
  pageCount: number
}

export function usePdfPreview(file: File | null, scale = 0.4): ThumbnailSet | null {
  const [result, setResult] = useState<ThumbnailSet | null>(null)

  useEffect(() => {
    if (!file) {
      setResult(null)
      return
    }
    let cancelled = false

    void (async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc.default
        const buf = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: buf }).promise
        const thumbnails: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          await page.render({ canvasContext: ctx, viewport, canvas }).promise
          thumbnails.push(canvas.toDataURL('image/png'))
        }
        if (!cancelled) setResult({ thumbnails, pageCount: pdf.numPages })
      } catch {
        if (!cancelled) setResult(null)
      }
    })()

    return () => { cancelled = true }
  }, [file, scale])

  return result
}
