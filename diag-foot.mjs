import { chromium } from 'playwright'

/* Layout-truth dump: offsetTop/offsetHeight are untransformed, so they are not
   skewed by the 3D tilt the way getBoundingClientRect() is. */

const CASES = [
  { vp: { width: 1440, height: 900 }, rail: 0 },
  { vp: { width: 1920, height: 1080 }, rail: 0 },
  { vp: { width: 390, height: 844 }, rail: 0 },
  { vp: { width: 1440, height: 900 }, rail: 2 },
  { vp: { width: 390, height: 844 }, rail: 2 },
]

const b = await chromium.launch()

for (const c of CASES) {
  const p = await (await b.newContext({ viewport: c.vp })).newPage()
  await p.goto('http://localhost:5183/', { waitUntil: 'networkidle' })
  await p.click('.chapnav__i:nth-child(4)')
  await p.waitForTimeout(400)
  if (await p.locator('.closed').isVisible()) {
    await p.click('.closed')
    await p.waitForTimeout(1800)
  }
  await p.click(`.rail__i:nth-child(${c.rail + 1})`)
  await p.waitForTimeout(700)

  const rows = []
  for (let k = 0; k < 14; k++) {
    const r = await p.evaluate(() => {
      const sheet = document.querySelector('.sheet')
      if (!sheet) return null
      const sc = getComputedStyle(sheet)
      const rel = (el) => {
        if (!el) return null
        return {
          t: el.offsetTop,
          b: el.offsetTop + el.offsetHeight,
          h: el.offsetHeight,
          oh: el.offsetHeight,
          clip: el.scrollHeight - el.clientHeight,
        }
      }
      const sels = ['.feature', '.feature__text', '.specs', '.fullsplit', '.fullsplit__panel', '.fullsplit__body', '.sheet__foot']
      return {
        cls: sheet.className,
        h: sheet.offsetHeight,
        pt: sc.paddingTop,
        pb: sc.paddingBottom,
        ch: sheet.clientHeight,
        boxes: sels.map((s) => {
          const m = rel(sheet.querySelector(s))
          return m ? { s, ...m } : null
        }).filter(Boolean),
      }
    })
    if (!r) break
    rows.push(r)
    if (r.cls.includes('sheet-back')) break
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(850)
  }

  console.log(`\n##### ${c.vp.width}x${c.vp.height} rail=${c.rail}`)
  for (const r of rows) {
    const foot = r.boxes.find((x) => x.s === '.sheet__foot')
    const body = r.boxes.find((x) => x.s === '.specs' || x.s === '.fullsplit__body')
    const bad = r.boxes.filter((x) => x.clip > 2)
    const gap = body && foot ? body.b - foot.t : null
    const flag = (gap !== null && gap > 0) || bad.length || r.b > r.h
    console.log(`  ${flag ? '!!' : '  '} ${r.cls.replace('sheet sheet--', '').replace(' sheet--hasfoot', '')}`)
    if (flag) {
      console.log(`       sheet h=${r.h} client=${r.ch} pad=${r.pt}/${r.pb}`)
      for (const x of r.boxes) console.log(`       ${x.s.padEnd(18)} t=${String(x.t).padStart(4)} b=${String(x.b).padStart(4)} h=${String(x.h).padStart(4)} clip=${x.clip}`)
      if (gap !== null) console.log(`       body.bottom ${gap > 0 ? 'OVER' : 'clear of'} foot by ${Math.abs(gap)}px`)
    }
  }
  await p.context().close()
}

await b.close()