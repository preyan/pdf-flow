import { useParams, Navigate } from 'react-router-dom'
import type { ToolName } from '@/types'

const VALID: ToolName[] = ['merge', 'split', 'compress', 'edit', 'watermark', 'sign', 'convert']

function isToolName(value: string | undefined): value is ToolName {
  return !!value && (VALID as string[]).includes(value)
}

export default function Tool() {
  const { name } = useParams<{ name: string }>()

  if (!isToolName(name)) return <Navigate to="/" replace />

  return (
    <section className="px-6 sm:px-7 py-10">
      <p className="text-sm text-muted-foreground">
        Tool "{name}" — coming in step 8.
      </p>
    </section>
  )
}
