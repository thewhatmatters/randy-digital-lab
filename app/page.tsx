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
        {/* experience — full-width editorial work index */}
        <div className="col-start-1 col-end-13 mt-8">
          <Experience />
        </div>
        {/* services — bento on the 12-column grid */}
        <div className="col-start-1 col-end-13 mt-16">
          <Services />
        </div>
        {/* stack + notes hidden on the home page for now */}
      </section>
    </>
  )
}
