import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { PDFDocument } from 'pdf-lib'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, '../fixtures')

test('merge: combines two PDFs and downloads result', async ({ page }) => {
  await page.goto('/pdf-flow/#/tool/merge')

  const input = page.getByTestId('dropzone-input')
  await input.setInputFiles([resolve(FIXTURES, 'a.pdf'), resolve(FIXTURES, 'b.pdf')])

  await expect(page.getByText('2 files', { exact: false })).toBeVisible()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('merge-cta').click(),
  ])

  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const path = await download.path()
  expect(path).toBeTruthy()

  if (path) {
    const fs = await import('node:fs/promises')
    const buf = await fs.readFile(path)
    const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const doc = await PDFDocument.load(arrayBuf)
    expect(doc.getPageCount()).toBe(5)
  }
})
