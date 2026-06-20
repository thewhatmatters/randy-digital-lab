import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Notes',
  description:
    'Notes on building software and the craft around it — design, tools, and what I’m still figuring out.',
}

export default function Page() {
  return (
    <section className="grid-page">
      <h1 className="col-start-1 col-end-13 md:col-end-9 text-2xl font-semibold tracking-tighter">
        Notes
      </h1>
      <p className="col-start-1 col-end-13 md:col-end-8 mt-4 text-muted">
        Notes on building software and the craft around it — design, tools, and
        what I’m still figuring out.
      </p>
      <div className="col-start-1 col-end-13 mt-16">
        <BlogPosts />
      </div>
    </section>
  )
}
