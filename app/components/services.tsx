import type { CSSProperties, ReactNode } from 'react'
import { SectionLabel } from './section-label'
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
  <svg key="4" viewBox="0 0 40 40" {...S}>
    <path d="M8 32V20l12-9 12 9v12" />
    <path d="M16 32v-8h8v8" />
  </svg>,
]

// Title-case labels + longer first-person blurbs. Edit freely.
const SERVICES: Service[] = [
  {
    label: 'Design',
    blurb:
      'Interfaces and identities with a point of view. I root the work in real stories so it reads as intentional, not decorative.',
    icon: MARKS[0],
    col: '1 / 8', // span 7
    row: 1,
  },
  {
    label: 'Development',
    blurb:
      'Production-grade builds — fast, accessible, maintainable. I translate design systems into interfaces that hold up in the real world.',
    icon: MARKS[1],
    col: '8 / 13', // span 5
    row: 1,
  },
  {
    label: 'Strategy',
    blurb:
      'Product thinking and positioning before pixels. I figure out what to build and why before deciding how it looks.',
    icon: MARKS[2],
    col: '1 / 5', // cols 1–4
    row: 2,
  },
  {
    label: 'Motion',
    blurb:
      'Considered animation that earns its place. I use motion to guide attention and add life, never just for flourish.',
    icon: MARKS[3],
    col: '5 / 9', // cols 5–8
    row: 2,
  },
  {
    label: 'Systems',
    blurb:
      'Grid systems where type, color, and components make sense — so teams stay in lockstep as the product grows.',
    icon: MARKS[4],
    col: '9 / 13', // cols 9–12
    row: 2,
  },
]

export function Services() {
  return (
    <section aria-labelledby="services-label" className={styles.services}>
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
            <span className={styles.icon} aria-hidden="true">
              {s.icon}
            </span>
            <h3 className={styles.label}>{s.label}</h3>
            <p className={styles.blurb}>{s.blurb}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
