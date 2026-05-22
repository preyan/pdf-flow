import { Link } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { TrustStrip } from '@/components/shared/TrustStrip'
import { TOOLS } from '@/lib/tools'

export default function Home() {
  return (
    <div className="px-7 py-10 max-w-5xl mx-auto w-full">
      <section className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-medium tracking-tight leading-[1.05]">
          All your PDFs.
          <br />
          <span className="text-primary">None of our business.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Every file you open is processed inside your browser. We don't run
          servers. We have nothing to leak, lose, or hand over.
        </p>
      </section>

      <section className="mb-8">
        <TrustStrip />
      </section>

      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="sr-only">PDF tools</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {TOOLS.map(({ name, title, description, icon: Icon }) => (
            <li key={name}>
              <Link
                to={`/tool/${name}`}
                className="group flex flex-col gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-surface-hover transition-colors min-h-[88px]"
              >
                <Icon size={18} className="text-primary" aria-hidden="true" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{title}</div>
                  <div className="text-[11px] text-muted-2 mt-0.5 leading-snug">
                    {description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/tool/merge"
              className="group h-full flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-surface-hover transition-colors min-h-[88px]"
            >
              <Upload size={18} aria-hidden="true" />
              <div className="text-[11px] text-center leading-snug">
                Or drop a PDF anywhere
              </div>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
