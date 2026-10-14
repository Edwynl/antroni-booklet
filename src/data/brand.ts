export type Principle = {
  index: string;
  kicker: string;
  title: string;
  cn: string;
  lede: string;
  body: string;
  metrics: { label: string; value: string }[];
};

export type BrandChapter = {
  id: string;
  label: string;
  kicker: string;
  title: string;
  lede: string;
  principles: Principle[];
};

export type LogoVariant = {
  id: string;
  name: string;
  nameCn: string;
  note: string;
  kind: 'wordmark' | 'archA' | 'section' | 'swing' | 'letterN' | 'archWindow';
  usage: string;
};

export const LOGO_VARIANTS: LogoVariant[] = [
  {
    id: 'wordmark-only',
    name: 'Wordmark only',
    nameCn: '纯字标',
    note: 'No symbol at all — the name carries the brand, set wide and level over a hairline. The most architectural answer, and the hardest to copy.',
    kind: 'wordmark',
    usage: 'Primary - all media',
  },
  {
    id: 'arch-letterform',
    name: 'Arched A',
    nameCn: '拱形字母',
    note: 'The capital A drawn with an arched apex and a threshold for a crossbar. The letter and the opening are the same shape.',
    kind: 'archA',
    usage: 'Secondary - covers and signage',
  },
  {
    id: 'golden-section',
    name: 'Golden section',
    nameCn: '比例分割',
    note: 'A rectangle in door proportion, divided once so the lower panel is a square. 法式比例 stated as geometry rather than decoration.',
    kind: 'section',
    usage: 'Secondary - drawings and proportion',
  },
  {
    id: 'pivot-plan',
    name: 'The swing',
    nameCn: '开启轨迹',
    note: 'The leaf closed, the arc it travels, the leaf open. The pivot shown as a plan drawing, the way a workshop would set it out.',
    kind: 'swing',
    usage: 'Secondary - wayfinding and motion',
  },
  {
    id: 'letter-n',
    name: 'Letter N',
    nameCn: '字母 N',
    note: 'The N set to the same grid and the same stroke as the arched A, so the pair reads as one alphabet instead of two marks.',
    kind: 'letterN',
    usage: 'Secondary - monogram and print',
  },
  {
    id: 'arched-window',
    name: 'Arched window',
    nameCn: '拱窗',
    note: 'An arched opening with one transom and one mullion — the product in its simplest true form, and the mark that survives etching.',
    kind: 'archWindow',
    usage: 'Tertiary - glass and screens',
  },
];

