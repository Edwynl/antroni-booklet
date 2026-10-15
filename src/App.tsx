import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Book, { type Layout, type Turn } from './components/Book'
import ClosedCover from './components/ClosedCover'
import BrandSection from './components/BrandSection'
import LogoSection from './components/LogoSection'
import MobileSection from './components/MobileSection'
import EditionsSection from './components/EditionsSection'
import { BOOKLETS } from './data/booklet'
import './styles/sections.css'

type Chapter = 'brand' | 'logo' | 'mobile' | 'catalogues' | 'editions'

const CHAPTERS: { id: Chapter; label: string; cn: string }[] = [
  { id: 'brand', label: 'Principles', cn: '理念' },
  { id: 'logo', label: 'Identity', cn: '标志' },
  { id: 'mobile', label: 'Interface', cn: '界面' },
  { id: 'catalogues', label: 'Catalogues', cn: '图录' },
  { id: 'editions', label: 'Editions', cn: '成品' },
]

function measure(ratio: number): Layout {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const wide = vw >= 820

  const side = wide ? Math.min(vw * 0.05, 80) : 14
  const top = wide ? 74 : 96
  const bottom = wide ? 76 : 104
  const pad = wide ? 26 : 14

  const availW = vw - side * 2 - pad * 2
  const availH = vh - top - bottom - pad * 2

  const r = wide ? ratio : 3 / 4 // narrow screens keep a legible 3:4
  let pw = availW
  let ph = pw / r
  if (ph > availH) {
    ph = availH
    pw = ph * r
  }
  return { pw: Math.round(pw), ph: Math.round(ph), wide }
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function App() {
  const [chapter, setChapter] = useState<Chapter>('catalogues')
  const [coverOpen, setCoverOpen] = useState(false)
  const [opening, setOpening] = useState(false)
  const [entering, setEntering] = useState(false)
  const [bookIdx, setBookIdx] = useState(0)
  const [page, setPage] = useState(0)
  const [turn, setTurnState] = useState<Turn | null>(null)
  const [tracking, setTracking] = useState(false)

  const raf = useRef(0)
  const dirRef = useRef<1 | -1>(1)
  const turnRef = useRef<Turn | null>(null)
  const drag = useRef<{ x0: number; dir: 1 | -1; locked: boolean; moved: number } | null>(null)
  const tiltRef = useRef<HTMLDivElement>(null)

  const booklet = BOOKLETS[bookIdx]
  const [layout, setLayout] = useState<Layout>(() => measure(BOOKLETS[0].ratio))
  const nPages = booklet.pages.length

  /* first and last pages are connected — the back cover turns back to the
     opening, and the opening turns back to the colophon */
  const wrap = useCallback((i: number) => ((i % nPages) + nPages) % nPages, [nPages])

  const setTurn = useCallback((t: Turn | null) => {
    turnRef.current = t
    setTurnState(t)
  }, [])

  /* ---------- layout follows the active booklet ---------- */
  useEffect(() => {
    setLayout(measure(booklet.ratio))
    cancelAnimationFrame(raf.current)
    setTurn(null)
    setTracking(false)
  }, [booklet, setTurn])

  useEffect(() => {
    let t = 0
    const onResize = () => {
      clearTimeout(t)
      t = window.setTimeout(() => setLayout(measure(booklet.ratio)), 120)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
    }
  }, [booklet])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  /* ---------- parallax ---------- */
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onStageMove = (e: React.MouseEvent) => {
    const el = tiltRef.current
    if (!el || reduce()) return
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    el.style.setProperty('--tilt-y', `${x * 4.5}deg`)
    el.style.setProperty('--tilt-x', `${-y * 3}deg`)
  }

  const resetTilt = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--tilt-x', '0deg')
  }

  /* ---------- turn engine ---------- */
  const animate = useCallback(
    (from: number, to: number, ms: number, commit: () => void, ease = easeInOut) => {
      cancelAnimationFrame(raf.current)
      const t0 = performance.now()
      const dir = dirRef.current
      const step = (now: number) => {
        const t = Math.min((now - t0) / ms, 1)
        setTurn({ dir, progress: from + (to - from) * ease(t) })
        if (t < 1) raf.current = requestAnimationFrame(step)
        else {
          setTurn(null)
          commit()
        }
      }
      raf.current = requestAnimationFrame(step)
    },
    [setTurn],
  )

  const settle = useCallback(
    (dir: 1 | -1) => {
      dirRef.current = dir
      setTracking(true)
      animate(0, 1, 720, () => {
        setPage((p) => wrap(p + dir))
        setTracking(false)
      })
    },
    [animate, wrap],
  )

  const abort = useCallback(
    (dir: 1 | -1) => {
      const p = turnRef.current?.progress ?? 0
      dirRef.current = dir
      setTracking(true)
      animate(p, 0, 360, () => setTracking(false), easeOut)
    },
    [animate],
  )

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!coverOpen || opening || turnRef.current) return
      settle(dir)
    },
    [coverOpen, opening, settle],
  )

  /* ---------- pointer ---------- */
  const onGrab = (x: number) => {
    if (!coverOpen || opening || turnRef.current) return
    drag.current = { x0: x, dir: 1, locked: false, moved: 0 }
    setTracking(true)
  }

  const onDrag = (x: number) => {
    const d = drag.current
    if (!d) return
    const dx = x - d.x0
    d.moved = Math.max(d.moved, Math.abs(dx))

    if (!d.locked) {
      if (Math.abs(dx) < 8) return
      d.dir = dx <= 0 ? 1 : -1
      d.locked = true
    }

    dirRef.current = d.dir
    setTurn({ dir: d.dir, progress: Math.max(0, Math.min(1, -dx / layout.pw)) })
  }

  const onRelease = () => {
    const d = drag.current
    drag.current = null
    const t = turnRef.current
    if (!d) return

    if (!d.locked && d.moved < 8) {
      setTracking(false)
      settle(1)
      return
    }
    if (!t) {
      setTracking(false)
      return
    }
    if (t.progress < 0.01) return abort(d.dir)
    if (t.progress > 0.3) {
      dirRef.current = d.dir
      animate(t.progress, 1, 600, () => {
        setPage((p) => wrap(p + d.dir))
        setTracking(false)
      })
    } else {
      abort(d.dir)
    }
  }

  const openCover = useCallback(() => {
    if (opening || coverOpen) return
    setOpening(true)
    window.setTimeout(() => {
      setOpening(false)
      setCoverOpen(true)
      setEntering(true)
      window.setTimeout(() => setEntering(false), 1200)
    }, 760)
  }, [opening, coverOpen])

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (chapter !== 'catalogues') return
      if (!coverOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openCover()
        }
        return
      }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chapter, coverOpen, go, openCover])

  const current = booklet.pages[page]
  const label = useMemo(() => {
    const s = current
    if (!s) return ''
    switch (s.kind) {
      case 'opening':
        return s.title.replace('\n', ' ')
      case 'full':
        return s.caption.replace('\n', ' ')
      case 'feature':
      case 'principle':
        return `${s.kicker} · ${s.title.replace('\n', ' ')}`
      case 'back':
        return 'Colophon'
      default:
        return ''
    }
  }, [current])

  const inCatalogues = chapter === 'catalogues'

  return (
    <div className="stage" onMouseMove={onStageMove} onMouseLeave={resetTilt}>
      <div ref={tiltRef} className={`stage__tilt${tracking ? ' is-tracking' : ''}`}>
        {inCatalogues ? (
          coverOpen ? (
            <Book
              booklet={booklet}
              index={page}
              turn={turn}
              layout={layout}
              entering={entering}
              onGrab={onGrab}
              onDrag={onDrag}
              onRelease={onRelease}
            />
          ) : (
            <ClosedCover
              pw={layout.pw}
              ph={layout.ph}
              cover={booklet.cover}
              code={booklet.code}
              title={booklet.title}
              cn={booklet.titleCn}
              opening={opening}
              onOpen={openCover}
            />
          )
        ) : (
          <div className="viewport">
            {chapter === 'brand' && <BrandSection />}
            {chapter === 'logo' && <LogoSection />}
            {chapter === 'mobile' && <MobileSection />}
            {chapter === 'editions' && <EditionsSection />}
          </div>
        )}
      </div>

      <div className="stage__vignette" />
      <div className="stage__grain" />

      {/* chapter nav */}
      <header className="chrome chrome__top">
        <div className="wordmark">
          <span>ANTRONI</span>
          <span className="wordmark__cn">安窗义门窗</span>
        </div>

        <nav className="chapnav">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              className={`chapnav__i${chapter === c.id ? ' is-on' : ''}`}
              onClick={() => setChapter(c.id)}
              aria-current={chapter === c.id}
            >
              <span>{c.label}</span>
              <em>{c.cn}</em>
            </button>
          ))}
        </nav>
      </header>

      {/* booklet + page controls */}
      {inCatalogues && coverOpen && (
        <footer className="chrome chrome__bottom">
          <div className="rail">
            {BOOKLETS.map((b, i) => (
              <button
                key={b.id}
                className={`rail__i${i === bookIdx ? ' is-on' : ''}`}
                onClick={() => {
                  setBookIdx(i)
                  setPage(0)
                }}
              >
                <span className="rail__code">{b.code}</span>
                <span className="rail__cn">{b.titleCn}</span>
              </button>
            ))}
          </div>

          <div className="pager">
            <button
              className="navbtn"
              onClick={() => go(-1)}
              disabled={!!turn}
              aria-label="Previous page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div className="pager__meta">
              <span className="pager__num">
                {String(page + 1).padStart(2, '0')}
                <i>/{String(booklet.pages.length).padStart(2, '0')}</i>
              </span>
              <span className="pager__label">{label}</span>
            </div>
            <button
              className="navbtn"
              onClick={() => go(1)}
              disabled={!!turn}
              aria-label="Next page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </footer>
      )}

      {inCatalogues && coverOpen && page === 0 && !turn && (
        <div className="hint">Drag left · or click to turn</div>
      )}
    </div>
  )
}
