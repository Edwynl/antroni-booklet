import { chromium } from 'playwright'

const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const issues = []
await p.goto('http://localhost:5183/', { waitUntil: 'networkidle' })
await p.click('.chapnav__i:nth-child(4)')
await p.waitForTimeout(500)
if (await p.locator('.closed').isVisible()) {
  await p.click('.closed')
  await p.waitForTimeout(1800)
}

const codes = await p.locator('.rail__i .rail__code').allTextContents()

for (let i = 0; i < codes.length; i++) {
  await p.click(`.rail__i:nth-child(${i + 1})`)
  await p.waitForTimeout(700)

  const seq = []
  for (let k = 0; k < 20; k++) {
    const cur = await p.evaluate(() => {
      const s = document.querySelector('.sheet')
      if (!s) return '?'
      const cls = [...s.classList]
      const kind = cls.find((c) => c.startsWith('sheet-') && !c.startsWith('sheet--'))?.slice(6)
      const v = cls.find((c) => c.startsWith('v-'))?.slice(2)
      return v ? `${kind}/${v}` : kind
    })
    if (cur !== 'back') seq.push(cur)
    if (cur === 'back') break
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(900)
  }

  // opening and back legitimately appear once each; content pages must not repeat
  const content = seq.filter((s) => !s.startsWith('opening') && !s.startsWith('back'))
  const dup = content.filter((v, k) => content.indexOf(v) !== k)
  console.log(`${codes[i].padEnd(6)} ${seq.join('  ')}`)
  console.log(`       repeats: ${dup.length ? [...new Set(dup)].join(', ') : 'NONE'}`)
  if (dup.length) issues.push(`${codes[i]} repeats ${[...new Set(dup)].join(', ')}`)

  for (let k = 0; k < 12; k++) {
    await p.keyboard.press('ArrowLeft')
    await p.waitForTimeout(780)
  }
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(950)
  await p.screenshot({ path: `shots2/variants-${codes[i].replace('+', '')}.png` })
}

console.log('\nISSUES:', issues.length ? issues : 0)
await b.close()
