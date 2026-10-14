import { useState } from 'react'
import { BRAND_CHAPTERS } from '../data/brand'

/* NB: these classes are prefixed `bp__` on purpose. The catalogue pages
   already own `.principle__body` / `.principle__head` / `.principle__cn`
   with completely different box models — sharing the names made the panel
   text inherit `position:absolute` and escape the list. */

const PLATES: Record<string, { src: string; alt: string; cap: string }> = {
  '01': { src: '/images/07-french-arch-geometry.webp', alt: 'French arch opening in limestone', cap: 'Arch geometry' },
  '02': { src: '/images/13-entrance-hall.webp', alt: 'Entrance hall with a monumental pivot door', cap: 'Clear opening' },
  '03': { src: '/images/14-handle-operation.webp', alt: 'Hand operating a solid bronze lever', cap: 'Closing point' },
  '04': { src: '/images/12-door-edge-joint.webp', alt: 'Composite door edge with a shadow seam', cap: 'Shadow seam' },
  '05': { src: '/images/16-glass-corner.webp', alt: 'Frameless glass corner', cap: 'No ornament' },
  '06': { src: '/images/02-aluminium-wood-pivot-door.webp', alt: 'Aluminium and timber door', cap: 'Two materials' },
  '07': { src: '/images/17-threshold-track.webp', alt: 'Flush sliding door threshold', cap: 'Flush threshold' },
  '08': { src: '/images/21-facade-water.webp', alt: 'Facade reflected in a still pool', cap: 'Water path' },
  '09': { src: '/images/09-profile-section-macro.webp', alt: 'Profile sections with thermal break', cap: 'Thermal break' },
  '10': { src: '/images/04-hardware-still-life.webp', alt: 'Bronze hardware on dark stone', cap: 'Serviceable parts' },
}

export default function BrandSection() {
  const [ci, setCi] = useState(0)
  const chapter = BRAND_CHAPTERS[ci]
  const [open, setOpen] = useState<string | null>(BRAND_CHAPTERS[0].principles[0].index)

  return (
    <section className="panel panel--brand">
      <header className="panel__head">
        <p className="kicker">{chapter.kicker}</p>
        <h2 className="panel__title">
          {chapter.title}
          <em>{BRAND_CHAPTERS.map((c) => c.label).join(' · ')}</em>
        </h2>
        <p className="panel__lede">{chapter.lede}</p>

        <div className="panel__tabs">
          {BRAND_CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              className={`tab${i === ci ? ' is-on' : ''}`}
              onClick={() => {
                setCi(i)
                setOpen(BRAND_CHAPTERS[i].principles[0].index)
              }}
            >
              <span className="tab__n">{String(i + 1).padStart(2, '0')}</span>
              {c.label}
            </button>
          ))}
        </div>
      </header>

      <ol className="bp">
        {chapter.principles.map((p) => {
          const isOpen = open === p.index
          const plate = PLATES[p.index]
          return (
            <li className={`bp__item${isOpen ? ' is-open' : ''}`} key={p.index}>
              <button
                className="bp__head"
                onClick={() => setOpen(isOpen ? null : p.index)}
                aria-expanded={isOpen}
              >
                <span className="bp__index">{p.index}</span>
                <span className="bp__kicker">{p.kicker}</span>
                <span className="bp__title">{p.title}</span>
                <span className="bp__cn">{p.cn}</span>
                <span className="bp__chev" aria-hidden />
              </button>

              <div className="bp__panel" hidden={!isOpen}>
                <figure className="bp__plate">
                  <img src={plate.src} alt={plate.alt} loading="lazy" draggable={false} />
                  <figcaption>{plate.cap}</figcaption>
                </figure>

                <div className="bp__text">
                  <p className="bp__lede">{p.lede}</p>
                  <p className="bp__prose">{p.body}</p>
                </div>

                <dl className="bp__metrics">
                  {p.metrics.map((m) => (
                    <div key={m.label}>
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
