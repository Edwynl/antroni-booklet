import { chromium } from 'playwright'

/* Walk every page of every booklet at several viewports and report any
   content that overflows its box or collides with the running foot. */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]

const b = await chromium.launch()
const issues = []

for (const vp of VIEWPORTS) {
  const p = await (await b.newContext({ viewport: vp })).newPage()
  p.on('pageerror', (e) => issues.push(`${vp.width}x${vp.height} PAGEERROR ${e.message}`))
  await p.goto('http://localhost:5183/', { waitUntil: 'networkidle' })
  await p.click('.chapnav__i:nth-child(4)')
  await p.waitForTimeout(400)
  if (await p.locator('.closed').isVisible()) {
    await p.click('.closed')
    await p.waitForTimeout(1800)
  }

  const codes = await p.locator('.rail__i .rail__code').allTextContents()
  for (let i = 0; i < codes.length; i++) {
    await p.click(`.rail__i:nth-child(${i + 1})`)
    await p.waitForTimeout(650)

    /* The book sits inside a perspective + rotate tilt layer, so
       getBoundingClientRect() is non-linear across the page and reports a few
       pixels of phantom overflow that no amount of CSS can fix. Flatten the
       tilt for the duration of the measurement so the numbers are real. */
    await p.evaluate(() => {
      const el = document.querySelector('.bookwrap__inner')
      if (el) el.style.transform = 'none'
    })
    await p.waitForTimeout(120)

    for (let k = 0; k < 14; k++) {
      const r = await p.evaluate(() => {
        const sheet = document.querySelector('.sheet')
        if (!sheet) return null
        const cls = sheet.className
        const sr = sheet.getBoundingClientRect()

        let spill = 0
        let spillEl = ''
        for (const el of sheet.querySelectorAll('*')) {
          const r2 = el.getBoundingClientRect()
          if (!r2.height) continue
          const d = Math.max(r2.bottom - sr.bottom, r2.right - sr.right, sr.top - r2.top)
          if (d > spill) {
            spill = d
            spillEl = String(el.className || el.tagName).slice(0, 26)
          }
        }

        // clipped boxes that silently lose content — BOTH axes. Checking only
        // scrollHeight hides sideways loss, which is how a caption like
        // "Delivered" gets sliced in half without ever being reported.
        let clipped = 0
        let clipEl = ''
        let clipAxis = ''
        for (const el of sheet.querySelectorAll('*')) {
          const cs = getComputedStyle(el)
          const vClip = cs.overflowY === 'hidden' ? el.scrollHeight - el.clientHeight : 0
          const hClip = cs.overflowX === 'hidden' || cs.overflow === 'hidden' ? el.scrollWidth - el.clientWidth : 0
          const worst = Math.max(vClip, hClip)
          if (worst > clipped) {
            clipped = worst
            clipEl = String(el.className).slice(0, 26)
            clipAxis = hClip > vClip ? 'width' : 'height'
          }
        }

        const foot = sheet.querySelector('.sheet__foot')
        const specs = sheet.querySelector('.specs, .fullsplit__body, .band__text')
        let collide = 0
        if (foot && specs) {
          const fb = foot.getBoundingClientRect()
          const sb = specs.getBoundingClientRect()
          collide = Math.round(sb.bottom - fb.top)
        }
        return { cls, spill: Math.round(spill), spillEl, clipped, clipEl, clipAxis, collide }
      })
      if (!r) break
      const tag = `${vp.width}x${vp.height} ${codes[i]} ${r.cls}`
      if (r.spill > 3) issues.push(`${tag}: spills ${r.spill}px <${r.spillEl}>`)
      if (r.clipped > 6) issues.push(`${tag}: clips ${r.clipped}px of ${r.clipAxis} in <${r.clipEl}>`)
      if (r.collide > 3) issues.push(`${tag}: collides with foot by ${r.collide}px`)

      const kind = r.cls.match(/sheet-(\w+)/)?.[1]
      if (kind === 'back') break
      await p.keyboard.press('ArrowRight')
      await p.waitForTimeout(880)
    }
    for (let k = 0; k < 14; k++) {
      await p.keyboard.press('ArrowLeft')
      await p.waitForTimeout(760)
    }
  }
  console.log(`checked ${vp.width}x${vp.height}`)
  await p.context().close()
}

await b.close()
console.log('\n================ OVERFLOW ISSUES:', issues.length, '================')
issues.forEach((i) => console.log(' -', i))
