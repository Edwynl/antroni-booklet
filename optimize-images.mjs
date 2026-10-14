import { readdir, unlink, stat } from 'node:fs/promises'
import { join, extname, parse } from 'node:path'
import sharp from 'sharp'

const DIR = 'public/images'
const MAX = 2400
const QUALITY = 82

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f))

let before = 0
let after = 0

for (const file of files) {
  const src = join(DIR, file)
  const out = join(DIR, `${parse(file).name}.webp`)

  before += (await stat(src)).size

  await sharp(src)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out)

  const size = (await stat(out)).size
  after += size
  console.log(
    `${file.padEnd(38)} -> ${parse(file).name + '.webp'.padEnd(20)} ${(
      size / 1024
    ).toFixed(0).padStart(5)} KB  (from ${((await stat(src)).size / 1024).toFixed(0)} KB)`,
  )

  await unlink(src)
}

console.log(
  `\nTotal: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`,
)

