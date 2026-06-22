import type { CSSProperties, ReactNode } from 'react'
import { CodeWindow } from './code-window'
import { DesignCanvas } from './design-canvas'
import { MotionTimeline } from './motion-timeline'
import { SectionLabel } from './section-label'
import { StrategySankey } from './strategy-sankey'
import styles from './services.module.scss'

// Services bento — five capabilities placed on the page's 12-column grid as
// asymmetric tiles. Each tile carries a monochrome line pictogram, a label, and
// a first-person blurb. Pure markup + tokens, so it stays a Server Component;
// motion is CSS-tier (rise-in stagger + hover wake), disabled under
// prefers-reduced-motion.
//
// Placement is per-tile via --col / --row custom props (desktop only; mobile
// stacks). Two full rows: row 1 is 01 (span 7) + 02 (span 5); row 2 is three
// quarters (03/04/05).
type Service = {
  label: string
  blurb: string
  icon: ReactNode
  /** an interactive/illustrative "tool" panel rendered in place of the icon */
  visual?: ReactNode
  /** desktop grid-column, e.g. '1 / 8' (span 7) */
  col: string
  /** desktop grid-row */
  row: number
}

// PLACEHOLDER geometric marks — swap for the real bold pictogram set.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
const MARKS: ReactNode[] = [
  <svg key="0" viewBox="0 0 40 40" {...S}>
    <circle cx="20" cy="20" r="13" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
  </svg>,
  <svg key="1" viewBox="0 0 40 40" {...S}>
    <rect x="8" y="8" width="24" height="24" />
  </svg>,
  <svg key="2" viewBox="0 0 40 40" {...S}>
    <path d="M20 7 33 31 7 31Z" />
  </svg>,
  <svg key="3" viewBox="0 0 40 40" {...S}>
    <circle cx="20" cy="20" r="13" />
    <path d="M7 20h26M20 7v26M11 11c4 4 14 4 18 0M11 29c4-4 14-4 18 0" />
  </svg>,
]

// Title-case labels + longer first-person blurbs. Edit freely.
const SERVICES: Service[] = [
  {
    label: 'Strategy',
    blurb:
      'Product thinking before pixels: what to build, and why. AI speeds the research and surfaces the signal early.',
    icon: MARKS[2],
    visual: <StrategySankey />,
    col: '1 / 6', // span 5
    row: 1,
  },
  {
    label: 'Design',
    blurb:
      'Interfaces and identities with a point of view, rooted in real stories, never decorative. AI widens the exploration; taste narrows it down.',
    icon: MARKS[0],
    visual: <DesignCanvas />,
    col: '6 / 13', // span 7
    row: 1,
  },
  {
    label: 'Motion',
    blurb:
      'Considered animation that earns its place, guiding attention and adding life. AI prototypes the timing, so motion gets found, not guessed.',
    icon: MARKS[3],
    visual: <MotionTimeline />,
    col: '1 / 8', // span 7
    row: 2,
  },
  {
    label: 'Development',
    blurb:
      'Production-grade builds: fast, accessible, maintainable. AI clears the boilerplate so craft lands where it counts.',
    icon: MARKS[1],
    visual: <CodeWindow />,
    col: '8 / 13', // span 5
    row: 2,
  },
]

export function Services() {
  return (
    <section aria-labelledby="services-label" className={styles.services}>
      <div className={styles.inner}>
        <SectionLabel id="services-label">Services</SectionLabel>

        <ul className={styles.bento}>
        {SERVICES.map((s, i) => (
          <li
            key={s.label}
            className={styles.tile}
            style={
              { '--col': s.col, '--row': s.row, '--i': i } as CSSProperties
            }
          >
            <div
              className={`${styles.panel} ${s.visual ? styles.panelMedia : ''}`}
            >
              {s.visual ?? (
                <span className={styles.icon} aria-hidden="true">
                  {s.icon}
                </span>
              )}
            </div>
            <div className={styles.body}>
              <h3 className={styles.label}>{s.label}</h3>
              <p className={styles.blurb}>{s.blurb}</p>
            </div>
          </li>
        ))}
        </ul>
      </div>
    </section>
  )
}
