import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { Button } from 'app/components/button'
import { formatDate, getBlogPosts } from 'app/notes/utils'
import { baseUrl } from 'app/sitemap'

function ArrowUpRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

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
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      <h1 className="col-start-1 col-end-13 md:col-end-8 title font-semibold text-2xl tracking-tighter">
        {colonIdx === -1 ? (
          title
        ) : (
          <>
            <span className="block">{title.slice(0, colonIdx + 1)}</span>
            {title.slice(colonIdx + 2)}
          </>
        )}
      </h1>
      <div className="col-start-1 col-end-13 md:col-end-8 flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <div className="band">
        <article className="col-start-1 col-end-13 md:col-end-8 prose">
          <CustomMDX source={post.content} />
        </article>
        {(post.metadata.stack || post.metadata.ctaHref) && (
          <aside className="col-start-1 col-end-13 md:col-start-9 md:col-end-13 note-aside">
            <div className="note-aside__inner">
              {post.metadata.stack && (
                <dl className="lab-meta__rows">
                  {post.metadata.stack.map((item) => (
                    <div key={item.label} className="lab-meta__row">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {post.metadata.ctaHref && (
                <Button
                  variant="accent"
                  className="mt-6"
                  href={post.metadata.ctaHref}
                  icon={<ArrowUpRightIcon />}
                >
                  {post.metadata.ctaLabel ?? 'Learn more'}
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}
