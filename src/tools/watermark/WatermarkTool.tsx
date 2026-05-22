import { useState } from 'react'
import { Stamp, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addWatermark, type WatermarkPosition } from '@/services/pdfService'
import { downloadBlob, firstNum } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

const POSITIONS: WatermarkPosition[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [position, setPosition] = useState<WatermarkPosition>('center')
  const [opacity, setOpacity] = useState(40)
  const [size, setSize] = useState(48)
  const [rotate45, setRotate45] = useState(false)
  const [firstPageOnly, setFirstPageOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)

  async function handleApply() {
    if (!file) return
    if (!text.trim()) {
      toast.error('Enter watermark text')
      return
    }
    setBusy(true)
    try {
      const bytes = await addWatermark(file, { text, position, opacity, size, rotate45, firstPageOnly })
      const base = file.name.replace(/\.pdf$/i, '')
      downloadBlob(bytes, `${base}-watermarked.pdf`)
      toast.success('Watermarked PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Watermark failed')
    } finally {
      setBusy(false)
    }
  }

  const previewNode = !file ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to watermark" />
  ) : (
    <div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-3">
        Preview · {preview?.pageCount ?? '…'} page{preview?.pageCount === 1 ? '' : 's'} total
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {preview?.thumbnails.map((src, i) => (
          <li key={i} className="rounded-md border border-border p-1.5 relative overflow-hidden">
            <img src={src} alt={`Page ${i + 1}`} className="w-full h-auto rounded-sm" />
            {(!firstPageOnly || i === 0) && (
              <span
                className="absolute pointer-events-none font-semibold text-primary"
                style={{
                  ...positionStyle(position),
                  opacity: opacity / 100,
                  transform: `${positionTransform(position)} rotate(${rotate45 ? -45 : 0}deg)`,
                  fontSize: `${size * 0.18}px`,
                }}
              >
                {text}
              </span>
            )}
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
          <Stamp size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Watermark</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{file ? '1 file' : '0 files'}</span>
      </div>

      {file && (
        <>
          <FileCard file={file} pageCount={preview?.pageCount} onRemove={() => setFile(null)} />

          <div className="space-y-1.5">
            <label htmlFor="wm-text" className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              Text
            </label>
            <input
              id="wm-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CONFIDENTIAL"
              className="w-full h-10 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">Position</div>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-card p-2 w-fit">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  aria-label={p}
                  className={[
                    'h-8 w-8 rounded grid place-items-center',
                    p === position ? 'bg-primary' : 'hover:bg-accent',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'block h-1.5 w-1.5 rounded-full',
                      p === position ? 'bg-primary-foreground' : 'bg-muted-foreground',
                    ].join(' ')}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">Opacity</label>
              <span className="text-[11px] tabular-nums">{opacity}</span>
            </div>
            <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={(v) => setOpacity(firstNum(v, opacity))} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">Size (pt)</label>
              <span className="text-[11px] tabular-nums">{size}</span>
            </div>
            <Slider value={[size]} min={12} max={96} step={1} onValueChange={(v) => setSize(firstNum(v, size))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-1.5">Rotation</div>
              <Tabs value={rotate45 ? '45' : '0'} onValueChange={(v) => setRotate45(v === '45')}>
                <TabsList className="w-full">
                  <TabsTrigger value="0" className="flex-1">0°</TabsTrigger>
                  <TabsTrigger value="45" className="flex-1">45°</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-1.5">Apply</div>
              <Tabs value={firstPageOnly ? 'first' : 'all'} onValueChange={(v) => setFirstPageOnly(v === 'first')}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="first" className="flex-1">First</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </>
      )}

      <div className="mt-auto">
        <PrimaryButton
          icon={<Check size={14} aria-hidden="true" />}
          disabled={busy || !file}
          onClick={handleApply}
          data-testid="watermark-cta"
        >
          {busy ? 'Applying…' : 'Apply watermark'}
        </PrimaryButton>
      </div>
    </>
  )

  return <Workspace icon={Stamp} title="Watermark" preview={previewNode} panel={panel} />
}

function positionStyle(p: WatermarkPosition): React.CSSProperties {
  const [v, h] = p.split('-')
  const style: React.CSSProperties = {}
  if (v === 'top') style.top = '8%'
  if (v === 'middle' || p === 'center') style.top = '50%'
  if (v === 'bottom') style.bottom = '8%'
  if (h === 'left') style.left = '8%'
  if (h === 'center' || p === 'center') style.left = '50%'
  if (h === 'right') style.right = '8%'
  return style
}

function positionTransform(p: WatermarkPosition): string {
  const [v, h] = p.split('-')
  let tx = '0'
  let ty = '0'
  if (h === 'center' || p === 'center') tx = '-50%'
  if (v === 'middle' || p === 'center') ty = '-50%'
  return `translate(${tx}, ${ty})`
}
