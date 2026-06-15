import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section className="grid-page">
      {/* masthead — display type, intentionally not full-width */}
      <h1 className="col-start-1 col-end-13 md:col-end-9 text-2xl font-semibold tracking-tighter">
        Randy
      </h1>
      {/* bio — narrow measure (~7 cols ≈ prose width) for readability */}
      <p className="col-start-1 col-end-13 md:col-end-8 mt-4">
        {`This is my corner of the web — a portfolio of work, notes on what I'm
        thinking about, and a lab of small interactive experiments. Still
        taking shape.`}
      </p>
      {/* post list — wider; short rows tolerate more columns */}
      <div className="col-start-1 col-end-13 md:col-end-11 mt-12">
        <BlogPosts />
      </div>
    </section>
  )
}
