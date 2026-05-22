import { useEffect, useMemo, useState } from 'react'
import {
  PencilLine, ArrowLeft,
  RotateCcw, RotateCw, Trash2, Undo2, Redo2, Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DropZone } from '@/components/shared/DropZone'
import { StatusPill } from '@/components/shared/StatusPill'
import { TrustStrip } from '@/components/shared/TrustStrip'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { applyEdits, type EditOps } from '@/services/pdfService'
import { downloadBlob } from '@/lib/fileUtils'
import { usePdfPreview } from '@/hooks/usePdfPreview'

type PageState = {
  origIndex: number       // original 0-based index
  rotation: number        // accumulated extra rotation, multiples of 90
  deleted: boolean
}

export default function EditTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageState[]>([])
  const [history, setHistory] = useState<PageState[][]>([])
  const [future, setFuture] = useState<PageState[][]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const preview = usePdfPreview(file)

  useEffect(() => {
    if (preview) {
      setPages(
        Array.from({ length: preview.pageCount }, (_, i) => ({ origIndex: i, rotation: 0, deleted: false })),
      )
      setHistory([])
      setFuture([])
      setSelected(null)
    }
  }, [preview])

  const visible = useMemo(() => pages.filter((p) => !p.deleted), [pages])
  const changes = useMemo(
    () => pages.filter((p) => p.deleted || p.rotation !== 0).length,
    [pages],
  )

  function commit(next: PageState[]) {
    setHistory((h) => [...h, pages])
    setFuture([])
    setPages(next)
  }

  function rotateSel(deg: number) {
    if (selected == null) return
    const i = pages.findIndex((_, idx) => idx === selected)
    if (i < 0) return
    const next = [...pages]
    next[i] = { ...next[i], rotation: (next[i].rotation + deg + 360) % 360 }
    commit(next)
  }

  function deleteSel() {
    if (selected == null) return
    const next = pages.map((p, idx) => (idx === selected ? { ...p, deleted: true } : p))
    commit(next)
    setSelected(null)
  }

  function undo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setFuture((f) => [pages, ...f])
    setPages(prev)
  }

  function redo() {
    if (future.length === 0) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setHistory((h) => [...h, pages])
    setPages(next)
  }

  async function save() {
    if (!file) return
    setBusy(true)
    try {
      const ops: EditOps = []
      pages.forEach((p) => {
        if (p.rotation !== 0) ops.push({ type: 'rotate', pageIndex: p.origIndex, degrees: p.rotation })
        if (p.deleted) ops.push({ type: 'delete', pageIndex: p.origIndex })
      })
      const order = visible.map((p) => p.origIndex)
      const originalOrder = visible
        .map((p) => p.origIndex)
        .sort((a, b) => a - b)
      const isReordered = order.some((v, i) => v !== originalOrder[i])
      if (isReordered) ops.push({ type: 'reorder', order })
      const bytes = await applyEdits(file, ops)
      const base = file.name.replace(/\.pdf$/i, '')
      downloadBlob(bytes, `${base}-edited.pdf`)
      toast.success('Edited PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (!file) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-7.5rem)]">
        <div className="flex items-center justify-between px-7 h-12 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 h-9 px-2 -ml-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <PencilLine size={14} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">Edit pages</span>
            </div>
          </div>
          <div className="hidden sm:block"><StatusPill /></div>
        </div>
        <div className="flex-1 grid place-items-center px-7 py-10">
          <DropZone onFiles={(fs) => setFile(fs[0])} label="Drop a PDF to edit" />
        </div>
        <div className="px-7 h-10 border-t border-border flex items-center">
          <TrustStrip compact />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7.5rem)]">
      <div className="flex items-center justify-between px-7 h-12 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 h-9 px-2 -ml-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <PencilLine size={14} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">Edit pages</span>
            <span className="text-[11px] text-muted-2 hidden sm:inline truncate max-w-[200px]">{file.name}</span>
          </div>
        </div>
        <div className="hidden sm:block"><StatusPill /></div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-2 border-b border-border bg-surface">
        <ToolbarButton onClick={() => rotateSel(-90)} disabled={selected == null} icon={<RotateCcw size={14} />} label="Rotate left" />
        <ToolbarButton onClick={() => rotateSel(90)}  disabled={selected == null} icon={<RotateCw size={14} />}  label="Rotate right" />
        <ToolbarButton onClick={deleteSel}            disabled={selected == null} icon={<Trash2 size={14} />}    label="Delete" />
        <div className="h-5 w-px bg-border mx-1" />
        <ToolbarButton onClick={undo} disabled={history.length === 0} icon={<Undo2 size={14} />} label="Undo" />
        <ToolbarButton onClick={redo} disabled={future.length === 0}  icon={<Redo2 size={14} />} label="Redo" />
        <div className="ml-auto text-[11px] text-muted-2">
          {selected != null ? '1 selected · ' : ''}{visible.length} page{visible.length === 1 ? '' : 's'} total
        </div>
      </div>

      <div className="flex-1 px-7 py-4 overflow-auto">
        <Eyebrow className="mb-3">Pages · drag handle to reorder · click to select</Eyebrow>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {pages.map((p, idx) => {
            if (p.deleted) return null
            const isSelected = selected === idx
            const thumb = preview?.thumbnails[p.origIndex]
            return (
              <li key={`${p.origIndex}-${idx}`}>
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : idx)}
                  className={[
                    'group w-full rounded-md p-1.5 transition-colors relative',
                    'border-[1.5px]',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  {thumb && (
                    <img
                      src={thumb}
                      alt={`Page ${p.origIndex + 1}`}
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                      className="w-full h-auto rounded-sm transition-transform"
                    />
                  )}
                  {p.rotation !== 0 && (
                    <span className="absolute top-2 right-2 text-[10px] bg-primary text-primary-foreground rounded px-1.5 py-0.5">
                      {p.rotation === 180 ? '180°' : `${p.rotation > 180 ? p.rotation - 360 : p.rotation}°`}
                    </span>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-1 text-center">{p.origIndex + 1}</div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3 px-7 py-3 border-t border-border bg-surface">
        <div className="text-[11px] text-muted-2">
          {changes === 0 ? 'No changes' : `Changes: ${changes} · unsaved`}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy || visible.length === 0}
          data-testid="edit-cta"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-40"
        >
          <Download size={14} aria-hidden="true" />
          {busy ? 'Saving…' : 'Save & download'}
        </button>
      </div>

      <div className="px-7 h-10 border-t border-border flex items-center">
        <TrustStrip compact />
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, disabled, icon, label }: {
  onClick: () => void
  disabled: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
