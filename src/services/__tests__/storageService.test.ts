import { describe, it, expect, beforeEach } from 'vitest'
import {
  db,
  saveFile,
  listFiles,
  saveSignature,
  listSignatures,
  cleanupOldEntries,
} from '@/services/storageService'

beforeEach(async () => {
  await db.files.clear()
  await db.signatures.clear()
})

describe('storageService', () => {
  it('saves and lists a file', async () => {
    const id = await saveFile('hello.pdf', new Blob(['x'], { type: 'application/pdf' }))
    expect(id).toBeGreaterThan(0)
    const all = await listFiles()
    expect(all).toHaveLength(1)
    expect(all[0].filename).toBe('hello.pdf')
  })

  it('saves and lists a signature', async () => {
    await saveSignature('data:image/png;base64,abc')
    const sigs = await listSignatures()
    expect(sigs).toHaveLength(1)
    expect(sigs[0].dataUrl).toBe('data:image/png;base64,abc')
  })

  it('cleanupOldEntries deletes entries older than 7 days', async () => {
    const now = Date.now()
    const oldTs = now - 8 * 24 * 60 * 60 * 1000
    const recentTs = now - 1 * 24 * 60 * 60 * 1000

    await db.files.add({ filename: 'old.pdf', blob: new Blob(['x']), createdAt: oldTs })
    await db.files.add({ filename: 'recent.pdf', blob: new Blob(['x']), createdAt: recentTs })
    await db.signatures.add({ dataUrl: 'old', createdAt: oldTs })
    await db.signatures.add({ dataUrl: 'recent', createdAt: recentTs })

    const deleted = await cleanupOldEntries(now)
    expect(deleted).toBe(2)

    const files = await listFiles()
    const sigs = await listSignatures()
    expect(files.map((f) => f.filename)).toEqual(['recent.pdf'])
    expect(sigs.map((s) => s.dataUrl)).toEqual(['recent'])
  })
})
