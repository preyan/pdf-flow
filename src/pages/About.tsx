import { ArrowUpRight } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'

const PRIVACY_ROWS: Array<[label: string, value: string]> = [
  ['Files', 'Never leave your browser'],
  ['Logs', 'None, no servers'],
  ['Cookies', 'Zero. localStorage for theme'],
  ['Analytics', 'None at all'],
  ['External requests', 'Zero at runtime. Check DevTools.'],
  ['Data retention', '7 days in your own IndexedDB'],
]

export default function About() {
  return (
    <div className="px-7 py-10 max-w-3xl mx-auto w-full">
      <section className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.04em] text-muted-2 mb-3">About</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.1]">
          A privacy-first PDF toolbox.
          <br />
          <span className="text-muted-2">Built in the open. Kept that way.</span>
        </h1>
      </section>

      <Card eyebrow="The person">
        <div className="flex items-center gap-4">
          <Avatar initials="PB" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Preyan Bhowmick</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Built this. Maintains this. Won't sell your data.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <ExtLink href="https://github.com/preyan" label="github.com/preyan" />
              <ExtLink href="https://preyan.github.io/" label="preyan.github.io" />
            </div>
          </div>
        </div>
      </Card>

      <Card eyebrow="Privacy, concretely">
        <dl className="divide-y divide-border">
          {PRIVACY_ROWS.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] py-2.5 gap-3">
              <dt className="text-[11px] uppercase tracking-[0.04em] text-muted-2 self-center">
                {label}
              </dt>
              <dd className="text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <CalloutCard eyebrow="No usage stats">
        <p className="text-sm leading-relaxed">
          There's nothing to show you here. No user count, no PDF count, no
          usage graphs. We don't have any of that data. By design.
        </p>
      </CalloutCard>
    </div>
  )
}

function Card({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-xl p-5 mb-3">
      <p className="text-[11px] uppercase tracking-[0.04em] text-muted-2 mb-4">{eyebrow}</p>
      {children}
    </section>
  )
}

function CalloutCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section
      className="border border-border rounded-xl p-5 mb-3"
      style={{
        background:
          'linear-gradient(to right, rgba(99, 124, 255, 0.06), transparent)',
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.04em] text-muted-2 mb-3">{eyebrow}</p>
      {children}
    </section>
  )
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
    >
      {label}
      <ArrowUpRight size={12} aria-hidden="true" />
    </a>
  )
}
