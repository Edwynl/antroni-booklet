export type PageSpec =
  | {
      kind: 'opening'
      image: string
      alt: string
      kicker: string
      title: string
      cn: string
      lede: string
      sub: string
    }
  | {
      kind: 'full'
      /** bleed | split | band — never the same variant twice in one booklet */
      variant: 'bleed' | 'split' | 'band'
      image: string
      alt: string
      kicker: string
      caption: string
      captionCn: string
      /** split only: the second plate */
      image2?: string
      alt2?: string
      note?: string
      position?: string
    }
  | {
      kind: 'feature'
      /** left | right | stack — never the same variant twice in one booklet */
      variant: 'left' | 'right' | 'stack'
      image: string
      alt: string
      index: string
      kicker: string
      title: string
      titleCn: string
      lede: string
      specs: { label: string; value: string }[]
    }
  | {
      kind: 'principle'
      /** rows-right | rows-left — never the same variant twice in one booklet */
      variant: 'rows-right' | 'rows-left'
      image: string
      alt: string
      index: string
      kicker: string
      title: string
      titleCn: string
      lede: string
      rows: { term: string; label: string }[]
    }
  | {
      kind: 'back'
      brand: string
      cn: string
      lines: string[]
      contact: { label: string; value: string }[]
    }

export type BookletTheme = 'classic' | 'noir' | 'technical'

export type Booklet = {
  id: string
  code: string
  title: string
  titleCn: string
  tagline: string
  cover: string
  /** width / height */
  ratio: number
  theme: BookletTheme
  pages: PageSpec[]
}

const back = (): PageSpec => ({
  kind: 'back',
  brand: 'ANTRONI',
  cn: '安窗义门窗',
  lines: ['Dedicated to Residential', 'Window and Door Systems'],
  contact: [
    { label: 'Studio', value: 'SHANGHAI · CHINA' },
    { label: 'Instagram', value: '@antroni_shanghai' },
  ],
})

/* Layout sequence per booklet — no two pages share a layout:
   S+85  bleed · left · rows-right · split · stack · band · right
   S150  stack · bleed · rows-left · split · left · band
   CW    stack · bleed · rows-left · split · right · band · left           */

/* ------------------------------------------------------------------ *
 * 01 — S+85 · bone paper, Didone display, hairline grid. 16:9.
 * ------------------------------------------------------------------ */

