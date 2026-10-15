import { useCallback, useEffect, useState } from 'react'
import { EDITIONS } from '../data/editions'

/* The printed editions, newest folder first (5 -> 1). Every group shares one
   aspect ratio, so each grid cell can reserve the real box and nothing shifts
   as the lazy images arrive. Clicking a plate opens it full size. */

type Flat = {
  src: string
  title: string
  w: number
  h: number
  folder: string
  at: number
}

const FLAT: Flat[] = EDITIONS.flatMap((g) =>
  g.items.map((it, at) => ({ ...it, folder: g.folder, at })),
)

export default function EditionsSection() {
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: 1 | -1) => {
    setOpen((i) => (i === null ? null : (i + d + FLAT.length) % FLAT.length))
  }, [])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, step])

  const shown = open === null ? null : FLAT[open]

  return (
    <section className="panel panel--editions">
      <header className="panel__head">
        <p className="kicker">LES ÉDITIONS</p>
        <h2 className="panel__title">
          In Print
          <em>印刷成品 · 五个版本</em>
        </h2>
        <p className="panel__lede">
          The screen booklets were cut from the same drawings as the printed ones. These are the
          printed editions themselves — covers, spreads and editorial grids, listed newest
          volume first. Select any plate to read it full size.
        </p>
      </header>

      {EDITIONS.map((g) => (
        <section className="ed" key={g.folder}>
          <header className="ed__head">
            <span className="ed__n">{g.folder}</span>
            <span className="ed__label">Edition {g.folder}</span>
            <span className="ed__count">
              {g.items.length} {g.items.length === 1 ? 'plate' : 'plates'}
            </span>
          </header>

          <div className="ed__grid">
            {g.items.map((it, at) => (
                <button
                  className="ed__cell"
                  key={it.src}
                  style={{ aspectRatio: `${it.w} / ${it.h}` }}
                  onClick={() => {
                    const i = FLAT.findIndex(
                      (f) => f.folder === g.folder && f.at === at,
                    )
                    setOpen(i)
                  }}
                  aria-label={`Edition ${g.folder}, plate ${it.title}`}
                >
                  <img
                    src={it.src}
                    width={it.w}
                    height={it.h}
                    loading="lazy"
                    decoding="async"
                    alt={`ANTRONI printed edition ${g.folder}, plate ${it.title}`}
                  />
                  <span className="ed__cap">{it.title}</span>
                </button>
            ))}
          </div>
        </section>
      ))}

      {shown && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox__x" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
            aria-label="Previous plate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <figure className="lightbox__fig" onClick={(e) => e.stopPropagation()}>
            <img src={shown.src} width={shown.w} height={shown.h} alt={shown.title} />
            <figcaption className="lightbox__cap">
              <span>Edition {shown.folder}</span>
              <b>{shown.title}</b>
              <i>
                {String((open ?? 0) + 1).padStart(2, '0')} / {String(FLAT.length).padStart(2, '0')}
              </i>
            </figcaption>
          </figure>

          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
            aria-label="Next plate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}