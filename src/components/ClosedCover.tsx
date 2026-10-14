type Props = {
  pw: number
  ph: number
  cover: string
  code: string
  title: string
  cn: string
  opening: boolean
  onOpen: () => void
}

export default function ClosedCover({
  pw,
  ph,
  cover,
  code,
  title,
  cn,
  opening,
  onOpen,
}: Props) {
  return (
    <div className="bookwrap">
      <div className="bookwrap__inner" style={{ width: pw, height: ph }}>
        <button
          type="button"
          className={`closed closed--${code.replace('+', '')}${opening ? ' is-opening' : ''}`}
          style={{ width: pw, height: ph }}
          onClick={opening ? undefined : onOpen}
          disabled={opening}
          aria-label="打开图册"
        >
          <span className="closed__cover">
            <img src={cover} alt={`${code} ${title}`} draggable={false} />
            <span className="closed__scrim" />

            <span className="closed__micro closed__micro--tl">ANTRONI</span>
            <span className="closed__micro closed__micro--tr">{code}</span>

            <span className="closed__body">
              <h1 className="closed__title">{title}</h1>
              <p className="closed__cn">{cn}</p>
              <span className="closed__rule" />
              <span className="closed__foot">
                <span>Shanghai · China</span>
                <span className="closed__cta">Open</span>
              </span>
            </span>

            <span className="closed__micro closed__micro--br">{code} — Volume</span>
          </span>
        </button>
      </div>
    </div>
  )
}
