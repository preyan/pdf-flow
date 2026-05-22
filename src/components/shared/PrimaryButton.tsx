import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
}

export function PrimaryButton({ icon, children, className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-lg',
        'bg-primary text-primary-foreground font-medium text-sm',
        'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity',
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  )
}