export const BRAND_CHAPTERS: BrandChapter[] = [
  {
    id: 'thinking',
    label: 'Principles',
    kicker: 'LA DÉMARCHE',
    title: 'Why The Window Looks Like This',
    lede: 'Five decisions about proportion, movement and restraint, taken before a single profile was drawn.',
    principles: [
      {
        index: '01',
        kicker: 'LE PROPORTION',
        title: 'Proportion Before Ornament',
        cn: '比例先行',
        lede: 'Proportion is the decision made before any material is chosen, and decoration only follows it.',
        body: 'We set the opening to classical proportion first, because a door that is too wide or too tall cannot be corrected later by its hardware. Bronze furniture, shadow gaps and stone surrounds are chosen afterwards to confirm the ratio, not to announce it. If a detail does not serve the proportion, we remove it rather than explain it.',
        metrics: [
          { label: 'Reference opening', value: '1 : 1.618' },
          { label: 'Shadow seam order', value: '3 mm' },
          { label: 'Ornament added', value: 'None' },
        ],
      },
      {
        index: '02',
        kicker: 'L’AXE PIVOTANT',
        title: 'The Pivot Returns The Opening',
        cn: '轴心回转',
        lede: 'A pivot leaf turns on a vertical floor-and-head axis, so one wide opening stays clear.',
        body: 'The pivot exists because a conventional hinge breaks a wide opening into narrow, awkward leaves. On a vertical axis at floor and head, the leaf swings clear and the room behind it stays continuous. We house that axis inside the threshold section, so the mechanism never appears in the reveal where a hand passes daily.',
        metrics: [
          { label: 'Pivot axis', value: 'Floor + head' },
          { label: 'Leaf count', value: '1' },
          { label: 'Axis housing', value: 'Concealed' },
        ],
      },
      {
        index: '03',
        kicker: 'LA FERMETURE',
        title: 'The Sound Of Closing',
        cn: '闭合之声',
        lede: 'A well-made door announces itself once, at the moment it seats, and says nothing afterwards.',
        body: 'Solid steel hardware gives a closing weight that lighter alloys cannot reproduce. We tune the latch, the seal and the closer together until the leaf seats in one movement with a single low note. Sound is the shortest honest test of a joint: it exposes voids, proud edges and fasteners left standing proud of the surface.',
        metrics: [
          { label: 'Hardware', value: 'Solid steel' },
          { label: 'Latch points', value: '3' },
          { label: 'Closing note', value: 'One' },
        ],
      },
      {
        index: '04',
        kicker: 'L’OMBRE',
        title: 'Restraint As A Shadow Seam',
        cn: '克制的影缝',
        lede: 'Where a profile wants to read as solid, we hold a fine shadow seam instead of covering it.',
        body: 'Most windows are decorated with more profile: wider beads, applied trims, a second finish. We do the opposite, holding a shadow seam to a three-millimetre order so the eye reads continuity while the joint still closes cleanly. The ornament on this window is that single line, and it is enough.',
        metrics: [
          { label: 'Shadow seam', value: '3 mm' },
          { label: 'Applied trims', value: 'None' },
          { label: 'Visible beads', value: '2' },
        ],
      },
      {
        index: '05',
        kicker: 'LE REFUS',
        title: 'A Window Refuses Decoration',
        cn: '不加装饰',
        lede: 'We leave the profile plain, so the material, the glass and the room can all be read clearly.',
        body: 'A residential window is asked to sit quietly behind stone, joinery and furniture for thirty years. Every applied ornament is a second surface to clean, to wear and eventually to replace. Refusing it is a maintenance decision as much as an aesthetic one, and it keeps the specification honest.',
        metrics: [
          { label: 'Applied profiles', value: 'None' },
          { label: 'Finish options', value: '3' },
          { label: 'Seal lines', value: '4' },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'Engineering',
    kicker: 'LE SYSTÈME',
    title: 'How The Window Is Built',
    lede: 'Five engineering decisions that never appear in a rendering, and decide whether the window still works in year ten.',
    principles: [
      {
        index: '06',
        kicker: 'LE SYSTÈME',
        title: 'Aluminium Outside, Timber Within',
        cn: '外铝内木',
        lede: 'Two materials, each doing only the job it is good at: aluminium weathers, timber is touched.',
        body: 'The outer layer is aluminium because it sheds rain, holds a thermal break and survives salt air and ultraviolet. The inner layer is timber because a hand rests against it, a curtain slides on it and it can be repaired instead of replaced. The joint between the two is drained and sealed as carefully as the window itself.',
        metrics: [
          { label: 'Outer layer', value: 'Aluminium' },
          { label: 'Inner layer', value: 'Timber' },
          { label: 'Sheath joint', value: 'Drained' },
        ],
      },
      {
        index: '07',
        kicker: 'LE SEUIL',
        title: 'The Threshold Must Stay Flush',
        cn: '平齐门槛',
        lede: 'A level transition is the only threshold detail that serves stone, timber and a wheelchair alike.',
        body: 'A raised sill traps water, collects grit and breaks the floor line the whole room depends on. Our threshold drains beneath and finishes level with the interior stone, so the leaf can swing through without a step. We set that recess in millimetres against the finished floor, never against the screed, because the floor is what gets measured.',
        metrics: [
          { label: 'Upstand', value: '0 mm' },
          { label: 'Drainage fall', value: '1 : 50' },
          { label: 'Set-out datum', value: 'Floor level' },
        ],
      },
      {
        index: '08',
        kicker: 'L’ÉVACUATION',
        title: 'The Drainage Nobody Sees',
        cn: '隐形排水',
        lede: 'Water that enters a frame must leave it again, and it leaves along paths that are never seen.',
        body: 'Every cavity in our profiles is drained to the outside face through slots sized to the wind pressure they face. Chambered and labyrinth paths keep capillary water out of the insulated zone entirely. This is the least visible part of the specification, and the one that decides whether the window still looks new in ten years.',
        metrics: [
          { label: 'Drainage path', value: 'Chambered' },
          { label: 'Outlet slots', value: 'Per cavity' },
          { label: 'Water entry', value: 'Vented' },
        ],
      },
      {
        index: '09',
        kicker: 'LE PONT THERMIQUE',
        title: 'A 30 Millimetre Thermal Break',
        cn: '隔热断桥',
        lede: 'The strip that divides a profile into two halves is a structural decision before it is a thermal one.',
        body: 'The thermal break is not an accessory; it is the joint that stops the frame acting as a fin between rooms. We work to a thirty-millimetre polyamide section and stiffen the surrounding profile so the strip carries the same load as the aluminium around it. Depth, not a thin line, is what actually slows the heat.',
        metrics: [
          { label: 'Break section', value: '30 mm' },
          { label: 'Break material', value: 'Polyamide' },
          { label: 'Load path', value: 'Continuous' },
        ],
      },
      {
        index: '10',
        kicker: 'L’ENTRETIEN',
        title: 'Maintenance Is The Real Finish',
        cn: '维护即完成',
        lede: 'A window is finished when the last owner can service it, not when the showroom photographs were taken.',
        body: 'Hardware is reachable from inside, seals are exchangeable without taking the leaf out, and the fixings stay visible where they can be seen. We choose parts a carpenter can replace in an afternoon rather than a fitter must dismantle in a day. It is unglamorous work, and it is most of what keeps a house looking well judged.',
        metrics: [
          { label: 'Service access', value: 'From inside' },
          { label: 'Seal type', value: 'Replaceable' },
          { label: 'Fixings', value: 'Exposed' },
        ],
      },
    ],
  },
];