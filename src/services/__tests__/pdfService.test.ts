import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import {
  mergePdfs,
  extractPages,
  rotatePage,
  applyEdits,
  addWatermark,
  getPageCount,
} from '@/services/pdfService'
import { makePdf } from './fixtures'

async function pageCount(bytes: Uint8Array): Promise<number> {
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const doc = await PDFDocument.load(buf)
  return doc.getPageCount()
}

async function pageRotation(bytes: Uint8Array, pageIndex: number): Promise<number> {
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const doc = await PDFDocument.load(buf)
  return doc.getPage(pageIndex).getRotation().angle
}

describe('pdfService', () => {
  it('getPageCount returns the correct count', async () => {
    const f = await makePdf(5, 'count')
    expect(await getPageCount(f)).toBe(5)
  })

  it('mergePdfs sums input page counts', async () => {
    const a = await makePdf(2, 'a')
    const b = await makePdf(3, 'b')
    const merged = await mergePdfs([a, b])
    expect(await pageCount(merged)).toBe(5)
  })

  it('extractPages returns only the selected pages', async () => {
    const src = await makePdf(6, 'src')
    const out = await extractPages(src, [1, 3, 5])
    expect(await pageCount(out)).toBe(3)
  })

  it('extractPages ignores out-of-range numbers', async () => {
    const src = await makePdf(3, 'small')
    const out = await extractPages(src, [1, 4, 99])
    expect(await pageCount(out)).toBe(1)
  })

  it('rotatePage rotates the correct page by the right amount', async () => {
    const src = await makePdf(2, 'rot')
    const out = await rotatePage(src, 1, 90)
    expect(await pageRotation(out, 1)).toBe(90)
    expect(await pageRotation(out, 0)).toBe(0)
  })

  it('applyEdits handles delete + rotate + reorder together', async () => {
    const src = await makePdf(4, 'edit')
    const out = await applyEdits(src, [
      { type: 'rotate', pageIndex: 0, degrees: 90 },
      { type: 'delete', pageIndex: 1 },
      { type: 'reorder', order: [3, 2, 1, 0] },
    ])
    // Original pages: 0,1,2,3 -> reordered to 3,2,1,0 -> delete 1 -> 3,2,0
    expect(await pageCount(out)).toBe(3)
  })

  it('addWatermark preserves page count and changes file contents', async () => {
    const src = await makePdf(2, 'wm')
    const srcBytes = new Uint8Array(await src.arrayBuffer())
    const out = await addWatermark(src, {
      text: 'CONFIDENTIAL',
      position: 'center',
      opacity: 40,
      size: 48,
      rotate45: true,
      firstPageOnly: false,
    })
    expect(await pageCount(out)).toBe(2)
    expect(out.byteLength).not.toBe(srcBytes.byteLength)
  })

  it('addWatermark firstPageOnly leaves later pages untouched', async () => {
    const src = await makePdf(3, 'wm1')
    const all = await addWatermark(src, {
      text: 'DRAFT_TOKEN',
      position: 'center',
      opacity: 50,
      size: 48,
      rotate45: false,
      firstPageOnly: false,
    })
    const one = await addWatermark(src, {
      text: 'DRAFT_TOKEN',
      position: 'center',
      opacity: 50,
      size: 48,
      rotate45: false,
      firstPageOnly: true,
    })
    // Watermarking all 3 pages should add more content than watermarking just 1.
    expect(all.byteLength).toBeGreaterThan(one.byteLength)
  })
})
