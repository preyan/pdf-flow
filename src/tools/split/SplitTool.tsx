import { useMemo, useState } from 'react'
import { Scissors, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { extractEachPage, extractPages } from '@/services/pdfService'
import { downloadBlob, parsePageRanges } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

type Mode = 'range' | 'pick'
type OutputMode = 'one' | 'separate'

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('range')
  const [output, setOutput] = useState<OutputMode>('one')
  const [rangeInput, setRangeInput] = useState('')
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)

  const pageCount = preview?.pageCount ?? 0
  const selectedPages = useMemo<number[]>(() => {
    if (mode === 'range') return parsePageRanges(rangeInput, pageCount)
    return [...picked].sort((a, b) => a - b)
  }, [mode, rangeInput, picked, pageCount])

  function togglePick(page: number) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(page)) next.delete(page)
      else next.add(page)
      return next
    })
  }

  async function handleSplit() {
    if (!file) return
    if (selectedPages.length === 0) {
      toast.error('Select at least one page')
      return
    }
    setBusy(true)
    try {
      const base = file.name.replace(/\.pdf$/i, '')
      if (output === 'one') {
        const bytes = await extractPages(file, selectedPages)
        downloadBlob(bytes, `${base}-split.pdf`)
        toast.success('Split PDF downloaded')
      } else {
        const all = await extractEachPage(file, selectedPages)
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        all.forEach((bytes, i) => {
          const arr = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
          zip.file(`${base}-page-${selectedPages[i]}.pdf`, arr)
        })
        const blob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(blob, `${base}-pages.zip`, 'application/zip')
        toast.success(`${all.length} PDFs downloaded as ZIP`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Split failed')
    } finally {
      setBusy(false)
    }
  }

  const previewNode = !file ? (
    <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to split" />
  ) : (
    <div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-3">
        Preview · {pageCount || '…'} page{pageCount === 1 ? '' : 's'} total
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {preview?.thumbnails.map((src, i) => {
          const page = i + 1
          const selected = mode === 'pick'
            ? picked.has(page)
            : selectedPages.includes(page)
          return (
            <li key={page}>
              <button
                type="button"
                onClick={() => mode === 'pick' && togglePick(page)}
                disabled={mode !== 'pick'}
                className={[
                  'group w-full rounded-md border p-1.5 transition-colors',
                  selected ? 'border-primary bg-primary/5' : 'border-border',
                  mode === 'pick' ? 'cursor-pointer hover:border-primary/40' : 'cursor-default',
                ].join(' ')}
              >
                <img src={src} alt={`Page ${page}`} className="w-full h-auto rounded-sm" />
                <div className="text-[11px] text-muted-foreground mt-1 text-center">{page}</div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Split</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{file ? '1 file' : '0 files'}</span>
      </div>

      {file && (
        <>
          <FileCard file={file} pageCount={pageCount || undefined} onRemove={() => { setFile(null); setPicked(new Set()); setRangeInput('') }} />

          <div>
            <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-2">Mode</div>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList className="w-full">
                <TabsTrigger value="range" className="flex-1">Range</TabsTrigger>
                <TabsTrigger value="pick" className="flex-1">Pick pages</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mode === 'range' ? (
            <div className="space-y-1.5">
              <label htmlFor="range-input" className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                Pages
              </label>
              <input
                id="range-input"
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="1-3, 7, 10-12"
                className="w-full h-10 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary"
              />
              <div className="text-[11px] text-muted-foreground">
                {selectedPages.length} page{selectedPages.length === 1 ? '' : 's'} selected
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground">
              {selectedPages.length} page{selectedPages.length === 1 ? '' : 's'} selected · click thumbnails
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mb-2">Output</div>
            <Tabs value={output} onValueChange={(v) => setOutput(v as OutputMode)}>
              <TabsList className="w-full">
                <TabsTrigger value="one" className="flex-1">One PDF</TabsTrigger>
                <TabsTrigger value="separate" className="flex-1">Separate</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </>
      )}

      <div className="mt-auto">
        <PrimaryButton
          icon={<Download size={14} aria-hidden="true" />}
          disabled={busy || !file || selectedPages.length === 0}
          onClick={handleSplit}
          data-testid="split-cta"
        >
          {busy ? 'Extracting…' : 'Extract pages'}
        </PrimaryButton>
      </div>
    </>
  )

  return <Workspace icon={Scissors} title="Split" preview={previewNode} panel={panel} />
}
