import { chromium } from 'playwright'

/* Editions: group inventory, layout distinctness, plate count, aspect
   fidelity, the lightbox (including its thumbnail strip), and nav
   reachability — at desktop and phone. */

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

  const nav = await p.evaluate(() => {
    const w = window.innerWidth
    return Array.from(document.querySelectorAll('.chapnav__i')).map((el) => {
      const r = el.getBoundingClientRect()
      return { label: el.textContent.trim().split('\n')[0], out: r.right > w + 0.5 || r.left < -0.5 }
    })
  })
  if (nav.some((n) => n.out)) issues.push(`${vp.tag} chapter nav unreachable`)

  await p.click('.chapnav__i:nth-child(5)')
  await p.waitForTimeout(1200)

  const groups = await p.evaluate(() =>
    Array.from(document.querySelectorAll('.ed')).map((el) => ({
      label: el.querySelector('.ed__n')?.textContent,
      layout: Array.from(el.classList).find((c) => c.startsWith('ed--'))?.slice(4),
      cells: el.querySelectorAll('.ed__cell').length,
    })),
  )
  console.log(`${vp.tag} groups:`, JSON.stringify(groups))

  const r = await p.evaluate(() => {
    const vpEl = document.querySelector('.viewport')
    const out = { docX: 0, clipped: [], cells: 0, badRatio: 0, overTop: 0 }
    out.docX = document.documentElement.scrollWidth - document.documentElement.clientWidth
    const cw = vpEl.clientWidth
    for (const el of document.querySelectorAll('.ed__cell')) {
      out.cells++
      const b = el.getBoundingClientRect()
      // a strip cell is allowed to be wider than the viewport — it scrolls
      const inStrip = !!el.closest('.ed--strip')
      if (!inStrip && b.width > cw + 1) out.clipped.push(Math.round(b.width - cw))
      const img = el.querySelector('img')
      if (img) {
        const bw = parseFloat(getComputedStyle(el).borderLeftWidth) || 0
        const bh = parseFloat(getComputedStyle(el).borderTopWidth) || 0
        const cellAr = (b.width - 2 * bw) / (b.height - 2 * bh)
        const nat = img.naturalWidth / img.naturalHeight
        if (nat && Math.abs(cellAr - nat) / nat > 0.02) out.badRatio++
      }
    }
    return out
  })
  console.log(`${vp.tag} metrics:`, JSON.stringify(r))
  if (r.docX > 0) issues.push(`${vp.tag} page overflows X by ${r.docX}px`)
  if (r.clipped.length) issues.push(`${vp.tag} ${r.clipped.length} cells wider than viewport`)
  if (r.badRatio) issues.push(`${vp.tag} ${r.badRatio} cells distort their plate`)
  if (r.cells !== 61) issues.push(`${vp.tag} expected 61 cells, got ${r.cells}`)

  // no two running groups may share a layout
  const seq = groups.map((g) => g.layout)
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] === seq[i - 1]) issues.push(`${vp.tag} layout "${seq[i]}" repeats back to back`)
  }

  await p.screenshot({ path: `shots3/ed-${vp.tag}-top.png` })

  // open the lightbox on a mid-document group so the strip has siblings
  await p.evaluate(() => {
    const g = document.querySelectorAll('.ed')
    g[Math.min(5, g.length - 1)].scrollIntoView({ block: 'start' })
  })
  await p.waitForTimeout(800)
  await p.locator('.ed__cell').nth(1).click()
  await p.waitForTimeout(700)

  const lb = await p.evaluate(() => {
    const el = document.querySelector('.lightbox')
    if (!el) return null
    const img = el.querySelector('.lightbox__fig > img')
    const ir = img.getBoundingClientRect()
    const thumbs = el.querySelectorAll('.lightbox__thumb').length
    const on = el.querySelector('.lightbox__thumb.is-on')
    return {
      src: img.getAttribute('src'),
      fits: ir.width <= window.innerWidth && ir.height <= window.innerHeight,
      thumbs,
      hasActive: !!on,
      figBottom: Math.round(el.querySelector('.lightbox__fig').getBoundingClientRect().bottom),
      vh: window.innerHeight,
    }
  })
  console.log(`${vp.tag} lightbox:`, JSON.stringify(lb))
  if (!lb) issues.push(`${vp.tag} lightbox did not open`)
  else {
    if (!lb.fits) issues.push(`${vp.tag} lightbox image overflows the viewport`)
    if (!lb.thumbs) issues.push(`${vp.tag} lightbox has no thumbnail strip`)
    if (!lb.hasActive) issues.push(`${vp.tag} lightbox has no active thumbnail`)
    if (lb.figBottom > lb.vh + 1) issues.push(`${vp.tag} lightbox figure runs past the viewport`)
  }
  await p.screenshot({ path: `shots3/ed-${vp.tag}-lightbox.png` })

  // stepping with the keyboard must actually move
  const before = await p.evaluate(() => document.querySelector('.lightbox__fig > img').src)
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(500)
  const after = await p.evaluate(() => document.querySelector('.lightbox__fig > img').src)
  if (before === after) issues.push(`${vp.tag} ArrowRight did not advance the plate`)

  await p.keyboard.press('Escape')
  await p.waitForTimeout(400)
  if (await p.locator('.lightbox').count()) issues.push(`${vp.tag} Escape did not close the lightbox`)

  await p.context().close()
}

await b.close()
console.log('\n================ ISSUES:', issues.length, '================')
issues.forEach((i) => console.log(' -', i))