const S85: Booklet = {
  id: 's85',
  code: 'S+85',
  title: 'Pivot French Door',
  titleCn: '铝木系列地轴平开门',
  tagline: 'LE PROPORTION',
  cover: '/images/02-aluminium-wood-pivot-door.webp',
  ratio: 16 / 9,
  theme: 'classic',
  pages: [
    {
      kind: 'opening',
      image: '/images/13-entrance-hall.webp',
      alt: 'Classical entrance hall with a monumental arched pivot door',
      kicker: 'CHAPITRE I — L’ENTRÉE',
      title: 'The Pivot\nFrench Door',
      cn: '天地轴开启',
      lede:
        'A door that clears its own opening. The leaf turns on a vertical floor-and-head axis, so nothing interrupts the width of the entrance.',
      sub: 'Aluminium–Wood Composite · Solid Steel Hardware',
    },
    {
      kind: 'full',
      variant: 'bleed',
      image: '/images/03-brass-hardware-macro.webp',
      alt: 'Macro detail of solid steel locking hardware',
      kicker: 'LA FERMETURE',
      caption: 'Solid Steel',
      captionCn: '纯钢五金',
    },
    {
      kind: 'feature',
      variant: 'left',
      image: '/images/01-cover-arched-pivot-door.webp',
      alt: 'Arched pivot door in dark bronze with warm interior light',
      index: '01',
      kicker: 'LE SYSTÈME',
      title: 'Sized by\nthe Opening',
      titleCn: '以洞口定尺',
      lede:
        'The proportions of the opening decide the size of the leaf — not the other way round. A bronze-anodised aluminium shell takes the wind load; a solid timber core takes the touch.',
      specs: [
        { label: 'Opening', value: 'Vertical pivot axis' },
        { label: 'Outer shell', value: 'Aluminium, bronze anodised' },
        { label: 'Core', value: 'Solid timber composite' },
        { label: 'Max. leaf', value: '≤ 2400 mm' },
      ],
    },
    {
      kind: 'principle',
      variant: 'rows-right',
      image: '/images/07-french-arch-geometry.webp',
      alt: 'French arch opening cut into limestone',
      index: '02',
      kicker: 'LE PROPORTION',
      title: 'Proportion\nas Structure',
      titleCn: '法式比例',
      lede:
        'Proportion is not decoration. The ratio of an arch decides the rhythm of a facade, and the density of a grid decides how daylight enters a room.',
      rows: [
        { term: '3 : 4', label: 'Standard panel' },
        { term: '1 : 1.618', label: 'Golden division' },
        { term: '7 : 10', label: 'Arch height to width' },
      ],
    },
    {
      kind: 'full',
      variant: 'split',
      image: '/images/11-pivot-door-interior-wide.webp',
      alt: 'Full-height arched pivot door standing open in a classical interior',
      kicker: 'PLEIN HAUT',
      caption: 'Full-Height\nOpening',
      captionCn: '通高开启',
      note: 'The leaf clears the full height of the opening, so the hall reads as one continuous plane from floor to cornice.',
    },
    {
      kind: 'feature',
      variant: 'stack',
      image: '/images/12-door-edge-joint.webp',
      alt: 'Composite door edge joint with a continuous shadow gap',
      index: '03',
      kicker: 'L’ASSEMBLAGE',
      title: 'One\nShadow Seam',
      titleCn: '一条阴影缝',
      lede:
        'Aluminium and timber are mechanically interlocked, with a continuous gap left between them. Light lands in the gap, and the two materials acquire an edge.',
      specs: [
        { label: 'Connection', value: 'Mechanical interlock' },
        { label: 'Shadow seam', value: '3 mm continuous' },
        { label: 'Finish', value: 'Bronze anodised' },
        { label: 'Exposure class', value: 'C4 coastal' },
      ],
    },
    {
      kind: 'full',
      variant: 'band',
      image: '/images/04-hardware-still-life.webp',
      alt: 'Bronze hardware components arranged on dark stone',
      kicker: 'LA FERMETURE',
      caption: 'Serviceable\nby Design',
      captionCn: '可维护的五金',
      note: 'Every component is reached from inside the reveal. Nothing on this leaf has to be removed in order to be replaced.',
    },
    {
      kind: 'feature',
      variant: 'right',
      image: '/images/14-handle-operation.webp',
      alt: 'Hand operating a solid bronze lever on a dark bronze door',
      index: '04',
      kicker: 'LA FERMETURE',
      title: 'The Sound\nof Closing',
      titleCn: '关得下去的那一声',
      lede:
        'Locking bolts, hinges and levers are solid steel. Heavier than die-cast aluminium, they close all the way — and that dull note is the only introduction a good door ever gives.',
      specs: [
        { label: 'Material', value: 'Solid steel, bronze' },
        { label: 'Locking', value: 'Multi-point' },
        { label: 'Lever', value: 'Forged, not cast' },
        { label: 'Service interval', value: '≥ 5 years' },
      ],
    },
    back(),
  ],
}

/* ------------------------------------------------------------------ *
 * 02 — S+150 · deep chocolate, cream and gold. 4:5.
 * ------------------------------------------------------------------ */

