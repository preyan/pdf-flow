import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatusPill } from '@/components/shared/StatusPill'
import { TrustStrip } from '@/components/shared/TrustStrip'
import { Eyebrow } from '@/components/shared/Eyebrow'

type Props = {
  icon: LucideIcon
  title: string
  previewEyebrow?: ReactNode
  preview: ReactNode
  panel: ReactNode
}

export function Workspace({ icon: Icon, title, previewEyebrow, preview, panel }: Props) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-7.5rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-7 h-12 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 h-9 px-2 -ml-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>
        <div className="hidden sm:block"><StatusPill /></div>
      </div>

      {/* Main 2-pane */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-0">
        <div className="px-7 py-5 border-b md:border-b-0 md:border-r border-border overflow-auto">
          {previewEyebrow && <Eyebrow className="mb-3">{previewEyebrow}</Eyebrow>}
          {preview}
        </div>
        <aside className="px-4 py-4 flex flex-col gap-3 bg-surface overflow-auto md:max-h-[calc(100dvh-10rem)]">
          {panel}
        </aside>
      </div>

      {/* Compact trust footer */}
      <div className="px-7 h-10 border-t border-border flex items-center">
        <TrustStrip compact />
      </div>
    </div>
  )
}
