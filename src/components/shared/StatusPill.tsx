import { ShieldCheck } from 'lucide-react'

export function StatusPill() {
  return (
    <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-border bg-card text-[11px] text-muted-foreground">
      <ShieldCheck size={12} aria-hidden="true" />
      <span>Processing locally</span>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: 'oklch(0.65 0.15 145)' }}
      />
    </div>
  )
}
