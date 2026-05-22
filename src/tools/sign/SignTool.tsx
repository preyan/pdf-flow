import { useEffect, useRef, useState } from 'react'
import { Signature, Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { placeSignature } from '@/services/pdfService'
import { downloadBlob } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

type Mode = 'draw' | 'type'
type Target = { pageIndex: number; xRatio: number; yRatio: number }

export default function SignTool() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('draw')
  const [typedName, setTypedName] = useState('')
  const [target, setTarget] = useState<Target | null>(null)
  const [busy, setBusy] = useState(false)
  const padRef = useRef<HTMLCanvasElement | null>(null)
  const padInstance = useRef<{ clear: () => void; isEmpty: () => boolean; toDataURL: (t?: string) => string } | null>(null)
  const preview = usePdfPreview(file)
  const isEmpty = !file

  useEffect(() => {
    if (mode !== 'draw' || !padRef.current || isEmpty) return
    let alive = true
    void (async () => {
      const { default: SignaturePad } = await import('signature_pad')
      if (!alive || !padRef.current) return
      const inst = new SignaturePad(padRef.current, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(20,20,20)',
      })
      padInstance.current = inst
    })()
    return () => { alive = false; padInstance.current = null }
  }, [mode, file, isEmpty])

  function clearPad() {
    padInstance.current?.clear()
  }

  function makeTypedDataUrl(): string | null {
    if (!typedName.trim()) return null
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgb(20,20,20)'
    ctx.font = '60px "Brush Script MT", "Lucida Handwriting", cursive'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedName, 20, canvas.height / 2)
    return canvas.toDataURL('image/png')
  }

  function getSignatureDataUrl(): string | null {
    if (mode === 'draw') {
      if (!padInstance.current || padInstance.current.isEmpty()) return null
      return padInstance.current.toDataURL('image/png')
    }
    return makeTypedDataUrl()
  }

  async function handlePlace() {
    if (!file || !target) {
      toast.error(target ? 'Add your signature first' : 'Click a page to place the signature')
      return
    }
    const dataUrl = getSignatureDataUrl()
    if (!dataUrl) { toast.error('Provide a signature first'); return }
    setBusy(true)
    try {
      const bytes = await placeSignature(file, {
        dataUrl,
        pageIndex: target.pageIndex,
        xRatio: target.xRatio,
        yRatio: target.yRatio,
        widthRatio: 0.25,
      })
      const base = file.name.replace(/\.pdf$/i, '')
      downloadBlob(bytes, `${base}-signed.pdf`)
      toast.success('Signed PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign failed')
    } finally {
      setBusy(false)
    }
  }

  function handleThumbClick(e: React.MouseEvent<HTMLButtonElement>, pageIndex: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const yRatio = (e.clientY - rect.top) / rect.height
    setTarget({ pageIndex, xRatio: clamp01(xRatio), yRatio: clamp01(yRatio) })
  }

  const previewNode = isEmpty ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to sign" />
  ) : (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {preview?.thumbnails.map((src, i) => {
        const isTargetPage = target?.pageIndex === i
        return (
          <li key={i}>
            <button
              type="button"
              onClick={(e) => handleThumbClick(e, i)}
              className="group w-full rounded-md border border-border p-1.5 relative hover:border-primary/40 transition-colors cursor-crosshair"
            >
              <img src={src} alt={`Page ${i + 1}`} className="w-full h-auto rounded-sm pointer-events-none" />
              {isTargetPage && target && (
                <span
                  className="absolute h-10 w-20 border-[1.5px] border-dashed border-primary rounded bg-primary/10 pointer-events-none"
                  style={{
                    left: `${target.xRatio * 100}%`,
                    top: `${target.yRatio * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
              <div className="text-[11px] text-muted-2 mt-1 text-center">{i + 1}</div>
            </button>
          </li>
        )
      })}
    </ul>
  )

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Signature size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Sign</span>
        </div>
        <span className="text-[11px] text-muted-2">{file ? '1 file' : '0 files'}</span>
      </div>

      <Eyebrow>File</Eyebrow>
      {file ? (
        <FileCard file={file} pageCount={preview?.pageCount} onRemove={() => { setFile(null); setTarget(null) }} />
      ) : (
        <div className="rounded-md border border-dashed border-border p-3 text-[11px] text-muted-2">No file selected</div>
      )}

      <Eyebrow>Your signature</Eyebrow>
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" className="flex-1" disabled={isEmpty}>Draw</TabsTrigger>
          <TabsTrigger value="type" className="flex-1" disabled={isEmpty}>Type</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'draw' ? (
        <div className="relative">
          <canvas
            ref={padRef}
            width={320}
            height={120}
            className={[
              'w-full h-[120px] rounded-md border border-border bg-white touch-none',
              isEmpty ? 'opacity-50 pointer-events-none' : '',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={clearPad}
            disabled={isEmpty}
            aria-label="Clear signature"
            className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-md bg-card border border-border hover:bg-surface-hover disabled:opacity-50"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Your name"
            disabled={isEmpty}
            className="w-full h-9 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50"
          />
          {typedName && !isEmpty && (
            <div
              className="h-14 rounded-md border border-border bg-white grid place-items-center text-2xl"
              style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive', color: '#141414' }}
            >
              {typedName}
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-muted-2">
        {isEmpty
          ? 'Load a PDF, then click a page to place'
          : target
            ? `Placed on page ${target.pageIndex + 1}`
            : 'Click a page to place the signature'}
      </div>

      <div className="mt-auto pt-2">
        <PrimaryButton
          icon={<Check size={14} aria-hidden="true" />}
          disabled={busy || isEmpty || !target}
          onClick={handlePlace}
          data-testid="sign-cta"
        >
          {busy ? 'Placing…' : 'Place signature'}
        </PrimaryButton>
        <div className="text-[11px] text-muted-2 mt-2 text-center">🔒 Stored on device</div>
      </div>
    </>
  )

  return (
    <Workspace
      icon={Signature}
      title="Sign"
      previewEyebrow={isEmpty ? 'Preview · drop a file to begin' : 'Preview · click a page to place'}
      preview={previewNode}
      panel={panel}
    />
  )
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}
