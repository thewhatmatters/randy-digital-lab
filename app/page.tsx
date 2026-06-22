import type { CSSProperties } from 'react'
import { Experience } from 'app/components/experience'
import { Services } from 'app/components/services'
// import { StackMatrix } from 'app/components/charts/stack-matrix' // hidden for now
import { Hero } from 'app/components/hero'

export default function Page() {
  return (
    <>
      {/* full-bleed kinetic intro */}
      <Hero />

      <section className="grid-page">
        {/* experience — full-width editorial work index. --section-order cascades
            the post-hero reveal down the page (0 reveals first, then 1, …). */}
        <div
          className="col-start-1 col-end-13 mt-8"
          style={{ '--section-order': 0 } as CSSProperties}
        >
          <Experience />
        </div>
        {/* services — editorial 3-column row list */}
        <div
          className="col-start-1 col-end-13 mt-16"
          style={{ '--section-order': 1 } as CSSProperties}
        >
          <Services />
        </div>
        {/* stack + notes hidden on the home page for now */}
      </section>
    </>
  )
}
