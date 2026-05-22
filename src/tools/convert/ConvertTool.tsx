import { useState } from 'react'
import { FileImage, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pdfToImages, zipBlobs } from '@/services/pdfService'
import { downloadBlob, firstNum } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

type Fmt = 'png' | 'jpg'

export default function ConvertTool() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<Fmt>('png')
  const [dpi, setDpi] = useState(150)
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)
  const pageCount = preview?.pageCount ?? 0

  async function handleConvert() {
    if (!file) return
    setBusy(true)
    try {
      const blobs = await pdfToImages(file, { format, dpi })
      const base = file.name.replace(/\.pdf$/i, '')
      if (blobs.length === 1) {
        downloadBlob(blobs[0], `${base}.${format}`, format === 'png' ? 'image/png' : 'image/jpeg')
        toast.success(`1 ${format.toUpperCase()} downloaded`)
      } else {
        const entries = blobs.map((blob, i) => ({
          name: `${base}-page-${String(i + 1).padStart(2, '0')}.${format}`,
          blob,
        }))
        const zip = await zipBlobs(entries)
        downloadBlob(zip, `${base}-${format}.zip`, 'application/zip')
        toast.success(`${blobs.length} images bundled as ZIP`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Convert failed')
    } finally {
      setBusy(false)
    }
  }

  const previewNode = !file ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to convert" />
  ) : (
    <div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-3">
        Preview · {pageCount || '…'} page{pageCount === 1 ? '' : 's'} total
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {preview?.thumbnails.map((src, i) => (
          <li key={i} className="rounded-md border border-border p-1.5">
            <img src={src} alt={`Page ${i + 1}`} className="w-full h-auto rounded-sm" />
            <div className="text-[11px] text-muted-foreground mt-1 text-center">{i + 1}</div>
          </li>
        ))}
      </ul>
    </div>
  )

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileImage size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Convert</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{file ? '1 file' : '0 files'}</span>
      </div>

      {file && (
        <>
          <FileCard file={file} pageCount={pageCount || undefined} onRemove={() => setFile(null)} />

          <div>
            <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-2">Format</div>
            <Tabs value={format} onValueChange={(v) => setFormat(v as Fmt)}>
              <TabsList className="w-full">
                <TabsTrigger value="png" className="flex-1">PNG</TabsTrigger>
                <TabsTrigger value="jpg" className="flex-1">JPG</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">DPI</label>
              <span className="text-[11px] tabular-nums">{dpi}</span>
            </div>
            <Slider value={[dpi]} min={72} max={300} step={1} onValueChange={(v) => setDpi(firstNum(v, dpi))} />
          </div>

          {pageCount > 1 && (
            <div className="text-[11px] text-muted-foreground">
              {pageCount} images bundled as ZIP
            </div>
          )}
        </>
      )}

      <div className="mt-auto">
        <PrimaryButton
          icon={<Download size={14} aria-hidden="true" />}
          disabled={busy || !file}
          onClick={handleConvert}
          data-testid="convert-cta"
        >
          {busy ? 'Converting…' : 'Convert & download'}
        </PrimaryButton>
      </div>
    </>
  )

  return <Workspace icon={FileImage} title="Convert" preview={previewNode} panel={panel} />
}
