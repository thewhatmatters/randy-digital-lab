import type { CSSProperties } from 'react'
import styles from './stack-matrix.module.scss'

// Tool-stack presence matrix — tools (rows) × stages (columns), a filled dot
// where a tool is used in a stage. Built as an HTML/CSS grid (not SVG) so the
// columns land on the page's real 12-column grid at every width, like the
// Experience table. A tool used in multiple stages (Vercel) simply gets a dot
// in each — the overlap is the data. One `accent` tool is the single highlight.
// Pure markup + tokens → Server Component. Droppable on any page; the whole
// thing is a labelled `role="img"` so screen readers get the full description.
type Stage = { id: string; label: string }
type Tool = { name: string; stages: string[]; accent?: boolean }

const DEFAULT_STAGES: Stage[] = [
  { id: 'design', label: 'Design' },
  { id: 'develop', label: 'Develop' },
  { id: 'ship', label: 'Ship' },
]

const DEFAULT_TOOLS: Tool[] = [
  { name: 'Paper', stages: ['design'] },
  { name: 'Figma', stages: ['design'] },
  { name: 'Next.js', stages: ['develop'], accent: true },
  { name: 'Tailwind', stages: ['develop'] },
  { name: 'visx', stages: ['develop'] },
  { name: 'Vercel', stages: ['develop', 'ship'] },
  { name: 'Resend', stages: ['ship'] },
]

// Tool name occupies grid lines 1 → NAME_END; stages split the rest evenly.
const NAME_END = 4

function stageColumn(i: number, n: number): CSSProperties {
  const per = (12 - (NAME_END - 1)) / n
  const start = NAME_END + Math.round(i * per)
  const end = NAME_END + Math.round((i + 1) * per)
  return { gridColumn: `${start} / ${end}` }
}

function describe(stages: Stage[], tools: Tool[]) {
  return (
    'Tool stack by stage. ' +
    stages
      .map((s) => {
        const list = tools
          .filter((t) => t.stages.includes(s.id))
          .map((t) => t.name + (t.accent ? ' (current focus)' : ''))
        return `${s.label}: ${list.join(', ')}.`
      })
      .join(' ')
  )
}

export function StackMatrix({
  stages = DEFAULT_STAGES,
  tools = DEFAULT_TOOLS,
  label,
}: {
  stages?: Stage[]
  tools?: Tool[]
  /** Overrides the auto-generated a11y description. */
  label?: string
}) {
  const n = stages.length

  return (
    <div
      className={styles.matrix}
      role="img"
      aria-label={label ?? describe(stages, tools)}
    >
      <div className={styles.head} aria-hidden="true" style={{ '--i': 0 } as CSSProperties}>
        {stages.map((s, i) => (
          <span key={s.id} className={styles.stage} style={stageColumn(i, n)}>
            {s.label}
          </span>
        ))}
      </div>

      <ul className={styles.rows} aria-hidden="true">
        {tools.map((t, ti) => (
          <li
            key={t.name}
            className={`${styles.row} ${t.accent ? styles.accent : ''}`}
            style={{ '--i': ti + 1 } as CSSProperties}
          >
            <span className={styles.tool}>{t.name}</span>
            {stages.map((s, i) => (
              <span key={s.id} className={styles.cell} style={stageColumn(i, n)}>
                {t.stages.includes(s.id) && (
                  <>
                    <span className={styles.dot} />
                    <span className={styles.cellTag}>{s.label}</span>
                  </>
                )}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}
