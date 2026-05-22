import {
  Combine,
  Scissors,
  Minimize2,
  PencilLine,
  Stamp,
  Signature,
  FileImage,
  type LucideIcon,
} from 'lucide-react'
import type { ToolName } from '@/types'

export type ToolDef = {
  name: ToolName
  title: string
  description: string
  icon: LucideIcon
}

export const TOOLS: ToolDef[] = [
  { name: 'merge',     title: 'Merge',     description: 'Combine PDFs into one',          icon: Combine },
  { name: 'split',     title: 'Split',     description: 'Extract pages into a new PDF',   icon: Scissors },
  { name: 'compress',  title: 'Compress',  description: 'Reduce file size',               icon: Minimize2 },
  { name: 'edit',      title: 'Edit',      description: 'Rotate, delete, reorder pages',  icon: PencilLine },
  { name: 'watermark', title: 'Watermark', description: 'Add text watermark',             icon: Stamp },
  { name: 'sign',      title: 'Sign',      description: 'Draw or type a signature',       icon: Signature },
  { name: 'convert',   title: 'Convert',   description: 'PDF to PNG or JPG',              icon: FileImage },
]
