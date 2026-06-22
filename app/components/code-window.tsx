import { highlight } from 'sugar-high'
import styles from './code-window.module.scss'

// CodeWindow — the Development facet's "tool": a depicted IDE showing this repo's
// own source (margin.tsx, syntax-highlighted by the same sugar-high the site uses
// for its code blocks). Rendered at a fixed intrinsic size and anchored top-left
// so it overflows the panel and is clipped — a viewport into a real editor, not
// everything on screen. Pure markup + a build-time highlight call → still a
// Server Component (zero client JS).

// The open file, lines 1–28 — the real Margin component (kept as lines to dodge
// the backtick that appears in the source comment).
const SNIPPET = [
  "import Image from 'next/image'",
  "import styles from './margin.module.scss'",
  '',
  "// Editorial margin — author-authored marginalia that lives inline in a note's",
  '// MDX at the point it’s relevant, and floats out into the right column anchored',
  '// to that scroll position (the Tufte/sidenote model). On narrow viewports it',
  '// collapses back into the reading column. The container is content-agnostic:',
  "// anything React renders goes here — including the lab's interactive islands —",
  '// so a live chart is just a client component dropped inside <Margin>.',
  '',
  'export function Margin({',
  '  label,',
  '  children,',
  '}: {',
  '  label?: string',
  '  children: React.ReactNode',
  '}) {',
  '  return (',
  '    <aside className={styles.margin}>',
  '      {label && <p className={styles.marginLabel}>{label}</p>}',
  '      {children}',
  '    </aside>',
  '  )',
  '}',
  '',
  '// Pull quote — a line lifted from the prose, set large in the margin. Optional',
  '// `from` attributes it (a source, a person) without the visual weight of the',
  '// old colophon.',
].join('\n')

const codeHTML = highlight(SNIPPET)
const lineCount = SNIPPET.split('\n').length

// Tabs across the top — active is the open file.
const TABS = [
  { name: 'randy.digital', kind: 'globe' as const },
  { name: 'margin.tsx', kind: 'tsx' as const, active: true },
  { name: 'building-conan.mdx', kind: 'mdx' as const },
  { name: 'figma-to-paper.mdx', kind: 'mdx' as const },
]

// Explorer rows: depth drives indent; folders are chevron-only (no glyph), files
// carry a tinted icon. Curated to read as the real tree and run off the bottom.
type Row =
  | { kind: 'folder'; name: string; depth: number; open?: boolean }
  | { kind: 'tsx' | 'scss'; name: string; depth: number; active?: boolean }
const ROWS: Row[] = [
  { kind: 'folder', name: '.claude', depth: 0 },
  { kind: 'folder', name: '.next', depth: 0 },
  { kind: 'folder', name: 'app', depth: 0, open: true },
  { kind: 'folder', name: 'components', depth: 1, open: true },
  { kind: 'folder', name: 'charts', depth: 2 },
  { kind: 'scss', name: 'button.module.scss', depth: 2 },
  { kind: 'tsx', name: 'button.tsx', depth: 2 },
  { kind: 'scss', name: 'command-bar.module.scss', depth: 2 },
  { kind: 'tsx', name: 'command-bar.tsx', depth: 2 },
  { kind: 'tsx', name: 'copy-prompt.tsx', depth: 2 },
  { kind: 'scss', name: 'experience.module.scss', depth: 2 },
  { kind: 'tsx', name: 'experience.tsx', depth: 2 },
  { kind: 'scss', name: 'footer.module.scss', depth: 2 },
  { kind: 'tsx', name: 'footer.tsx', depth: 2 },
  { kind: 'scss', name: 'margin.module.scss', depth: 2 },
  { kind: 'tsx', name: 'margin.tsx', depth: 2, active: true },
  { kind: 'tsx', name: 'nav.tsx', depth: 2 },
]

const ChevronRight = () => (
  <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden="true">
    <path d="M4.5 3 7.5 6 4.5 9" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
const ChevronDown = () => (
  <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

// File glyphs — monochrome outlines that inherit the row's themed colour (muted,
// or fg on the active row). The React atom marks .tsx; a folded doc marks the
// rest; a globe marks the live-preview tab.
const ReactGlyph = () => (
  <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    <g fill="none" stroke="currentColor" strokeWidth="0.9">
      <ellipse cx="8" cy="8" rx="6.5" ry="2.6" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.6" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.6" transform="rotate(120 8 8)" />
    </g>
  </svg>
)
const DocGlyph = () => (
  <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M4 1.6 9.5 1.6 12.4 4.5 12.4 14.4 4 14.4z M9.5 1.6 9.5 4.5 12.4 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
)
const GlobeGlyph = () => (
  <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
    <path
      d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
)

const tabIcon = (kind: 'globe' | 'mdx' | 'tsx') =>
  kind === 'globe' ? <GlobeGlyph /> : kind === 'mdx' ? <DocGlyph /> : <ReactGlyph />

export function CodeWindow() {
  return (
    <div className={styles.window} aria-hidden="true">
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <span
            key={t.name}
            className={`${styles.tab} ${t.active ? styles.tabActive : ''}`}
          >
            {tabIcon(t.kind)}
            <span className={styles.tabName}>{t.name}</span>
            {t.active ? <span className={styles.close}>×</span> : null}
          </span>
        ))}
      </div>

      <div className={styles.breadcrumb}>
        <span>app</span>
        <span className={styles.sep}>›</span>
        <span>components</span>
        <span className={styles.sep}>›</span>
        <span>margin.tsx</span>
        <span className={styles.sep}>›</span>
        <span className={styles.symbol}>Margin</span>
      </div>

      <div className={styles.body}>
        <aside className={styles.explorer}>
          <div className={styles.explorerHead}>Explorer</div>
          <div className={styles.rootRow}>
            <ChevronDown />
            <span className={styles.rootName}>randy-digital</span>
          </div>
          {ROWS.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className={`${styles.row} ${'active' in r && r.active ? styles.rowActive : ''}`}
              style={{ paddingLeft: `${0.5 + r.depth * 0.75}rem` }}
            >
              {r.kind === 'folder' ? (
                r.open ? <ChevronDown /> : <ChevronRight />
              ) : (
                <span className={styles.chevronSpacer} />
              )}
              {r.kind === 'tsx' ? (
                <ReactGlyph />
              ) : r.kind === 'scss' ? (
                <DocGlyph />
              ) : null}
              <span className={styles.rowName}>{r.name}</span>
            </div>
          ))}
        </aside>

        <div className={styles.editor}>
          <div className={styles.gutter}>
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <pre className={styles.code}>
            <code dangerouslySetInnerHTML={{ __html: codeHTML }} />
          </pre>
        </div>
      </div>
    </div>
  )
}
