import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const URL = process.env.URL ?? 'http://localhost:5183/'
const OUT = 'shots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

async function probe(page) {
  return page.evaluate(() => {
    const leaf = document.querySelector('.leaf')
    const book = document.querySelector('.book')
    const de = document.documentElement
    const tilt = document.querySelector('.stage__tilt')

    // content that spills past the page box — silent killer in a booklet
    const sheetOverflow = [...document.querySelectorAll('.sheet')].map((s) => {
      const sr = s.getBoundingClientRect()
      let worst = 0
      let tag = ''
      for (const el of s.querySelectorAll('*')) {
        const r = el.getBoundingClientRect()
        if (!r.height) continue
        const d = Math.max(r.bottom - sr.bottom, r.right - sr.right, -r.top + sr.top)
        if (d > worst) {
          worst = d
          tag = String(el.className || el.tagName).slice(0, 36)
        }
      }
      return { px: Math.round(worst), el: tag }
    })

    // geometry escape hatch: `body{overflow:hidden}` hides a misplaced page
    // from scrollWidth, so measure the boxes directly
    const vw = window.innerWidth
    const vh = window.innerHeight
    const br = book?.getBoundingClientRect()
    const geo = [...document.querySelectorAll('.page')].map((p) => {
      const r = p.getBoundingClientRect()
      return {
        outsideBook: br
          ? Math.round(
              Math.max(br.left - r.left, r.right - br.right, br.top - r.top, r.bottom - br.bottom),
            )
          : 0,
        outsideVp: Math.round(Math.max(-r.left, r.right - vw, -r.top, r.bottom - vh)),
      }
    })

    return {
      leafP: leaf ? getComputedStyle(leaf).getPropertyValue('--p').trim() : null,
      leafSide: leaf ? [...leaf.classList].find((c) => c.startsWith('leaf--')) : null,
      leafFront: leaf?.querySelector('.leaf__face--front h3, .leaf__face--front h2')
        ?.textContent?.trim()
        .slice(0, 30),
      leafBack: leaf?.querySelector('.leaf__face--back h3, .leaf__face--back h2')
        ?.textContent?.trim()
        .slice(0, 30),
      tiltY: tilt ? getComputedStyle(tilt).getPropertyValue('--tilt-y').trim() : null,
      overflowX: de.scrollWidth - de.clientWidth,
      pages: document.querySelectorAll('.page').length,
      bookW: br ? Math.round(br.width) : 0,
      vpW: vw,
      geo,
      folio: document.querySelector('.folio__count')?.textContent?.trim(),
      navDisabled: [...document.querySelectorAll('.navbtn')].map((b) => b.disabled),
      sheetOverflow,
    }
  })
}

async function run(label, viewport, mobile) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    hasTouch: mobile,
    isMobile: mobile,
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

  const log = (tag, data) => console.log(`  ${tag.padEnd(22)} ${JSON.stringify(data)}`)

  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${label}-01-cover.png` })
  console.log(`\n=== ${label} ${viewport.width}x${viewport.height} ===`)

  // ---- open ----
  await page.click('.closed')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${OUT}/${label}-02-spread1.png` })
  log('after open', await probe(page))

  const box = await page.locator('.book').boundingBox()
  if (!box) throw new Error('no .book box')

  // ---- mid-flip drag (hold) ----
  const grabX = box.x + box.width * 0.82
  const grabY = box.y + box.height * 0.45
  await page.mouse.move(grabX, grabY)
  await page.mouse.down()
  for (const f of [0.15, 0.3, 0.45]) {
    await page.mouse.move(grabX - box.width * f * 0.5, grabY, { steps: 6 })
    await page.waitForTimeout(90)
  }
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${label}-03-midflip.png` })
  log('mid flip (held)', await probe(page))

  // ---- release past threshold -> commits ----
  await page.mouse.move(grabX - box.width * 0.45, grabY, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUT}/${label}-04-spread2.png` })
  log('after forward turn', await probe(page))

  // ---- partial drag below threshold -> springs back ----
  const b2 = await page.locator('.book').boundingBox()
  await page.mouse.move(b2.x + b2.width * 0.8, b2.y + b2.height * 0.4)
  await page.mouse.down()
  await page.mouse.move(b2.x + b2.width * 0.8 - 40, b2.y + b2.height * 0.4, { steps: 5 })
  await page.waitForTimeout(80)
  await page.screenshot({ path: `${OUT}/${label}-05-smallflip.png` })
  log('small drag (held)', await probe(page))
  await page.mouse.up()
  await page.waitForTimeout(700)
  log('after spring back', await probe(page))

  // ---- backward turn ----
  const prevBtn = page.locator('.controls .navbtn').first()
  if (await prevBtn.isDisabled()) {
    log('backward turn', 'prev disabled — forward turn did not commit (BUG)')
  } else {
    await prevBtn.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${OUT}/${label}-06-back.png` })
    log('after backward turn', await probe(page))
  }

  // ---- mouse parallax ----
  await page.mouse.move(60, 120)
  await page.waitForTimeout(450)
  log('tilt top-left', await probe(page))
  await page.screenshot({ path: `${OUT}/${label}-07-tilt.png` })

  // ---- keyboard ----
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(950)
  log('after ArrowRight', await probe(page))

  // ---- walk to the end ----
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(850)
  }
  await page.screenshot({ path: `${OUT}/${label}-08-end.png` })
  log('at end', await probe(page))

  // ---- sweep every spread, hunting content that spills off the page ----
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.click('.closed')
  await page.waitForTimeout(2000)

  const spills = []
  const escapes = []
  const visited = new Set()
  let geom = ''
  for (let i = 0; i < 16; i++) {
    const p = await probe(page)
    visited.add(p.folio)
    geom = `${p.bookW}/${p.vpW} pages:${p.pages}`
    for (const s of p.sheetOverflow) {
      if (s.px > 2) spills.push(`${p.folio} +${s.px}px <${s.el}>`)
    }
    for (const g of p.geo) {
      if (g.outsideBook > 2 || g.outsideVp > 2)
        escapes.push(`${p.folio} book+${g.outsideBook} vp+${g.outsideVp}`)
    }
    if (p.navDisabled[1]) break
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(900)
  }
  console.log('  spreads visited:', visited.size, ' bookW/vpW:', geom)
  console.log('  content spills  :', spills.length ? spills : 'none')
  console.log('  box escapes     :', escapes.length ? escapes : 'none')
  if (spills.length) all.push(...spills)
  if (escapes.length) all.push(...escapes)

  console.log('  errors:', errors.length ? errors : 'none')
  await ctx.close()
  return errors
}

const all = []
all.push(...(await run('desktop', { width: 1440, height: 900 }, false)))
all.push(...(await run('laptop', { width: 1280, height: 720 }, false)))
all.push(...(await run('mobile', { width: 390, height: 844 }, true)))

await browser.close()
console.log('\nTOTAL ERRORS:', all.length)
