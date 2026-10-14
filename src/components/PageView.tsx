import type { BookletTheme, PageSpec } from '../data/booklet'

type Props = {
  spec: PageSpec
  folio: number
  total: number
  theme: BookletTheme
}

function Micro({ children, pos }: { children: React.ReactNode; pos: string }) {
  return <span className={`micro micro--${pos}`}>{children}</span>
}

function Foot({ n, total }: { n: number; total: number }) {
  return (
    <div className="sheet__foot">
      <span>ANTRONI</span>
      <b>
        {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </b>
    </div>
  )
}

export default function PageView({ spec, folio, total, theme }: Props) {
  const variant =
    spec.kind === 'opening' || spec.kind === 'back' ? '' : ` v-${spec.variant}`
  // The running foot joins the text flow, never an absolute overlay, so it can
  // never land on top of the content. It appears only where there is PAPER
  // beneath it: the feature pages, and the text panel of the split plate.
  // Bleed and band pages run full-bleed photography — they already carry the
  // folio as a corner micro-label, and a foot there would cross the image.
  const hasFoot = spec.kind === 'feature'

  return (
    <div className={`sheet sheet--${theme} sheet-${spec.kind}${variant}${hasFoot ? ' sheet--hasfoot' : ''}`}>
      {/* ---------- opening ---------- */}
      {spec.kind === 'opening' && (
        <>
          <img className="opening__img" src={spec.image} alt={spec.alt} draggable={false} />
          <div className="opening__scrim" />
          <Micro pos="tl">{spec.kicker}</Micro>
          <Micro pos="tr">ANTRONI</Micro>
          <div className="opening__body">
            <h1 className="opening__title">{spec.title}</h1>
            <p className="opening__cn">{spec.cn}</p>
            <div className="opening__rule" />
            <p className="opening__lede">{spec.lede}</p>
            <p className="opening__sub">{spec.sub}</p>
          </div>
          <Micro pos="bl">CHAPITRE {String(folio).padStart(2, '0')}</Micro>
        </>
      )}

      {/* ---------- full: bleed ---------- */}
      {spec.kind === 'full' && spec.variant === 'bleed' && (
        <>
          <img
            className="full__img"
            src={spec.image}
            alt={spec.alt}
            style={spec.position ? { objectPosition: spec.position } : undefined}
            draggable={false}
          />
          <div className="full__scrim" />
          <Micro pos="tl">{spec.kicker}</Micro>
          <Micro pos="tr">{String(folio).padStart(2, '0')}</Micro>
          <div className="full__cap">
            <h2 className="display">{spec.caption}</h2>
            <p className="full__cn">{spec.captionCn}</p>
          </div>
        </>
      )}

      {/* ---------- full: split (plate + text panel) ---------- */}
      {spec.kind === 'full' && spec.variant === 'split' && (
        <>
          <div className="fullsplit">
            <img
              className="fullsplit__img"
              src={spec.image}
              alt={spec.alt}
              style={spec.position ? { objectPosition: spec.position } : undefined}
              draggable={false}
            />
            <div className="fullsplit__panel">
              <Micro pos="tl">{spec.kicker}</Micro>
              <div className="fullsplit__body">
                <span className="fullsplit__num">{String(folio).padStart(2, '0')}</span>
                <h2 className="display">{spec.caption}</h2>
                <p className="fullsplit__cn">{spec.captionCn}</p>
                <div className="fullsplit__rule" />
                {spec.note && <p className="fullsplit__note">{spec.note}</p>}
              </div>
              <Foot n={folio} total={total} />
            </div>
          </div>
        </>
      )}

      {/* ---------- full: band (caption across the image) ---------- */}
      {spec.kind === 'full' && spec.variant === 'band' && (
        <>
          <img
            className="full__img"
            src={spec.image}
            alt={spec.alt}
            style={spec.position ? { objectPosition: spec.position } : undefined}
            draggable={false}
          />
          <div className="full__scrim full__scrim--band" />
          <Micro pos="tl">{spec.kicker}</Micro>
          <Micro pos="tr">{String(folio).padStart(2, '0')}</Micro>
          <div className="band">
            <div className="band__text">
              <h2 className="display">{spec.caption}</h2>
              <p className="band__cn">{spec.captionCn}</p>
            </div>
            {spec.note && <p className="band__note">{spec.note}</p>}
          </div>
        </>
      )}

      {/* ---------- feature: left | right | stack ---------- */}
      {spec.kind === 'feature' && (
        <div className={`feature feature--${spec.variant}`}>
          <div className="feature__media">
            <img src={spec.image} alt={spec.alt} draggable={false} />
            <span className="feature__index">{spec.index}</span>
          </div>

          <div className="feature__text">
            <p className="kicker">{spec.kicker}</p>
            <h2 className="display">{spec.title}</h2>
            <p className="cn">{spec.titleCn}</p>
            <p className="lede">{spec.lede}</p>

            <dl className="specs">
              {spec.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ---------- principle: rows-right | rows-left ---------- */}
      {spec.kind === 'principle' && (
        <>
          <img className="principle__img" src={spec.image} alt={spec.alt} draggable={false} />
          <div className="principle__scrim" />
          <Micro pos="tl">{spec.kicker}</Micro>
          <Micro pos="tr">{spec.index}</Micro>

          <div className={`principle__body principle__body--${spec.variant}`}>
            <div className="principle__lead">
              <h2 className="display">{spec.title}</h2>
              <p className="cn">{spec.titleCn}</p>
              <p className="lede">{spec.lede}</p>
            </div>
            <dl className="rows">
              {spec.rows.map((r) => (
                <div key={r.term}>
                  <dt>{r.term}</dt>
                  <dd>{r.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      {/* ---------- back ---------- */}
      {spec.kind === 'back' && (
        <div className="back">
          <Micro pos="tl">ANTRONI · SHANGHAI</Micro>
          <div className="back__body">
            <p className="back__brand">{spec.brand}</p>
            <p className="back__cn">{spec.cn}</p>
            <div className="back__rule" />
            <p className="back__lines">
              {spec.lines[0]}
              <br />
              {spec.lines[1]}
            </p>
            <dl className="back__contact">
              {spec.contact.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Micro pos="br">{String(folio).padStart(2, '0')}</Micro>
        </div>
      )}

      {hasFoot && <Foot n={folio} total={total} />}
    </div>
  )
}
