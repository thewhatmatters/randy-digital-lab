import { Fragment } from 'react'
import { experiments } from './experiments'
import { CopyPrompt } from 'app/components/copy-prompt'
import { LabFrame } from './frame'
import styles from './page.module.scss'

export const metadata = {
  title: 'Lab',
  description:
    'A lab of self-contained experiments, each a small project poking at a single UI element or interaction.',
}

// Newest first, the same reading order /notes and /work use (lib/dates:
// newest at the top). The registry itself stays in AUTHORING order — 01, 02,
// 03 — so adding an experiment is an append and the numbers keep meaning
// "when it was made"; only the display reverses. Sorted by `number` rather
// than array position so the two can never disagree.
const newestFirst = [...experiments].sort((a, b) =>
  b.number.localeCompare(a.number)
)

export default function Page() {
  return (
    <section className="grid-page">
      <h1 className="col-start-1 col-end-13 md:col-end-9 text-2xl font-semibold tracking-tighter">
        Lab
      </h1>
      <p className="col-start-1 col-end-13 md:col-end-8 mt-4 text-muted">
        Self-contained experiments, each a small project poking at a single UI
        element or interaction. All live below.
      </p>

      {newestFirst.map((e) => {
        const Experiment = e.component
        return (
          <Fragment key={e.slug}>
            {/* The frame is a client island (frame.tsx) hosting the glow's
                wake state; the experiment passes through as children. */}
            <LabFrame
              id={e.slug}
              className="col-start-1 col-end-13 mt-16 scroll-mt-24"
            >
              <Experiment />
            </LabFrame>

            {/* description — left */}
            <div className="col-start-1 col-end-13 md:col-end-8">
              <a href={`#${e.slug}`} className={styles.metaHead}>
                <span className={styles.metaNum}>{e.number}</span>
                <h2 className={styles.metaTitle}>{e.title}</h2>
              </a>
              <p className={styles.metaBlurb}>{e.summary}</p>
            </div>

            {/* spec sidebar — right */}
            <div className="col-start-1 col-end-13 md:col-start-9 md:col-end-13">
              <dl className={styles.metaRows}>
                <div className={styles.metaRow}>
                  <dt>Stack</dt>
                  <dd>{e.stack.join('  ·  ')}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Fonts</dt>
                  <dd>{e.fonts.join('  ·  ')}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Colors</dt>
                  <dd className={styles.swatches}>
                    {e.colors.map((c) => (
                      <span
                        key={c}
                        className={styles.swatch}
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </dd>
                </div>
              </dl>
              <CopyPrompt prompt={e.prompt} />
            </div>
          </Fragment>
        )
      })}
    </section>
  )
}
