import sharp from 'sharp'
import { mkdir, readFile } from 'node:fs/promises'

await mkdir('public/icons', { recursive: true })

// sharp can't parse OKLCH inside SVG attrs — substitute the brand indigo with hex.
const raw = await readFile('public/icon.svg', 'utf8')
const svg = Buffer.from(raw.replace(/oklch\(0\.65 0\.17 255\)/g, '#637cff'))

await sharp(svg).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-maskable.png')

console.log('Generated icon-192.png, icon-512.png, icon-maskable.png')
