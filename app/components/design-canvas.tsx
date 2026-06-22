import styles from './design-canvas.module.scss'

// DesignCanvas — the Design facet's "tool", the mirror of CodeWindow: a depicted
// design canvas (Paper) with the site's own colour system open on the board. Same
// idea as the IDE — the real material loaded into the real tool, rendered at a
// fixed intrinsic size and anchored top-left so it bleeds past the panel and is
// clipped. Theme-aware chrome on semantic tokens; the swatch fills are the literal
// palette hex (they document specific values), shown as both Light and Dark rows.
// Pure markup → Server Component.

type Token = { name: string; hex: string; use: string }
// Lead each row with the accent for a hit of colour; neutrals follow.
const LIGHT: Token[] = [
  { name: '--accent', hex: '#e5484d', use: 'links, focus, signal' },
  { name: '--bg', hex: '#ffffff', use: 'page background' },
  { name: '--surface', hex: '#f5f5f5', use: 'cards, code, insets' },
  { name: '--fg', hex: '#111111', use: 'primary text' },
  { name: '--muted', hex: '#737373', use: 'metadata, mono labels' },
  { name: '--border', hex: '#e5e5e5', use: 'hairlines, dividers' },
]
const DARK: Token[] = [
  { name: '--accent', hex: '#ff6369', use: 'links, focus, signal' },
  { name: '--bg', hex: '#0a0a0a', use: 'page background' },
  { name: '--surface', hex: '#171717', use: 'cards, code, insets' },
  { name: '--fg', hex: '#ededed', use: 'primary text' },
  { name: '--muted', hex: '#a3a3a3', use: 'metadata, mono labels' },
  { name: '--border', hex: '#262626', use: 'hairlines, dividers' },
]

// Left panel: pages, then the layer tree of the open page.
const PAGES = [
  { name: 'Note', active: false },
  { name: 'Design System', active: true },
]
type Layer = { name: string; depth: number; caret?: boolean; active?: boolean }
const LAYERS: Layer[] = [
  { name: 'Design System — randy.digital', depth: 0, caret: true },
  { name: 'Masthead', depth: 1, caret: true },
  { name: 'Rule', depth: 1 },
  { name: '01 · Color', depth: 1, caret: true, active: true },
  { name: 'Rule', depth: 1 },
  { name: '02 · Typography', depth: 1, caret: true },
  { name: 'Rule', depth: 1 },
  { name: '03 · Components', depth: 1, caret: true },
  { name: 'Code exploration interface', depth: 1 },
]

const Caret = () => (
  <svg className={styles.caret} viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
const PageGlyph = () => (
  <svg className={styles.pageGlyph} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M4 1.6 9.5 1.6 12.4 4.5 12.4 14.4 4 14.4z M9.5 1.6 9.5 4.5 12.4 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
)

// Tool rail — a curated set of design-tool icons; cursor is the active tool.
const TOOLS: { key: string; node: React.ReactNode; active?: boolean }[] = [
  {
    key: 'cursor',
    active: true,
    node: (
      <path d="M4 3 4 14 7 11 9 15 11 14 9 10 13 10z" fill="currentColor" />
    ),
  },
  {
    key: 'hand',
    node: (
      <path
        d="M6 9V5.5a1 1 0 0 1 2 0V9m0-.5V4.5a1 1 0 0 1 2 0V9m0-1V5.5a1 1 0 0 1 2 0V10c0 2.5-1.5 4-4 4s-3.5-1.5-4-3l-.8-2a1 1 0 0 1 1.8-.8L6 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: 'frame',
    node: (
      <path
        d="M5 2v12M11 2v12M2 5h12M2 11h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    ),
  },
  {
    key: 'rect',
    node: (
      <rect x="3" y="3" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    ),
  },
  {
    key: 'pen',
    node: (
      <path
        d="M3 13 4 10 11 3l2 2-7 7-3 1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: 'line',
    node: <path d="M3 13 13 3" fill="none" stroke="currentColor" strokeWidth="1.2" />,
  },
  {
    key: 'image',
    node: (
      <>
        <rect x="2.5" y="3.5" width="11" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="6" cy="6.5" r="1" fill="currentColor" />
        <path d="M3 11l3-3 2.5 2.5L11 7l2 2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </>
    ),
  },
  {
    key: 'component',
    node: (
      <path
        d="M8 2.5 10 5 8 7.5 6 5zM8 8.5 10 11 8 13.5 6 11zM2.5 8 5 6 7.5 8 5 10zM8.5 8 11 6 13.5 8 11 10z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  },
]

function SwatchRow({ tokens }: { tokens: Token[] }) {
  return (
    <div className={styles.swatchRow}>
      {tokens.map((t) => (
        <div key={t.name} className={styles.swatch}>
          <div className={styles.chip} style={{ backgroundColor: t.hex }} />
          <div className={styles.tokenName}>
            {t.name}: {t.hex};
          </div>
          <div className={styles.tokenUse}>{t.use}</div>
        </div>
      ))}
    </div>
  )
}

export function DesignCanvas() {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <aside className={styles.sidebar}>
        <div className={styles.appHeader}>
          <span className={styles.logo} />
          <span className={styles.appName}>randy.digital</span>
        </div>

        <div className={styles.sectionRow}>
          <span>Pages</span>
          <span className={styles.plus}>+</span>
        </div>
        {PAGES.map((p) => (
          <div
            key={p.name}
            className={`${styles.pageRow} ${p.active ? styles.pageActive : ''}`}
          >
            <PageGlyph />
            <span className={styles.rowName}>{p.name}</span>
            {p.active ? <span className={styles.check}>✓</span> : null}
          </div>
        ))}

        <div className={styles.layers}>
          {LAYERS.map((l, i) => (
            <div
              key={`${l.name}-${i}`}
              className={`${styles.layerRow} ${l.active ? styles.layerActive : ''}`}
              style={{ paddingLeft: `${0.4 + l.depth * 0.85}rem` }}
            >
              {l.caret ? <Caret /> : <span className={styles.caretSpacer} />}
              <span className={styles.rowName}>{l.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.rail}>
        {TOOLS.map((t) => (
          <span
            key={t.key}
            className={`${styles.tool} ${t.active ? styles.toolActive : ''}`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {t.node}
            </svg>
          </span>
        ))}
        <span className={styles.toolType}>Aa</span>
      </div>

      <div className={styles.board}>
        <div className={styles.boardHead}>
          <span className={styles.num}>01</span>
          <span className={styles.boardTitle}>Color</span>
          <span className={styles.boardSub}>
            near-monochrome neutrals + one signal red · semantic tokens, never raw
            hex
          </span>
        </div>

        <div className={styles.groupLabel}>Light</div>
        <SwatchRow tokens={LIGHT} />
        <div className={styles.groupLabel}>Dark</div>
        <SwatchRow tokens={DARK} />
      </div>
    </div>
  )
}
