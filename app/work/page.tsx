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

      {/* placeholder index — replace with the project list once content exists
          (mirror notes/: MDX per project + a numbered index here). */}
      <div className="col-start-1 col-end-13 mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
          Coming soon
        </p>
      </div>
    </section>
  )
}