const S150: Booklet = {
  id: 's150',
  code: 'S150',
  title: 'Panoramic Sliding',
  titleCn: '全景平移门',
  tagline: 'LE MUR DISPARAÎT',
  cover: '/images/05-panoramic-sliding-door.webp',
  ratio: 4 / 5,
  theme: 'noir',
  pages: [
    {
      kind: 'opening',
      image: '/images/18-sliding-dusk.webp',
      alt: 'Large sliding glass wall on a terrace at dusk',
      kicker: 'CHAPITRE II — LA VUE',
      title: 'The Wall\nYou Can Push',
      cn: '把墙推开',
      lede:
        'The sliding leaf retracts completely into the wall. No frame, no track and no hardware remain in the opening — indoors and out, the view is the same composition.',
      sub: 'Panoramic Sliding · Low-E Laminated',
    },
    {
      kind: 'feature',
      variant: 'stack',
      image: '/images/05-panoramic-sliding-door.webp',
      alt: 'Panoramic sliding door reflecting the garden',
      index: '01',
      kicker: 'LA VUE',
      title: 'Nothing\nBut the View',
      titleCn: '视野即景深',
      lede:
        'The frame is reduced until only the landscape remains. Leaves slide in parallel without taking floor area, and an opening of up to six metres makes the room and the garden one space.',
      specs: [
        { label: 'Opening', value: 'Parallel sliding' },
        { label: 'Visual frame', value: '≤ 28 mm' },
        { label: 'Glazing', value: 'Low-E laminated' },
        { label: 'Max. opening', value: '≤ 6000 mm' },
      ],
    },
    {
      kind: 'full',
      variant: 'bleed',
      image: '/images/19-poolside.webp',
      alt: 'Poolside terrace with the sliding wall fully retracted',
      kicker: 'À L’HEURE DORÉE',
      caption: 'The Wall\nDisappears',
      captionCn: '把墙推开',
    },
    {
      kind: 'principle',
      variant: 'rows-left',
      image: '/images/16-glass-corner.webp',
      alt: 'Frameless structural glass corner with an olive tree outside',
      index: '02',
      kicker: 'L’ANGLE',
      title: 'A Corner\nWithout a Post',
      titleCn: '无框转角',
      lede:
        'Two panes of glass meet at a joint that is almost not there. With no mullion, the eye carries on past the corner — and the edge of the room moves outdoors.',
      rows: [
        { term: '0 mm', label: 'Visible joint' },
        { term: '6000 mm', label: 'Maximum opening' },
        { term: '≤ 28 mm', label: 'Visual frame' },
      ],
    },
    {
      kind: 'full',
      variant: 'split',
      image: '/images/15-sliding-pocket.webp',
      alt: 'Sliding leaf fully retracted into a concealed wall pocket',
      kicker: 'DANS LE MUR',
      caption: 'Concealed\nin the Wall',
      captionCn: '隐于墙中',
      note: 'The leaves stack inside a thickened wall build-up. Open, the opening is a frameless rectangle of glass and nothing else.',
    },
    {
      kind: 'feature',
      variant: 'left',
      image: '/images/17-threshold-track.webp',
      alt: 'Ultra-low sliding door threshold flush with limestone paving',
      index: '03',
      kicker: 'LE SEUIL',
      title: 'No\nThreshold',
      titleCn: '没有坎',
      lede:
        'The track sits flush with the stone and the bottom rail disappears into the joint. A wheelchair, a trolley, bare feet — none of them stop at this line.',
      specs: [
        { label: 'Track', value: '≤ 8 mm, flush' },
        { label: 'Seal', value: 'Twin brush, airtight' },
        { label: 'Drainage', value: 'Concealed channel' },
        { label: 'Capacity', value: '≤ 180 kg / leaf' },
      ],
    },
    {
      kind: 'full',
      variant: 'band',
      image: '/images/08-dark-luxury-interior.webp',
      alt: 'Dark interior with tall arched windows',
      kicker: 'APRÈS LA CHUTE DU JOUR',
      caption: 'After Dark',
      captionCn: '夜间',
      note: 'At night the same opening reads in reverse: the interior becomes the light source and the glass disappears against it.',
    },
    back(),
  ],
}

/* ------------------------------------------------------------------ *
 * 03 — CW · cool white, precise grid, spec type. 1:1.
 * ------------------------------------------------------------------ */

