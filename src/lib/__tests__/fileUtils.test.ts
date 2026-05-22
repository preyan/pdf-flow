import { describe, it, expect } from 'vitest'
import { validatePdf, formatBytes, parsePageRanges, MAX_PDF_BYTES } from '@/lib/fileUtils'

function file(size: number, name = 'a.pdf', type = 'application/pdf'): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('fileUtils', () => {
  it('validatePdf accepts a small pdf', () => {
    const result = validatePdf(file(1024))
    expect(result.ok).toBe(true)
  })

  it('validatePdf rejects non-pdf', () => {
    const result = validatePdf(file(1024, 'a.txt', 'text/plain'))
    expect(result.ok).toBe(false)
  })

  it('validatePdf rejects files over 10 MB', () => {
    const result = validatePdf(file(MAX_PDF_BYTES + 1))
    expect(result.ok).toBe(false)
  })

  it('formatBytes formats common sizes', () => {
    expect(formatBytes(800)).toBe('800 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
  })

  it('parsePageRanges parses comma + range mix and clamps', () => {
    expect(parsePageRanges('1-3, 7, 10-12', 12)).toEqual([1, 2, 3, 7, 10, 11, 12])
    expect(parsePageRanges('1-99', 5)).toEqual([1, 2, 3, 4, 5])
    expect(parsePageRanges('  ', 5)).toEqual([])
    expect(parsePageRanges('3,3,3', 5)).toEqual([3])
  })
})
