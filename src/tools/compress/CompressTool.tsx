import { useState } from 'react'
import { Minimize2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Slider } from '@/components/ui/slider'
import { compressPdf } from '@/services/pdfService'
import { downloadBlob, firstNum, formatBytes } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(70)
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)

  // Heuristic estimate: aggressive quality drop maps to ~30% size reduction.
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

  const previewNode = !file ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to compress" />
  ) : (
    <div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-3">
        Preview · {preview?.pageCount ?? '…'} page{preview?.pageCount === 1 ? '' : 's'} total
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
          <Minimize2 size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Compress</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{file ? '1 file' : '0 files'}</span>
      </div>

      {file && (
        <>
          <FileCard file={file} pageCount={preview?.pageCount} onRemove={() => setFile(null)} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">Quality</label>
              <span className="text-[11px] tabular-nums">{quality}</span>
            </div>
            <Slider value={[quality]} min={0} max={100} step={1} onValueChange={(v) => setQuality(firstNum(v, quality))} />
          </div>

          <div className="rounded-md border border-border bg-card p-3 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">
              {formatBytes(file.size)} → ~{formatBytes(estimatedSize)}
            </span>
            <span className="text-success font-medium">−{savingsPct}%</span>
          </div>
        </>
      )}

      <div className="mt-auto">
        <PrimaryButton
          icon={<Download size={14} aria-hidden="true" />}
          disabled={busy || !file}
          onClick={handleCompress}
          data-testid="compress-cta"
        >
          {busy ? 'Compressing…' : 'Compress & download'}
        </PrimaryButton>
      </div>
    </>
  )

  return <Workspace icon={Minimize2} title="Compress" preview={previewNode} panel={panel} />
}
