import { useState } from 'react'
import { LOGO_VARIANTS } from '../data/brand'

/* Marks 1 and 2 worked because they were honest and instantly legible:
   pure type, and a letterform drawn as an opening. 3–6 are rebuilt on
   that same footing — plain geometry with one idea each, no tricks. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 7,
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
} as const

/* 1 — type only. No symbol at all. */
function Wordmark() {
  return (
    <div className="lk lk--wordmark">
      <span className="wordmarkSvg wordmarkSvg--hero">ANTRONI</span>
      <span className="lk__rule" />
      <span className="lk__cn">安窗义门窗</span>
    </div>
  )
}

/* 2 — the letter A with an arched apex */
function ArchA() {
  return (
    <div className="lk lk--single">
      <svg viewBox="0 0 120 120" aria-hidden>
        <path d="M18 104 L54 38 A12 12 0 0 1 66 38 L102 104" {...S} />
        <path d="M36 74 H84" {...S} />
      </svg>
    </div>
  )
}

/* 3 — a door-proportioned rectangle divided into its golden parts.
       The proportion is stated, not decorated. */
function Section() {
  return (
    <div className="lk lk--single">
      <svg viewBox="0 0 100 162" aria-hidden>
        <rect x="3.5" y="3.5" width="93" height="155" {...S} />
        <line x1="3.5" y1="58.5" x2="96.5" y2="58.5" {...S} />
      </svg>
    </div>
  )
}

/* 4 — the pivot drawn as a plan: closed, its path, open.
       The travel arc is dashed so it reads as a path, not a leaf. */
function Swing() {
  return (
    <div className="lk lk--single">
      <svg viewBox="0 0 130 110" aria-hidden>
        <line x1="20" y1="88" x2="20" y2="25" {...S} />
        <path d="M20 25 A63 63 0 0 1 83 88" {...S} strokeDasharray="11 9" />
        <line x1="20" y1="88" x2="83" y2="88" {...S} />
      </svg>
    </div>
  )
}

/* 5 — the N, set to the same grid as the arched A */
function LetterN() {
  return (
    <div className="lk lk--single">
      <svg viewBox="0 0 120 120" aria-hidden>
        <line x1="25" y1="94" x2="25" y2="25" {...S} />
        <line x1="25" y1="25" x2="95" y2="94" {...S} />
        <line x1="95" y1="94" x2="95" y2="25" {...S} />
      </svg>
    </div>
  )
}

/* 6 — an arched opening with one transom and one mullion:
       the product in its simplest true form */
function ArchWindow() {
  const W = { ...S, strokeWidth: 6 }
  return (
    <div className="lk lk--single">
      <svg viewBox="0 0 100 130" aria-hidden>
        <path d="M15 123 V53 A35 35 0 0 1 85 53 V123 Z" {...W} />
        <line x1="15" y1="53" x2="85" y2="53" {...W} />
        <line x1="50" y1="53" x2="50" y2="123" {...W} />
      </svg>
    </div>
  )
}

const RENDER = {
  wordmark: Wordmark,
  archA: ArchA,
  section: Section,
  swing: Swing,
  letterN: LetterN,
  archWindow: ArchWindow,
}

export default function LogoSection() {
  const [grid, setGrid] = useState(false)

  return (
    <section className="panel panel--logo">
      <header className="panel__head">
        <p className="kicker">LA MARQUE</p>
        <h2 className="panel__title">
          Six Marks
          <em>品牌标志 · 六种方案</em>
        </h2>
        <p className="panel__lede">
          Every mark here is plain geometry with a single idea and nothing hidden: the name set on
          its own, the letter A drawn as an opening, the golden division stated as a door, the pivot
          drawn as a plan, the letter N on the same grid, and the arched window itself. One stroke
          weight, one grid, legible at sixteen pixels.
        </p>
      </header>

      <div className="logo__stage">
        <div className={`logo__gridplate${grid ? ' is-on' : ''}`}>
          <div className="gridplate__type">
            <Wordmark />
          </div>
          <div className="gridplate__mark">
            <ArchA />
          </div>
          <div className="logo__guides" aria-hidden>
            <span className="g g--cap" />
            <span className="g g--base" />
            <span className="g g--radius" />
          </div>
        </div>
        <button className="toggle" onClick={() => setGrid((v) => !v)} aria-pressed={grid}>
          <span className="toggle__dot" />
          Construction grid
        </button>
      </div>

      <ul className="logo__variants">
        {LOGO_VARIANTS.map((v) => {
          const C = RENDER[v.kind as keyof typeof RENDER]
          return (
            <li className="variant" key={v.id}>
              <div className="variant__art">
                <C />
              </div>
              <div className="variant__meta">
                <span className="variant__kind">{v.usage}</span>
                <h3>{v.name}</h3>
                <span className="variant__cn">{v.nameCn}</span>
                <p>{v.note}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
