import { PDFDocument, StandardFonts } from 'pdf-lib'

export async function makePdf(pages = 1, label = 'page'): Promise<File> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([300, 400])
    page.drawText(`${label} ${i + 1}`, { x: 40, y: 350, size: 24, font })
  }
  const bytes = await doc.save()
  // Wrap the Uint8Array in a fresh ArrayBuffer to satisfy BlobPart typing
  // (Uint8Array<ArrayBufferLike> isn't directly assignable in some lib targets).
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  return new File([buf], `${label}.pdf`, { type: 'application/pdf' })
}
