import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const URL = process.env.URL ?? 'http://localhost:5183/'
const OUT = 'shots2'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const all = []

async function probe(page) {
  return page.evaluate(() => {
    const leaf = document.querySelector('.leaf')
    const book = document.querySelector('.book')
    const sheet = document.querySelector('.sheet')
    const de = document.documentElement
    const br = book?.getBoundingClientRect()

    // content that escapes the page box
    let spill = 0
    let spillEl = ''
    if (sheet) {
      const sr = sheet.getBoundingClientRect()
      for (const el of sheet.querySelectorAll('*')) {
        const r = el.getBoundingClientRect()
        if (!r.height) continue
        const d = Math.max(r.bottom - sr.bottom, r.right - sr.right, sr.top - r.top)
        if (d > spill) {
          spill = d
          spillEl = String(el.className || el.tagName).slice(0, 30)
        }
      }
    }

    // how far the page escapes the viewport — positive only when it
    // actually overflows that edge (a centred page yields all negatives)
    const geo = book
      ? Math.round(
          Math.max(
            -br.left,
            br.right - window.innerWidth,
            -br.top,
            br.bottom - window.innerHeight,
          ),
        )
      : -1

    return {
      p: leaf ? getComputedStyle(leaf).getPropertyValue('--p').trim() : null,
      origin: leaf ? getComputedStyle(leaf).transformOrigin : null,
      kind: sheet ? sheet.className.replace('sheet sheet--', '') : null,
      folio: document.querySelector('.pager__num')?.textContent?.trim(),
      bookW: br ? Math.round(br.width) : 0,
      bookH: br ? Math.round(br.height) : 0,
      ratio: br ? +(br.width / br.height).toFixed(3) : 0,
      geoOutside: geo,
      spill: Math.round(spill),
      spillEl,
      overflowX: de.scrollWidth - de.clientWidth,
      active: document.querySelector('.rail__i.is-on .rail__code')?.textContent?.trim(),
    }
  })
}

const log = (t, d) => console.log(`   ${t.padEnd(20)} ${JSON.stringify(d)}`)

async function run(label, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

  console.log(`\n=== ${label} ${viewport.width}x${viewport.height} ===`)
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  // ---- chapters render ----
  for (const [i, name] of [
    [1, 'brand'],
    [2, 'logo'],
    [3, 'mobile'],
  ]) {
    await page.click(`.chapnav__i:nth-child(${i})`)
    await page.waitForTimeout(700)
    const ok = await page.locator('.panel').isVisible()
    const scrolled = await page.evaluate(() => {
      const v = document.querySelector('.viewport')
      return v ? v.scrollHeight - v.clientHeight : -1
    })
    log(`chapter ${name}`, { visible: ok, scrollablePx: scrolled })
    if (!ok) all.push(`${label}: ${name} panel not visible`)
    if (scrolled < 0) all.push(`${label}: ${name} viewport not scrollable`)
    await page.screenshot({ path: `${OUT}/${label}-chapter-${name}.png` })
  }

  // ---- booklets ----
  await page.click('.chapnav__i:nth-child(4)')
  await page.waitForTimeout(500)

  // the rail only exists once the cover is open
  if (await page.locator('.closed').isVisible()) {
    await page.click('.closed')
    await page.waitForTimeout(1800)
  }

  const codes = await page.locator('.rail__i .rail__code').allTextContents()
  log('booklets', codes.join(' / '))
  if (codes.length !== 3) all.push(`expected 3 booklets, found ${codes.length}`)

  for (let b = 0; b < codes.length; b++) {
    await page.click(`.rail__i:nth-child(${b + 1})`)
    await page.waitForTimeout(800)

    const p0 = await probe(page)
    log(`${codes[b]} open`, p0)
    await page.screenshot({ path: `${OUT}/${label}-${codes[b]}-p1.png` })

    const box = await page.locator('.book').boundingBox()

    // hold a forward drag for the mid-flip frame
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.5, { steps: 8 })
    await page.waitForTimeout(120)
    const mid = await probe(page)
    log(`${codes[b]} mid-flip`, mid)
    await page.screenshot({ path: `${OUT}/${label}-${codes[b]}-midflip.png` })

    await page.mouse.move(box.x + box.width * 0.05, box.y + box.height * 0.5, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(1100)
    const fwd = await probe(page)
    log(`${codes[b]} forward`, fwd)

    // reverse turn
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 })
    await page.waitForTimeout(120)
    const rev = await probe(page)
    log(`${codes[b]} reverse`, rev)
    await page.screenshot({ path: `${OUT}/${label}-${codes[b]}-reverse.png` })
    await page.mouse.move(box.x + box.width * 0.98, box.y + box.height * 0.5, { steps: 6 })
    await page.mouse.up()
    await page.waitForTimeout(1100)
    log(`${codes[b]} after reverse`, await probe(page))

    // wrap backwards from the first page -> should land on the colophon
    await page.click('.pager .navbtn:first-child')
    await page.waitForTimeout(400)
    await page.click('.pager .navbtn:first-child')
    await page.waitForTimeout(1100)
    const wrapped = await probe(page)
    log(`${codes[b]} wrap-back`, wrapped)
    await page.screenshot({ path: `${OUT}/${label}-${codes[b]}-wrap.png` })

    for (const [tag, d] of [
      ['open', p0],
      ['mid', mid],
      ['fwd', fwd],
      ['rev', rev],
      ['wrap', wrapped],
    ]) {
      if (d.geoOutside > 2) all.push(`${label}/${codes[b]} ${tag}: page escapes viewport by ${d.geoOutside}px`)
      if (d.spill > 3) all.push(`${label}/${codes[b]} ${tag}: ${d.spillEl} spills ${d.spill}px`)
      if (d.overflowX > 0) all.push(`${label}/${codes[b]} ${tag}: horizontal overflow ${d.overflowX}px`)
    }
  }

  console.log('   errors:', errors.length ? errors : 'none')
  if (errors.length) all.push(...errors)
  await ctx.close()
}

await run('desktop', { width: 1440, height: 900 })
await run('mobile', { width: 390, height: 844 })

await browser.close()
console.log('\n================ ISSUES:', all.length, '================')
all.forEach((x) => console.log(' -', x))
