export type Theme = 'dark' | 'light'

export type ToolName =
  | 'merge'
  | 'split'
  | 'compress'
  | 'edit'
  | 'watermark'
  | 'sign'
  | 'convert'

export type ToolDef = {
  name: ToolName
  title: string
  description: string
}
