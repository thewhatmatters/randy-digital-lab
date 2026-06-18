import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/notes/utils'
import { baseUrl } from 'app/sitemap'
import styles from 'app/components/margin.module.scss'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  let { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/notes/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({ params }) {
  let { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  // "Lead: subtitle" titles break after the colon — the lead on its own line,
  // the rest below. Titles without a ": " render as one (pretty-wrapped) block.
  const title = post.metadata.title
  const colonIdx = title.indexOf(': ')

  return (
    <section className="grid-page">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/notes/${post.slug}`,
            author: { '@type': 'Person', name: 'Randy Daniel' },
          }),
        }}
      />
      <header className="col-start-1 col-end-13 md:col-end-8 mb-8">
        <h1 className="title font-semibold text-2xl tracking-tighter">
          {colonIdx === -1 ? (
            title
          ) : (
            <>
              <span className="block">{title.slice(0, colonIdx + 1)}</span>
              {title.slice(colonIdx + 2)}
            </>
          )}
        </h1>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm">
          <time className="text-neutral-600 dark:text-neutral-400">
            {formatDate(post.metadata.publishedAt)}
          </time>
        </div>
      </header>
      <div className="band">
        {/* Article spans the full content width; the prose text caps itself at a
            reading measure (see .article in margin.module.scss), leaving the right
            column free for inline <Margin>/<PullQuote>/<Figure> marginalia that
            float out anchored to where they're written in the MDX. */}
        <article className={`col-start-1 col-end-13 ${styles.article} prose`}>
          <CustomMDX source={post.content} />
        </article>
      </div>
    </section>
  )
}
