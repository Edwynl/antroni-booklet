import { chromium } from 'playwright'

/* Screenshots of the new Editions chapter: the grid at desktop and phone,
   plus the lightbox. */

const b = await chromium.launch()
const issues = []

for (const vp of [
  { width: 1440, height: 900, tag: 'wide' },
  { width: 390, height: 844, tag: 'phone' },
]) {
  const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: 2 })).newPage()
  p.on('pageerror', (e) => issues.push(`${vp.tag} PAGEERROR ${e.message}`))
  p.on('console', (m) => {
    if (m.type() === 'error') issues.push(`${vp.tag} CONSOLE ${m.text().slice(0, 120)}`)
  })

  await p.goto('http://localhost:5183/', { waitUntil: 'networkidle' })

  // every chapter must be tappable, not just present in the DOM
  const nav = await p.evaluate(() => {
    const w = window.innerWidth
    return Array.from(document.querySelectorAll('.chapnav__i')).map((el) => {
      const r = el.getBoundingClientRect()
      return { label: el.textContent.trim().split('\n')[0], outside: r.right > w + 0.5 || r.left < -0.5 }
    })
  })
  const lost = nav.filter((n) => n.outside)
  if (lost.length) issues.push(`${vp.tag} chapter nav unreachable: ${lost.map((l) => l.label).join(', ')}`)
  console.log(`${vp.tag} nav:`, nav.length, 'items,', lost.length, 'outside')

  await p.click('.chapnav__i:nth-child(5)')
  await p.waitForTimeout(1200)

  const groups = await p.evaluate(() =>
    Array.from(document.querySelectorAll('.ed')).map((el) => ({
      n: el.querySelector('.ed__n')?.textContent,
      cells: el.querySelectorAll('.ed__cell').length,
      head: el.querySelector('.ed__head')?.textContent?.trim(),
    })),
  )
  console.log(`${vp.tag} groups:`, JSON.stringify(groups))

  const r = await p.evaluate(() => {
    const vpEl = document.querySelector('.viewport')
    const out = { docOverflowX: 0, clipped: [], cells: 0, badRatio: 0 }
    out.docOverflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth
    const cw = vpEl.clientWidth
    for (const el of document.querySelectorAll('.ed__cell')) {
      out.cells++
      const r2 = el.getBoundingClientRect()
      if (r2.width > cw + 1) out.clipped.push(Math.round(r2.width - cw))
      const img = el.querySelector('img')
      if (img) {
        // the cell carries a 1px border, so compare against its CONTENT box —
        // object-fit:cover can only crop, never distort, and it crops only
        // when the cell's content ratio misses the plate's own ratio
        const bw = parseFloat(getComputedStyle(el).borderLeftWidth) || 0
        const bh = parseFloat(getComputedStyle(el).borderTopWidth) || 0
        const cellAr = (r2.width - 2 * bw) / (r2.height - 2 * bh)
        const natAr = img.naturalWidth / img.naturalHeight
        if (natAr && Math.abs(cellAr - natAr) / natAr > 0.02) out.badRatio++
      }
    }
    const lb = document.querySelector('.lightbox')
    out.lightbox = lb ? 'open' : 'closed'
    return out
  })
  console.log(`${vp.tag} metrics:`, JSON.stringify(r))
  if (r.docOverflowX > 0) issues.push(`${vp.tag} page overflows X by ${r.docOverflowX}px`)
  if (r.clipped.length) issues.push(`${vp.tag} ${r.clipped.length} cells wider than viewport`)
  if (r.badRatio) issues.push(`${vp.tag} ${r.badRatio} cells distort their plate`)
  if (r.cells !== 35) issues.push(`${vp.tag} expected 35 cells, got ${r.cells}`)

  await p.screenshot({ path: `shots3/ed-${vp.tag}.png` })

  // scroll to the portrait group and open the lightbox
  await p.evaluate(() => {
    const g = document.querySelectorAll('.ed')
    g[g.length - 1].scrollIntoView({ block: 'start' })
  })
  await p.waitForTimeout(900)
  await p.screenshot({ path: `shots3/ed-${vp.tag}-bottom.png` })

  await p.locator('.ed__cell').first().click()
  await p.waitForTimeout(700)
  const lb = await p.evaluate(() => {
    const el = document.querySelector('.lightbox')
    if (!el) return null
    const img = el.querySelector('img')
    const ir = img.getBoundingClientRect()
    return {
      src: img.getAttribute('src'),
      fits: ir.width <= window.innerWidth && ir.height <= window.innerHeight,
      w: Math.round(ir.width),
      h: Math.round(ir.height),
    }
  })
  console.log(`${vp.tag} lightbox:`, JSON.stringify(lb))
  if (!lb) issues.push(`${vp.tag} lightbox did not open`)
  else if (!lb.fits) issues.push(`${vp.tag} lightbox image overflows the viewport`)
  await p.screenshot({ path: `shots3/ed-${vp.tag}-lightbox.png` })

  await p.context().close()
}

await b.close()
console.log('\n================ ISSUES:', issues.length, '================')
issues.forEach((i) => console.log(' -', i))