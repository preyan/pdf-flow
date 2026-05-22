export const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

export type PdfValidation =
  | { ok: true; file: File }
  | { ok: false; reason: string }

export function validatePdf(file: File): PdfValidation {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return { ok: false, reason: `${file.name} is not a PDF` }
  if (file.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      reason: `${file.name} is ${formatBytes(file.size)} — max is 10 MB`,
    }
  }
  return { ok: true, file }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function downloadBlob(data: Uint8Array | Blob, filename: string, type = 'application/pdf'): void {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function parsePageRanges(input: string, totalPages: number): number[] {
  const result = new Set<number>()
  for (const part of input.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = Math.max(1, parseInt(range[1], 10))
      const end = Math.min(totalPages, parseInt(range[2], 10))
      for (let i = start; i <= end; i++) result.add(i)
    } else if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10)
      if (n >= 1 && n <= totalPages) result.add(n)
    }
  }
  return [...result].sort((a, b) => a - b)
}
