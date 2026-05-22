import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  preview: ReactNode
  panel: ReactNode
}

export function Workspace({ icon: Icon, title, preview, panel }: Props) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)]">
      <div className="flex items-center justify-between px-6 sm:px-7 py-3 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 h-9 px-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Shield size={12} aria-hidden="true" />
          Processing in your browser
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-0">
        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-border overflow-auto">
          {preview}
        </div>
        <aside className="p-4 sm:p-5 flex flex-col gap-4 bg-card/40 overflow-auto">
          {panel}
        </aside>
      </div>
    </div>
  )
}
