import { Fragment } from 'react'
import { experiments } from './experiments'
import { CopyPrompt } from 'app/components/copy-prompt'

export const metadata = {
  title: 'Lab',
  description:
    'A lab of self-contained experiments — each a small project poking at a single UI element or interaction.',
}

export default function Page() {
  return (
    <section className="grid-page">
      <h1 className="col-start-1 col-end-13 md:col-end-9 text-2xl font-semibold tracking-tighter">
        Lab
      </h1>
      <p className="col-start-1 col-end-13 md:col-end-8 mt-4 text-muted">
        Self-contained experiments — each a small project poking at a single UI
        element or interaction. All live below.
      </p>

      {experiments.map((e) => {
        const Experiment = e.component
        return (
          <Fragment key={e.slug}>
            <div
              id={e.slug}
              className="col-start-1 col-end-13 lab-frame mt-16 scroll-mt-24"
            >
              <Experiment />
            </div>

            {/* description — left */}
            <div className="col-start-1 col-end-13 md:col-end-8 lab-desc">
              <a href={`#${e.slug}`} className="lab-meta__head">
                <span className="lab-meta__num">{e.number}</span>
                <h2 className="lab-meta__title">{e.title}</h2>
              </a>
              <p className="lab-meta__blurb">{e.summary}</p>
            </div>

            {/* spec sidebar — right */}
            <div className="col-start-1 col-end-13 md:col-start-9 md:col-end-13 lab-meta">
              <dl className="lab-meta__rows">
                <div className="lab-meta__row">
                  <dt>Stack</dt>
                  <dd>{e.stack.join('  ·  ')}</dd>
                </div>
                <div className="lab-meta__row">
                  <dt>Fonts</dt>
                  <dd>{e.fonts.join('  ·  ')}</dd>
                </div>
                <div className="lab-meta__row">
                  <dt>Colors</dt>
                  <dd className="lab-swatches">
                    {e.colors.map((c) => (
                      <span
                        key={c}
                        className="lab-swatch"
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
