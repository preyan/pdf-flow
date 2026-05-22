import { useState } from 'react'
import { Minimize2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { Slider } from '@/components/ui/slider'
import { compressPdf } from '@/services/pdfService'
import { downloadBlob, firstNum, formatBytes } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(70)
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)
  const isEmpty = !file

  const estimatedSize = file ? Math.round(file.size * (0.5 + (quality / 100) * 0.5)) : 0
  const savingsPct = file && file.size > 0 ? Math.round((1 - estimatedSize / file.size) * 100) : 0

  async function handleCompress() {
    if (!file) return
    setBusy(true)
    try {
      const bytes = await compressPdf(file, quality)
      const base = file.name.replace(/\.pdf$/i, '')
      downloadBlob(bytes, `${base}-compressed.pdf`)
      toast.success('Compressed PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Compress failed')
    } finally {
      setBusy(false)
    }
  }

  const previewNode = isEmpty ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to compress" />
  ) : (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {preview?.thumbnails.map((src, i) => (
        <li key={i} className="rounded-md border border-border p-1.5">
          <img src={src} alt={`Page ${i + 1}`} className="w-full h-auto rounded-sm" />
          <div className="text-[11px] text-muted-2 mt-1 text-center">{i + 1}</div>
        </li>
      ))}
    </ul>
  )

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Minimize2 size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Compress</span>
        </div>
        <span className="text-[11px] text-muted-2">{file ? '1 file' : '0 files'}</span>
      </div>

      <Eyebrow>File</Eyebrow>
      {file ? (
        <FileCard file={file} pageCount={preview?.pageCount} onRemove={() => setFile(null)} />
      ) : (
        <div className="rounded-md border border-dashed border-border p-3 text-[11px] text-muted-2">No file selected</div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Eyebrow>Quality</Eyebrow>
          <span className="text-[11px] tabular-nums">{quality}</span>
        </div>
        <Slider value={[quality]} min={0} max={100} step={1} disabled={isEmpty} onValueChange={(v) => setQuality(firstNum(v, quality))} />
      </div>

      <div className="rounded-md border border-border bg-card p-3 text-sm flex items-center justify-between">
        <span className="text-muted-2">
          {file ? `${formatBytes(file.size)} → ~${formatBytes(estimatedSize)}` : 'Load a PDF for estimate'}
        </span>
        {file && <span className="text-success font-medium">−{savingsPct}%</span>}
      </div>

      <div className="mt-auto pt-2">
        <PrimaryButton
          icon={<Download size={14} aria-hidden="true" />}
          disabled={busy || isEmpty}
          onClick={handleCompress}
          data-testid="compress-cta"
        >
          {busy ? 'Compressing…' : 'Compress & download'}
        </PrimaryButton>
      </div>
    </>
  )

  return (
    <Workspace
      icon={Minimize2}
      title="Compress"
      previewEyebrow={isEmpty ? 'Preview · drop a file to begin' : `Preview · ${preview?.pageCount ?? '…'} page${preview?.pageCount === 1 ? '' : 's'} total`}
      preview={previewNode}
      panel={panel}
    />
  )
}
