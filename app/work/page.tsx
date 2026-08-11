import { WorkProjects } from 'app/components/work-index'

export const metadata = {
  title: 'Work',
  description:
    'Selected work — projects across design and engineering. Case studies on the way.',
}

export default function Page() {
  return (
    <section className="grid-page">
      <h1 className="col-start-1 col-end-13 md:col-end-9 text-2xl font-semibold tracking-tighter">
        Work
      </h1>
      <p className="col-start-1 col-end-13 md:col-end-8 mt-4 text-muted">
        Selected work — projects across design and engineering. Case studies on
        the way.
      </p>
      <div className="col-start-1 col-end-13 mt-16">
        <WorkProjects />
      </div>
    </section>
  )
}
