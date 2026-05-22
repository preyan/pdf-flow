import { PDFDocument, StandardFonts } from 'pdf-lib'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

async function makePdf(pages, label) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 500])
    page.drawText(`${label} page ${i + 1}`, { x: 40, y: 440, size: 22, font })
  }
  return doc.save()
}

await mkdir(here, { recursive: true })

await writeFile(resolve(here, 'a.pdf'),     await makePdf(2, 'Alpha'))
await writeFile(resolve(here, 'b.pdf'),     await makePdf(3, 'Bravo'))
await writeFile(resolve(here, 'six.pdf'),   await makePdf(6, 'Six'))
await writeFile(resolve(here, 'three.pdf'), await makePdf(3, 'Three'))

console.log('Generated tests/fixtures/*.pdf')
