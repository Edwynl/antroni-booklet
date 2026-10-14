import { useState } from 'react'

/* ------------------------------------------------------------------ *
 * The phone screens are real DOM, not flat images: they stay crisp at
 * any size, and the proportion tool actually runs.
 * ------------------------------------------------------------------ */

function Status({ time = '9:41', right = '5G  ▮' }: { time?: string; right?: string }) {
  return (
    <div className="ui__status">
      <b>ANTRONI</b>
      <span>
        {time} · {right}
      </span>
    </div>
  )
}

function Notched({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="ui" aria-label={label}>
      <span className="ui__notch" />
      <div className="ui__screen">{children}</div>
      <span className="ui__bar" />
    </div>
  )
}

function TabBar({ on = 0 }: { on?: number }) {
  return (
    <div className="ui__tabbar">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i === on ? 'is-on' : ''} />
      ))}
    </div>
  )
}

function UiCatalogue() {
  const rows = [
    { code: 'S+85', name: '铝木系列地轴平开门', img: '/images/01-cover-arched-pivot-door.webp' },
    { code: 'S150', name: '全景平移门', img: '/images/05-panoramic-sliding-door.webp' },
    { code: 'CW', name: '幕墙 · 立面系统', img: '/images/20-facade-grid.webp' },
    { code: 'S+123', name: '木作系统', img: '/images/12-door-edge-joint.webp' },
  ]
  return (
    <Notched label="Catalogue screen">
      <Status />
      <img className="ui__hero" src="/images/13-entrance-hall.webp" alt="" />
      <div className="ui__body">
        <span className="ui__kicker">SYSTEMS · 04</span>
        <ul className="ui__rows">
          {rows.map((r) => (
            <li key={r.code}>
              <img src={r.img} alt="" />
              <b>{r.code}</b>
              <span>{r.name}</span>
            </li>
          ))}
        </ul>
        <p className="ui__note">窗与门系统级解决方案。每一樘均按洞口比例定制。</p>
        <TabBar on={0} />
      </div>
    </Notched>
  )
}

