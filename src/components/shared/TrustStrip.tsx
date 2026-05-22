import { CloudOff, EyeOff, UserX, WifiOff } from 'lucide-react'

type Cell = {
  icon: typeof CloudOff
  label: string
  subtext: string
}

const CELLS: Cell[] = [
  { icon: CloudOff, label: 'No upload', subtext: 'Zero bytes sent' },
  { icon: EyeOff, label: 'No tracking', subtext: 'No analytics' },
  { icon: UserX, label: 'No account', subtext: 'Nothing to sign up for' },
  { icon: WifiOff, label: 'Works offline', subtext: 'After first visit' },
]

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ul className="flex items-center gap-3 text-muted-foreground">
        {CELLS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5" title={label}>
            <Icon size={12} aria-hidden="true" />
            <span className="text-[11px]">{label}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border">
      {CELLS.map(({ icon: Icon, label, subtext }) => (
        <li
          key={label}
          className="bg-card p-4 flex flex-col gap-1"
        >
          <div className="flex items-center gap-2 text-foreground">
            <Icon size={14} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{subtext}</span>
        </li>
      ))}
    </ul>
  )
}
