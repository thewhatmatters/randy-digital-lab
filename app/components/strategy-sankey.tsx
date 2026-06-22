import styles from './strategy-sankey.module.scss'

// StrategySankey — the Strategy facet's visual: a hand-authored Sankey on a dot
// canvas. Randy's capabilities (AI · Design · Development) flow through strategic
// activities (Personalize · Position · Systems) into outcomes (Market Fit ·
// Loyalty · Brand) and converge into Business Value — a lane that runs off the
// right edge. Model grounded in docs/research-strategy-sankey-flow.md (capability
// maps → value-chain activities → outcomes → value). Each capability has a "home"
// activity but cross-links into the others, so the flow reads as synthesis.
// Pure computed SVG → Server Component; tokens only. The accent moment is the
// outcomes + the convergence flowing off-canvas to value.

type Node = { id: string; label: string; w: number; col: number; place: 'l' | 't' | 'r' }
const NODES: Node[] = [
  { id: 'ai', label: 'AI', w: 100, col: 0, place: 'l' },
  { id: 'design', label: 'Design', w: 100, col: 0, place: 'l' },
  { id: 'dev', label: 'Dev', w: 100, col: 0, place: 'l' },
  { id: 'pers', label: 'Personalize', w: 105, col: 1, place: 't' },
  { id: 'pos', label: 'Position', w: 90, col: 1, place: 't' },
  { id: 'sys', label: 'Systems', w: 105, col: 1, place: 't' },
  { id: 'fit', label: 'Market Fit', w: 120, col: 2, place: 't' },
  { id: 'loyalty', label: 'Loyalty', w: 105, col: 2, place: 't' },
  { id: 'brand', label: 'Brand', w: 75, col: 2, place: 't' },
  { id: 'value', label: 'Business Value', w: 300, col: 3, place: 'r' },
]
const LINKS: [string, string, number][] = [
  ['ai', 'pers', 60], ['ai', 'pos', 25], ['ai', 'sys', 15],
  ['design', 'pers', 15], ['design', 'pos', 50], ['design', 'sys', 35],
  ['dev', 'pers', 30], ['dev', 'pos', 15], ['dev', 'sys', 55],
  ['pers', 'loyalty', 70], ['pers', 'fit', 35],
  ['pos', 'fit', 55], ['pos', 'brand', 35],
  ['sys', 'fit', 30], ['sys', 'loyalty', 35], ['sys', 'brand', 40],
  ['fit', 'value', 120], ['loyalty', 'value', 105], ['brand', 'value', 75],
]

// — layout (SVG units = px; the SVG is 40rem wide and overflows the panel) —
const VW = 640
const VH = 312
const TOP = 24
const GAP = 16
const BAR = 8
const COL_X = [60, 188, 320, 468]
const USABLE = VH - TOP * 2
const SCALE = (USABLE - 2 * GAP) / 300 // busiest column: 3 nodes, total 300

type Box = { x: number; top: number; bottom: number; mid: number }
const pos: Record<string, Box> = {}
for (const c of [0, 1, 2, 3]) {
  const ns = NODES.filter((n) => n.col === c)
  const h = ns.reduce((s, n) => s + n.w * SCALE, 0) + GAP * (ns.length - 1)
  let y = TOP + (USABLE - h) / 2
  for (const n of ns) {
    const nh = n.w * SCALE
    pos[n.id] = { x: COL_X[c], top: y, bottom: y + nh, mid: y + nh / 2 }
    y += nh + GAP
  }
}

const colOf = (id: string) => NODES.find((n) => n.id === id)!.col
const outOff: Record<string, number> = {}
const inOff: Record<string, number> = {}
NODES.forEach((n) => {
  outOff[n.id] = pos[n.id].top
  inOff[n.id] = pos[n.id].top
})
const ribbons = LINKS.map(([s, t, w]) => {
  const sw = w * SCALE
  const sx = pos[s].x + BAR
  const tx = pos[t].x
  const sy0 = outOff[s]
  const sy1 = sy0 + sw
  outOff[s] = sy1
  const ty0 = inOff[t]
  const ty1 = ty0 + sw
  inOff[t] = ty1
  const cx = (sx + tx) / 2
  const d = `M${sx},${sy0} C${cx},${sy0} ${cx},${ty0} ${tx},${ty0} L${tx},${ty1} C${cx},${ty1} ${cx},${sy1} ${sx},${sy1} Z`
  // colour by source capability; mid transition neutral; convergence → accent
  const kind = t === 'value' ? 'pmf' : colOf(s) === 0 ? s : 'mid'
  return { d, kind }
})

const RIBBON_CLASS: Record<string, string> = {
  ai: styles.ribbonAi,
  design: styles.ribbonDesign,
  dev: styles.ribbonDev,
  mid: styles.ribbonMid,
  pmf: styles.ribbonAccent,
}
const NODE_CLASS: Record<string, string> = {
  ai: styles.nodeAi,
  design: styles.nodeDesign,
  dev: styles.nodeDev,
  fit: styles.nodeAccent,
  loyalty: styles.nodeAccent,
  brand: styles.nodeAccent,
  value: styles.nodeAccent,
}

export function StrategySankey() {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <svg className={styles.svg} viewBox={`0 0 ${VW} ${VH}`}>
        <g>
          {ribbons.map((r, i) => (
            <path key={i} d={r.d} className={RIBBON_CLASS[r.kind]} />
          ))}
        </g>
        {NODES.map((n) => {
          const b = pos[n.id]
          return (
            <g key={n.id}>
              <rect
                x={b.x}
                y={b.top}
                width={BAR}
                height={b.bottom - b.top}
                rx={2}
                className={NODE_CLASS[n.id] ?? styles.node}
              />
              <text
                className={`${styles.label} ${n.place === 't' ? styles.labelMuted : ''}`}
                x={
                  n.place === 'l' ? b.x - 8 : n.place === 'r' ? b.x + BAR + 9 : b.x + BAR / 2
                }
                y={n.place === 't' ? b.top - 6 : b.mid}
                textAnchor={n.place === 'l' ? 'end' : n.place === 'r' ? 'start' : 'middle'}
                dominantBaseline={n.place === 't' ? 'auto' : 'middle'}
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
