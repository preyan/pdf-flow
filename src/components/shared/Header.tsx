import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { LogoLockup } from '@/components/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 sm:px-7 py-4 border-b border-border">
      <Link to="/" aria-label="PDFFlow home" className="rounded-md">
        <LogoLockup />
      </Link>
      <div className="flex items-center gap-1">
        <a
          href="https://github.com/preyan"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors h-11 px-3 rounded-md hover:bg-accent"
        >
          <ArrowUpRight size={14} />
          Source
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
