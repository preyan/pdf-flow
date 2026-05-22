import { useState } from 'react'
import { Combine, Download, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Workspace } from '@/components/shared/Workspace'
import { DropZone } from '@/components/shared/DropZone'
import { FileCard } from '@/components/shared/FileCard'
import { PrimaryButton } from '@/components/shared/PrimaryButton'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { mergePdfs } from '@/services/pdfService'
import { downloadBlob, formatBytes, validatePdf } from '@/lib/fileUtils'

const SWATCHES = [
  'oklch(0.65 0.17 255)',
  'oklch(0.65 0.15 145)',
  'oklch(0.75 0.16 75)',
  'oklch(0.7 0.2 320)',
]

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)

  function addFiles(next: File[]) {
    setFiles((prev) => [...prev, ...next])
  }

  function removeAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function pickMore() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf,.pdf'
    input.multiple = true
    input.onchange = () => {
      if (!input.files) return
      const accepted: File[] = []
      for (const f of Array.from(input.files)) {
        const r = validatePdf(f)
        if (r.ok) accepted.push(r.file)
        else toast.error(r.reason)
      }
      if (accepted.length) addFiles(accepted)
    }
    input.click()
  }

  async function handleMerge() {
    if (files.length < 2) {
      toast.error('Add at least two PDFs to merge')
      return
    }
    setBusy(true)
    try {
      const bytes = await mergePdfs(files)
      downloadBlob(bytes, 'merged.pdf')
      toast.success('Merged PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Merge failed')
    } finally {
      setBusy(false)
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const isEmpty = files.length === 0

  const preview = isEmpty ? (
    <DropZone multiple onFiles={addFiles} label="Drop PDFs to merge" />
  ) : (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="bg-card border border-border rounded-lg p-3 flex flex-col items-center gap-2"
        >
          <div
            className="h-24 w-full rounded-md grid place-items-center text-xs font-medium"
            style={{ backgroundColor: SWATCHES[i % SWATCHES.length], color: 'white' }}
          >
            #{i + 1}
          </div>
          <div className="text-[11px] text-center truncate w-full" title={file.name}>{file.name}</div>
        </li>
      ))}
    </ul>
  )

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Combine size={14} className="text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Merge</span>
        </div>
        <span className="text-[11px] text-muted-2">{files.length} file{files.length === 1 ? '' : 's'}</span>
      </div>

      <Eyebrow>Files</Eyebrow>

      <ul className="flex flex-col gap-2">
        {files.map((file, i) => (
          <li key={`${file.name}-${i}-card`}>
            <FileCard file={file} swatchColor={SWATCHES[i % SWATCHES.length]} onRemove={() => removeAt(i)} />
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={pickMore}
            className="w-full h-10 rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-surface-hover inline-flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={12} aria-hidden="true" />
            Add file
          </button>
        </li>
      </ul>

      <div className="text-[11px] text-muted-2 border-t border-divider pt-2.5">
        {isEmpty ? 'Total: 0 B' : `Total: ${formatBytes(totalSize)}`}
      </div>

      <div className="mt-auto pt-2">
        <PrimaryButton
          icon={<Download size={14} aria-hidden="true" />}
          disabled={busy || files.length < 2}
          onClick={handleMerge}
          data-testid="merge-cta"
        >
          {busy ? 'Merging…' : 'Merge & download'}
        </PrimaryButton>
      </div>
    </>
  )

  return (
    <Workspace
      icon={Combine}
      title="Merge"
      previewEyebrow={isEmpty ? 'Preview · drop files to begin' : `Preview · ${files.length} file${files.length === 1 ? '' : 's'}`}
      preview={preview}
      panel={panel}
    />
  )
}
