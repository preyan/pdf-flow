import { Link } from 'react-router-dom'
import { Lock, Scale } from 'lucide-react'

export function Footer() {
  return (
    <footer className="px-7 h-12 border-t border-border text-[11px] text-muted-2 flex items-center gap-2 flex-wrap">
      <Lock size={11} aria-hidden="true" />
      <a
        href="https://github.com/preyan/pdf-flow"
        target="_blank"
        rel="noreferrer"
        className="hover:text-foreground transition-colors"
      >
        Audit code
      </a>
      <span aria-hidden="true">·</span>
      <Scale size={11} aria-hidden="true" />
      <span>MIT</span>
      <span aria-hidden="true">·</span>
      <span>
        Built by{' '}
        <Link to="/about" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
          Preyan Bhowmick
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>v1.0</span>
    </footer>
  )
}
