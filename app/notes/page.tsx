import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Notes',
  description: 'Read my notes.',
}

export default function Page() {
  return (
    <section className="grid-page">
      <h1 className="col-start-1 col-end-13 md:col-end-9 font-semibold text-2xl tracking-tighter">
        Notes
      </h1>
      <div className="col-start-1 col-end-13 md:col-end-11 mt-8">
        <BlogPosts />
      </div>
    </section>
  )
}
