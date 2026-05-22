import { lazy, Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import type { ToolName } from '@/types'

const MergeTool = lazy(() => import('@/tools/merge/MergeTool'))

const VALID: ToolName[] = ['merge', 'split', 'compress', 'edit', 'watermark', 'sign', 'convert']

function isToolName(value: string | undefined): value is ToolName {
  return !!value && (VALID as string[]).includes(value)
}

export default function Tool() {
  const { name } = useParams<{ name: string }>()
  if (!isToolName(name)) return <Navigate to="/" replace />

  return (
    <Suspense
      fallback={
        <div className="px-6 sm:px-7 py-10 text-sm text-muted-foreground">Loading…</div>
      }
    >
      {render(name)}
    </Suspense>
  )
}

function render(name: ToolName) {
  switch (name) {
    case 'merge': return <MergeTool />
    case 'split':
    case 'compress':
    case 'edit':
    case 'watermark':
    case 'sign':
    case 'convert':
      return (
        <div className="px-6 sm:px-7 py-10 text-sm text-muted-foreground">
          {name} — coming up.
        </div>
      )
  }
}
