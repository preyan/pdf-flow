import { X, FileText } from 'lucide-react'
import { formatBytes } from '@/lib/fileUtils'

type Props = {
  file: File
  pageCount?: number
  swatchColor?: string
  onRemove?: () => void
}

export function FileCard({ file, pageCount, swatchColor, onRemove }: Props) {
  return (
    <div className="bg-card border border-border rounded-md p-3 flex items-start gap-2.5">
      <div
        className="grid place-items-center h-8 w-8 rounded-md shrink-0"
        style={{ backgroundColor: swatchColor ?? 'oklch(0.28 0.06 255)', color: 'white' }}
      >
        <FileText size={14} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium truncate" title={file.name}>{file.name}</div>
        <div className="text-[11px] text-muted-2 mt-0.5">
          {pageCount != null && <>{pageCount} page{pageCount === 1 ? '' : 's'} · </>}
          {formatBytes(file.size)}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="h-7 w-7 grid place-items-center rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
