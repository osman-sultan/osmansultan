// Builds the phone (portrait) cut of the window frame from the landscape
// art in src/assets/game/frame-{light,dark}.webp. The top and bottom bars
// are kept as they are and the pillars are extended with a clean band of
// their mosaic (below the lantern), tiled with alternate copies flipped so
// every seam is a mirror line. sands-runner.astro sizes the result as
// 991 x 1110 with the canvas at 776:985 in the opening.
//
//   node scripts/make-portrait-frame.mjs
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const sharp = createRequire(import.meta.url)("sharp")
const DIR = path.resolve("src/assets/game")
const CUT = 455 // row where the band is inserted (bottom of the clean mosaic)
const BAND_TOP = 330 // top of the clean mosaic band, below the lantern
const COPIES = 4

for (const theme of ["light", "dark"]) {
  const src = fs.readFileSync(path.join(DIR, `frame-${theme}.webp`))
  const { width: W, height: H } = await sharp(src).metadata()
  const L = CUT - BAND_TOP
  const part = (top, height) =>
    sharp(src).extract({ left: 0, top, width: W, height }).png().toBuffer()
  const top = await part(0, CUT)
  const bottom = await part(CUT, H - CUT)
  const band = await part(BAND_TOP, L)
  const flipped = await sharp(band).flip().png().toBuffer()
  const layers = [{ input: top, top: 0, left: 0 }]
  let y = CUT
  for (let i = 0; i < COPIES; i++, y += L)
    layers.push({ input: i % 2 === 0 ? flipped : band, top: y, left: 0 })
  layers.push({ input: bottom, top: y, left: 0 })
  const outH = y + (H - CUT)
  const out = await sharp({
    create: { width: W, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(layers)
    .webp({ quality: 80, alphaQuality: 90, effort: 6 })
    .toBuffer()
  fs.writeFileSync(path.join(DIR, `frame-portrait-${theme}.webp`), out)
  console.log(`frame-portrait-${theme}.webp ${W}x${outH} ${out.length} bytes`)
}
