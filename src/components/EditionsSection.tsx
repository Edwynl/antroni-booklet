import { useCallback, useEffect, useRef, useState } from 'react'
import { EDITIONS } from '../data/editions'

/* Every plate set gets its own layout — hero, grid, column, strip, duo and
   stagger never repeat back to back, so the section reads as a sequence of
   different spreads rather than one template applied nine times.

   Clicking any plate opens it full size with the rest of its own group
   available as a filmstrip underneath. */

type Flat = {
  src: string
  title: string
  cn: string
  w: number
  h: number
  g: number
  at: number
}

const FLAT: Flat[] = EDITIONS.flatMap((g, gi) =>
  g.items.map((it, at) => ({ ...it, g: gi, at })),
)

function useLightbox() {
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

  return { open, setOpen, close, step }
}

function Plate({
  item,
  index,
  onOpen,
  variant,
}: {
  item: Flat
  index: number
  onOpen: (i: number) => void
  variant: string
}) {
  return (
    <button
      className={`ed__cell ed__cell--${variant}`}
      style={{ aspectRatio: `${item.w} / ${item.h}` }}
      onClick={() => onOpen(index)}
      aria-label={`${item.title}${item.cn ? ` ${item.cn}` : ''}`}
    >
      <img
        src={item.src}
        width={item.w}
        height={item.h}
        loading="lazy"
        decoding="async"
        alt={`ANTRONI ${item.title}`}
      />
      <span className="ed__cap">
        <b>{item.title}</b>
        {item.cn && <i>{item.cn}</i>}
      </span>
      <span className="ed__zoom" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
        </svg>
      </span>
    </button>
  )
}

export default function EditionsSection() {
  const { open, setOpen, close, step } = useLightbox()
  const shown = open === null ? null : FLAT[open]
  const group = shown ? EDITIONS[shown.g] : null
  const stripRef = useRef<HTMLDivElement>(null)

  /* keep the active thumbnail in view when stepping with the keyboard */
  useEffect(() => {
    if (open === null || !stripRef.current) return
    const el = stripRef.current.querySelector('[data-on="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [open])

  return (
    <section className="panel panel--editions">
      <header className="panel__head">
        <p className="kicker">LES ÉDITIONS</p>
        <h2 className="panel__title">
          In Print
          <em>印刷成品 · 方向与版面</em>
        </h2>
        <p className="panel__lede">
          Five aesthetic directions, then the plate sets they grew into — newest
          volume first. Every plate opens full size.
        </p>
      </header>

      {EDITIONS.map((g, gi) => (
        <section className={`ed ed--${g.layout}`} key={g.folder}>
          <header className="ed__head">
            <span className="ed__n">{g.label}</span>
            {g.cn && <span className="ed__cn">{g.cn}</span>}
            <span className="ed__count">
              {g.items.length} {g.items.length === 1 ? 'plate' : 'plates'}
            </span>
          </header>

          <div className="ed__grid">
            {g.items.map((it, at) => (
              <Plate
                key={it.src}
                item={{ ...it, g: gi, at }}
                index={offsetOf(gi, at)}
                onOpen={setOpen}
                variant={g.layout}
              />
            ))}
          </div>
        </section>
      ))}

      {shown && group && (
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
            <img
              key={shown.src}
              src={shown.src}
              width={shown.w}
              height={shown.h}
              alt={shown.title}
            />
            <figcaption className="lightbox__cap">
              <span>{group.label}</span>
              <b>{shown.title}</b>
              {shown.cn && <em>{shown.cn}</em>}
              <i>
                {String((open ?? 0) + 1).padStart(2, '0')} /{' '}
                {String(FLAT.length).padStart(2, '0')}
              </i>
            </figcaption>

            {/* the rest of this group, one click away */}
            <div className="lightbox__strip" ref={stripRef} onClick={(e) => e.stopPropagation()}>
              {group.items.map((it, at) => {
                const idx = offsetOf(shown.g, at)
                const on = idx === open
                return (
                  <button
                    key={it.src}
                    data-on={on}
                    className={`lightbox__thumb${on ? ' is-on' : ''}`}
                    style={{ aspectRatio: `${it.w} / ${it.h}` }}
                    onClick={() => setOpen(idx)}
                    aria-label={it.title}
                  >
                    <img src={it.src} width={it.w} height={it.h} alt="" />
                  </button>
                )
              })}
            </div>
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

/* flat index of the nth plate of group g */
function offsetOf(g: number, at: number): number {
  let n = 0
  for (let i = 0; i < g; i++) n += EDITIONS[i].items.length
  return n + at
}