const CW: Booklet = {
  id: 'cw',
  code: 'CW',
  title: 'Curtain Wall',
  titleCn: '幕墙 · 立面系统',
  tagline: 'LA GRILLE',
  cover: '/images/20-facade-grid.webp',
  ratio: 1,
  theme: 'technical',
  pages: [
    {
      kind: 'opening',
      image: '/images/06-curtain-wall-facade.webp',
      alt: 'Residential curtain wall facade with bronze mullions',
      kicker: 'CHAPITRE III — LA GRILLE',
      title: 'Proportion\nas Structure',
      cn: '比例即立面',
      lede:
        'A facade is not a skin applied to a building. The spacing of mullions decides both the rhythm of the elevation and what the building will look like in ten years.',
      sub: 'Unitised Curtain Wall · Thermally Broken',
    },
    {
      kind: 'feature',
      variant: 'stack',
      image: '/images/20-facade-grid.webp',
      alt: 'Curtain wall grid with slim bronze mullions',
      index: '01',
      kicker: 'LA GRILLE',
      title: 'Spacing\nIs Rhythm',
      titleCn: '间距即节奏',
      lede:
        'Three standard modules — 1200, 1500 and 1800. Every division of the elevation grows out of the same set of numbers, so the facade stays legible across the whole building.',
      specs: [
        { label: 'Modules', value: '1200 / 1500 / 1800' },
        { label: 'Mullion', value: 'Aluminium, bronze anodised' },
        { label: 'Opening', value: 'Awning, concealed handle' },
        { label: 'Wind load', value: '≤ 4.0 kPa' },
      ],
    },
    {
      kind: 'full',
      variant: 'bleed',
      image: '/images/21-facade-water.webp',
      alt: 'Facade reflected in a still reflecting pool',
      kicker: 'LE REFLET',
      caption: 'Reflection',
      captionCn: '水面倒影',
    },
    {
      kind: 'principle',
      variant: 'rows-left',
      image: '/images/09-profile-section-macro.webp',
      alt: 'Aluminium profile sections with a thermal break',
      index: '02',
      kicker: 'LE PROFILÉ',
      title: 'Thirty\nMillimetres',
      titleCn: '30mm 隔热断桥',
      lede:
        'A multi-chamber extrusion interrupted by a thermal break holds the difference between inside and outside in thirty millimetres of aluminium. The section is not a hidden part — it is the running cost of the building.',
      rows: [
        { term: '30 mm', label: 'Thermal break' },
        { term: '6 cavities', label: 'Multi-chamber' },
        { term: '≤ 1.8', label: 'W/(m²·K)' },
      ],
    },
    {
      kind: 'full',
      variant: 'split',
      image: '/images/10-villa-exterior-dusk.webp',
      alt: 'Residential facade at dusk with warm interior light',
      kicker: 'LA LIVRAISON',
      caption: 'Delivered',
      captionCn: '落地交付',
      note: 'Delivered as a complete system: grid, opening, drainage and junction drawn to the same set of modules.',
    },
    {
      kind: 'feature',
      variant: 'right',
      image: '/images/22-facade-corner.webp',
      alt: 'Facade corner with mitred bronze joints',
      index: '03',
      kicker: 'L’ANGLE',
      title: 'Four\nQuadrants',
      titleCn: '转角收口',
      lede:
        'At the corner, every profile meets at an exact forty-five degree mitre with a joint held under three millimetres. It reads as one continuous wall, and is in fact four independently replaceable units.',
      specs: [
        { label: 'Return', value: '45° mitred' },
        { label: 'Joint', value: '≤ 3 mm' },
        { label: 'Unit size', value: '≤ 1500 × 3600 mm' },
        { label: 'Replacement', value: 'Single unit' },
      ],
    },
    {
      kind: 'full',
      variant: 'band',
      image: '/images/23-panel-install.webp',
      alt: 'Unitised curtain wall panel being lifted into place',
      kicker: 'LE CHANTIER',
      caption: 'Unitised\nInstallation',
      captionCn: '单元式安装',
      note: 'Each unit is glazed and sealed in the workshop, then craned into place and fixed from the interior.',
    },
    {
      kind: 'feature',
      variant: 'left',
      image: '/images/24-stone-glass-junction.webp',
      alt: 'Shadow gap junction between stone and bronze glazing',
      index: '04',
      kicker: 'LA JONCTION',
      title: 'Eight\nMillimetres',
      titleCn: '石材交接',
      lede:
        'Where stone meets glass, one eight-millimetre shadow gap is all that remains. Each material does its own work, and the junction is not decoration — it is simply shadow.',
      specs: [
        { label: 'Reveal', value: '8 mm shadow gap' },
        { label: 'Stone', value: 'Fine-grain limestone' },
        { label: 'Sealant', value: 'Two-part, weather rated' },
        { label: 'Drainage', value: 'Twin path' },
      ],
    },
    back(),
  ],
}

export const BOOKLETS: Booklet[] = [S85, S150, CW]
