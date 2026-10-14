import { useRef } from 'react'
import PageView from './PageView'
import type { Booklet, PageSpec } from '../data/booklet'

export type Layout = {
  pw: number
  ph: number
  wide: boolean
}

export type Turn = { dir: 1 | -1; progress: number }

type Props = {
  booklet: Booklet
  index: number
  turn: Turn | null
  layout: Layout
  entering: boolean
  onGrab: (x: number, y: number) => void
  onDrag: (x: number, y: number) => void
  onRelease: () => void
}

const LIFT = 1.2

export default function Book({
  booklet,
  index,
  turn,
  layout,
  entering,
  onGrab,
  onDrag,
  onRelease,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { pw, ph } = layout
  const { pages, theme } = booklet
  const n = pages.length

  const face = (i: number) =>
    i >= 0 && i < n ? { spec: pages[i], folio: i + 1 } : null

  const wrap = (i: number) => ((i % n) + n) % n

  const current = face(index)
  // the page underneath — wraps, so the first and last pages connect
  const dest = turn ? face(wrap(index + turn.dir)) : current

  const p = turn ? turn.progress : 0
  const back = turn?.dir === -1
  // forward: hinged on the left edge, swings left
  // backward: hinged on the right edge, swings right — a real reverse turn
  const angle = turn ? (back ? 1 : -1) * 180 * p : 0

  const render = (f: { spec: PageSpec; folio: number }) => (
    <PageView spec={f.spec} folio={f.folio} total={pages.length} theme={theme} />
  )

  return (
    <div className="bookwrap">
      <div className="bookwrap__inner" style={{ width: pw, height: ph }}>
        <div
          ref={ref}
          className={`book${entering ? ' is-entering' : ''}`}
          style={{ width: pw, height: ph }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId)
            onGrab(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => onDrag(e.clientX, e.clientY)}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture?.(e.pointerId)
            onRelease()
          }}
          onPointerCancel={onRelease}
        >
          {dest && (
            <div className="page" style={{ width: pw, height: ph }}>
              {render(dest)}
              {turn && (
                <div
                  className={`page__cast${back ? ' page__cast--flip' : ''}`}
                  style={{ ['--cast' as string]: p }}
                />
              )}
            </div>
          )}

          {turn && current && (
            <div
              className="leaf"
              style={{
                width: pw,
                height: ph,
                transform: `translateZ(${LIFT}px) rotateY(${angle}deg)`,
                transformOrigin: back ? '100% 50%' : '0% 50%',
                ['--p' as string]: p,
                ['--gutter-dir' as string]: back ? 'left' : 'right',
                ['--sheen-dir' as string]: back ? 'right' : 'left',
              }}
            >
              <div className="leaf__face leaf__face--front">
                {render(current)}
                <div className="leaf__shade leaf__shade--gutter" />
                <div className="leaf__shade leaf__shade--ambient" />
              </div>
              <div className="leaf__face leaf__face--back">
                {render(dest!)}
                <div className="leaf__shade leaf__shade--gutter" />
                <div className="leaf__shade leaf__shade--ambient" />
              </div>
            </div>
          )}

          <div className="book__pool" />
        </div>
      </div>
    </div>
  )
}
