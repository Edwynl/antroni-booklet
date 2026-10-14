import { chromium } from 'playwright'

/* Flat-frame captures for review. The tilt layer is neutralised first so the
   frame matches the untransformed layout a designer would sign off on. */

const SHOTS = [
  { name: 'cw-split', vp: { width: 1440, height: 900 }, rail: 2, page: 4 },
  { name: 'cw-feature-stack', vp: { width: 1440, height: 900 }, rail: 2, page: 1 },
  { name: 'cw-bleed', vp: { width: 1440, height: 900 }, rail: 2, page: 2 },
  { name: 'cw-principle', vp: { width: 1440, height: 900 }, rail: 2, page: 3 },
  { name: 'classic-feature-left', vp: { width: 1440, height: 900 }, rail: 0, page: 2 },
  { name: 'classic-feature-stack', vp: { width: 1440, height: 900 }, rail: 0, page: 5 },
  { name: 'noir-feature-right', vp: { width: 1440, height: 900 }, rail: 1, page: 6 },
  { name: 'm-cw-feature', vp: { width: 390, height: 844 }, rail: 2, page: 1 },
  { name: 'm-classic-feature', vp: { width: 390, height: 844 }, rail: 0, page: 2 },
  { name: 'm-cw-split', vp: { width: 390, height: 844 }, rail: 2, page: 4 },
]

const b = await chromium.launch()

for (const s of SHOTS) {
  const p = await (await b.newContext({ viewport: s.vp, deviceScaleFactor: 2 })).newPage()
  await p.goto('http://localhost:5183/', { waitUntil: 'networkidle' })
  await p.click('.chapnav__i:nth-child(4)')
  await p.waitForTimeout(400)
  if (await p.locator('.closed').isVisible()) {
    await p.click('.closed')
    await p.waitForTimeout(1800)
  }
  await p.click(`.rail__i:nth-child(${s.rail + 1})`)
  await p.waitForTimeout(700)
  for (let k = 0; k < s.page; k++) {
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(850)
  }
  await p.evaluate(() => {
    const el = document.querySelector('.bookwrap__inner')
    if (el) el.style.transform = 'none'
  })
  await p.waitForTimeout(200)
  await p.locator('.bookwrap').screenshot({ path: `shots3/${s.name}.png` })
  console.log('shot', s.name)
  await p.context().close()
}

await b.close()