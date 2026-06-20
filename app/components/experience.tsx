import type { CSSProperties } from 'react'
import { SectionLabel } from './section-label'
import styles from './experience.module.scss'

// Editorial work index — a numbered, tabular CV in the International-Typographic
// register (flush-left, hairline-ruled, mono metadata). Pure markup + tokens,
// so it stays a Server Component. `present` roles show a start year with a blank
// (open-ended) range, no "now" tag; `accent` marks the single highlighted row.
type Role = {
  no: string
  role: string
  company: string
  focus: string
  years: string
  /** Ongoing role — renders "2024 –" (open-ended, no tag). */
  present?: boolean
  /** The single highlighted row (accent number + medium role). */
  accent?: boolean
}

// Real roles + years from Randy's history. FOCUS is technical (no design-
// deliverable language) — written as a lead; refine freely.
const ROLES: Role[] = [
  {
    no: '01',
    role: 'Founder & Creative Director',
    company: 'WhatMatters',
    focus: 'Product, engineering, marketing',
    years: '2025',
    present: true,
    accent: true,
  },
  {
    no: '02',
    role: 'Lead Design Engineer',
    company: 'Privé',
    focus: 'Design engineering, UI',
    years: '2025',
    present: true,
  },
  {
    no: '03',
    role: 'Senior Product Designer',
    company: 'Tenable',
    focus: 'Design systems, AI',
    years: '2024',
    present: true,
  },
  {
    no: '04',
    role: 'Senior Interaction Designer',
    company: 'MagicLinks',
    focus: 'Engineering, design systems',
    years: '2022 – 2024',
  },
  {
    no: '05',
    role: 'Senior UX/UI Designer',
    company: 'Barstool Sports',
    focus: 'Interface design',
    years: '2022',
  },
  {
    no: '06',
    role: 'Salesforce UI Developer',
    company: 'Publicis Sapient',
    focus: 'Design systems, engineering',
    years: '2020 – 2022',
  },
  {
    no: '07',
    role: 'UX Designer',
    company: 'Parsons',
    focus: 'Prototyping, engineering',
    years: '2019 – 2020',
  },
  {
    no: '08',
    role: 'Product Designer',
    company: 'Radar',
    focus: 'Interaction engineering',
    years: '2018 – 2019',
  },
  {
    no: '09',
    role: 'Web Developer',
    company: 'Howard Community College',
    focus: 'Web development, UI',
    years: '2012 – 2018',
  },
]

export function Experience() {
  return (
    <section aria-labelledby="experience-label" className={styles.experience}>
      <SectionLabel id="experience-label">Experience</SectionLabel>

      <ol className={styles.table}>
        {/* column headers — desktop only; decorative for AT (data is labelled
            per-cell below via the visible text) */}
        <li
          className={styles.head}
          aria-hidden="true"
          style={{ '--i': 0 } as CSSProperties}
        >
          <span className={styles.no}>No.</span>
          <span className={styles.role}>Role</span>
          <span className={styles.company}>Company</span>
          <span className={styles.focus}>Focus</span>
          <span className={styles.years}>Years</span>
        </li>

        {ROLES.map((r, i) => (
          <li
            key={r.no}
            className={`${styles.row} ${r.accent ? styles.present : ''}`}
            style={{ '--i': i + 1 } as CSSProperties}
          >
            <span className={styles.no}>{r.no}</span>
            <span className={styles.role}>{r.role}</span>
            <span className={styles.company}>{r.company}</span>
            <span className={styles.focus}>{r.focus}</span>
            <span className={styles.years}>
              {r.present ? `${r.years} –` : r.years}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