function UiSpec() {
  const specs: [string, string][] = [
    ['Opening', 'Vertical pivot'],
    ['Outer shell', 'Bronze anodised'],
    ['Core', 'Timber composite'],
    ['Max. leaf', '≤ 2400 mm'],
    ['Seal', 'Triple gasket'],
  ]
  return (
    <Notched label="Specification screen">
      <Status />
      <img className="ui__hero" src="/images/12-door-edge-joint.webp" alt="" />
      <div className="ui__body">
        <span className="ui__kicker">S+85 · FICHE TECHNIQUE</span>
        <dl className="ui__spec">
          {specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="ui__gallery">
          <img src="/images/11-pivot-door-interior-wide.webp" alt="" />
          <img src="/images/14-handle-operation.webp" alt="" />
          <img src="/images/03-brass-hardware-macro.webp" alt="" />
        </div>
        <div className="ui__price">
          <b>Sur devis</b>
          <span>按洞口计价</span>
        </div>
        <TabBar on={1} />
      </div>
    </Notched>
  )
}

function UiProportion() {
  const [w, setW] = useState(2400)
  const r = w / 2
  const h = Math.round(w * 1.618)
  const boxH = 190
  const scale = boxH / (h + 30)
  const svgW = Math.round(w * scale)
  const svgR = Math.round(r * scale)

  return (
    <Notched label="Proportion tool screen">
      <Status />
      <div className="ui__body ui__body--tool">
        <span className="ui__kicker">MESURE · PROPORTION</span>

        <div className="ui__diagram">
          <svg viewBox={`0 0 ${svgW} ${boxH}`} width="100%" height={boxH}>
            <line x1={svgW / 2} y1="4" x2={svgW / 2} y2={boxH - 4} className="ui__axis" />
            <path
              d={`M1 ${boxH} V${boxH - svgR} A${svgR} ${svgR} 0 0 1 ${svgW - 1} ${
                boxH - svgR
              } V${boxH} Z`}
              className="ui__arch"
            />
            <line x1="1" y1={boxH - svgR} x2={svgW - 1} y2={boxH - svgR} className="ui__rule" />
          </svg>
        </div>

        <output className="ui__readout">
          <b>{w}</b>
          <span>mm opening</span>
        </output>

        <input
          className="ui__slider"
          type="range"
          min={1200}
          max={3600}
          step={20}
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          aria-label="Opening width in millimetres"
        />

        <dl className="ui__mini">
          <div>
            <dt>Radius</dt>
            <dd>{Math.round(r)}</dd>
          </div>
          <div>
            <dt>Height</dt>
            <dd>{h}</dd>
          </div>
          <div>
            <dt>Ratio</dt>
            <dd>1:1.618</dd>
          </div>
        </dl>

        <dl className="ui__mini">
          <div>
            <dt>Panels</dt>
            <dd>{Math.max(2, Math.round(w / 900))}</dd>
          </div>
          <div>
            <dt>Mullion</dt>
            <dd>≤ 28</dd>
          </div>
          <div>
            <dt>Seam</dt>
            <dd>3 mm</dd>
          </div>
        </dl>
        <TabBar on={2} />
      </div>
    </Notched>
  )
}

function UiBooking() {
  return (
    <Notched label="Consultation screen">
      <Status />
      <img className="ui__hero ui__hero--short" src="/images/10-villa-exterior-dusk.webp" alt="" />
      <div className="ui__body">
        <span className="ui__kicker">RENDEZ-VOUS</span>
        <ul className="ui__steps">
          {['Adresse', 'Système', 'Créneau'].map((s, i) => (
            <li key={s} className={i === 1 ? 'is-on' : ''}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </li>
          ))}
        </ul>

        <div className="ui__field">
          <label>Système</label>
          <span />
        </div>
        <div className="ui__field">
          <label>Largeur d’ouverture</label>
          <span />
        </div>

        <p className="ui__note">带上样品上门，现场比对材质与光。</p>
        <button className="ui__cta" tabIndex={-1}>
          Réserver
        </button>
      </div>
    </Notched>
  )
}

const SCREENS = [
  {
    C: UiCatalogue,
    kicker: 'ACCUEIL',
    title: 'Catalogue',
    cn: '产品目录',
    note: 'Four systems, one photograph per row, never a carousel. Status bar and tab bar carry the same restraint as the page.',
  },
  {
    C: UiSpec,
    kicker: 'FICHE',
    title: 'Specification',
    cn: '产品参数',
    note: 'Five spec rows, a three-up detail gallery, then price on demand. The numbers a specifier needs, in the order they ask.',
  },
  {
    C: UiProportion,
    kicker: 'MESURE',
    title: 'Proportion Tool',
    cn: '比例工具',
    note: 'Drag the opening width: the arch redraws and radius, height, panel count and mullion all resolve live.',
  },
  {
    C: UiBooking,
    kicker: 'RENDEZ-VOUS',
    title: 'Consultation',
    cn: '预约沟通',
    note: 'Three steps, three labelled fields, one button. Everything else happens in the room, with the samples.',
  },
]

export default function MobileSection() {
  return (
    <section className="panel panel--mobile">
      <header className="panel__head">
        <p className="kicker">L’APPLICATION</p>
        <h2 className="panel__title">
          In the Client&rsquo;s Hand
          <em>手机端界面</em>
        </h2>
        <p className="panel__lede">
          The catalogue is a physical object, but the first contact is a phone. These four screens are
          live components, not mockups — the proportion tool runs. One image, one decision, no
          carousel.
        </p>
      </header>

      <div className="phones">
        {SCREENS.map(({ C, kicker, title, cn, note }) => (
          <figure className="phone" key={title}>
            <div className="phone__frame">
              <C />
            </div>
            <figcaption>
              <span className="phone__kicker">{kicker}</span>
              <h3>{title}</h3>
              <span className="phone__cn">{cn}</span>
              <p>{note}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
