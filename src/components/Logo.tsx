type Props = { size?: number; className?: string }

export function LogoMark({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="10" y="9" width="28" height="30" rx="3" />
      <path d="M 15 24 Q 20 17, 24 24 T 33 24" />
    </svg>
  )
}

export function LogoLockup({ size = 26 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid place-items-center rounded-md bg-primary"
        style={{ width: size, height: size }}
      >
        <LogoMark size={size * 0.62} className="text-primary-foreground" />
      </div>
      <span className="text-sm font-medium tracking-tight">PDFFlow</span>
    </div>
  )
}
