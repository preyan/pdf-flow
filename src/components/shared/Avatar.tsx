export function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="grid place-items-center h-12 w-12 rounded-full text-sm font-medium tracking-tight"
      style={{
        backgroundColor: 'oklch(0.28 0.06 255)',
        color: 'oklch(0.88 0.1 255)',
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
