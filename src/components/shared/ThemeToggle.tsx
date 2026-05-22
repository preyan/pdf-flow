import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const Icon = theme === 'dark' ? Sun : Moon
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid place-items-center h-11 w-11 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon size={18} />
    </button>
  )
}
