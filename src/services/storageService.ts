import Dexie, { type EntityTable } from 'dexie'

export interface StoredFile {
  id?: number
  filename: string
  blob: Blob
  createdAt: number
}

export interface StoredSignature {
  id?: number
  dataUrl: string
  createdAt: number
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

class PdfFlowDb extends Dexie {
  files!: EntityTable<StoredFile, 'id'>
  signatures!: EntityTable<StoredSignature, 'id'>

  constructor() {
    super('pdfflow')
    this.version(1).stores({
      files: '++id, filename, createdAt',
      signatures: '++id, createdAt',
    })
  }
}

export const db = new PdfFlowDb()

export async function saveFile(filename: string, blob: Blob): Promise<number> {
  const id = await db.files.add({ filename, blob, createdAt: Date.now() })
  return id as number
}

export async function listFiles(): Promise<StoredFile[]> {
  return db.files.orderBy('createdAt').reverse().toArray()
}

export async function saveSignature(dataUrl: string): Promise<number> {
  const id = await db.signatures.add({ dataUrl, createdAt: Date.now() })
  return id as number
}

export async function listSignatures(): Promise<StoredSignature[]> {
  return db.signatures.orderBy('createdAt').reverse().toArray()
}

export async function cleanupOldEntries(now: number = Date.now()): Promise<number> {
  const cutoff = now - SEVEN_DAYS_MS
  const filesDeleted = await db.files.where('createdAt').below(cutoff).delete()
  const sigsDeleted = await db.signatures.where('createdAt').below(cutoff).delete()
  return filesDeleted + sigsDeleted
}
