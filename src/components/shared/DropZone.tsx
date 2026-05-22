import { useRef, useState, type DragEvent } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { validatePdf } from '@/lib/fileUtils'

type Props = {
  multiple?: boolean
  onFiles: (files: File[]) => void
  label?: string
}

export function DropZone({ multiple = false, onFiles, label = 'Drop a PDF here, or click to choose' }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function handleFiles(list: FileList | null) {
    if (!list) return
    const accepted: File[] = []
    for (const file of Array.from(list)) {
      const result = validatePdf(file)
      if (result.ok) accepted.push(result.file)
      else toast.error(result.reason)
    }
    if (accepted.length) onFiles(multiple ? accepted : [accepted[0]])
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') ref.current?.click() }}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={[
        'cursor-pointer rounded-xl border border-dashed transition-colors',
        'flex flex-col items-center justify-center gap-3 p-10 sm:p-14 text-center',
        over ? 'border-primary bg-accent' : 'border-border hover:border-primary/40 hover:bg-accent',
      ].join(' ')}
    >
      <Upload size={28} className="text-muted-foreground" aria-hidden="true" />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-1">PDF only · max 10 MB{multiple ? ' each' : ''}</div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="dropzone-input"
      />
    </div>
  )
}
