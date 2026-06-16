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

// Map the honest degree LABEL (not a measured number) to the human share of
// the contribution bar. Three coarse stops — deliberately not precise, because
// the split isn't measurable; the label is the source of truth, the bar just
// visualizes it. Unknown labels fall back to an even split.
function humanSharePct(degree?: string): number {
  const d = (degree ?? '').toLowerCase()
  if (/\bai-?(drafted|written)\b|heavily ai/.test(d)) return 28
  if (/human-?(written|led)\b|ai-?edited|lightly/.test(d)) return 76
  return 50 // co-written / co-authored / unknown
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

  // Authorship. We credit human(s) and any AI collaborator as distinct authors
  // (frontmatter `authors`). For the visible byline we join the names; for
  // JSON-LD we split them by kind — humans are schema.org Persons, Claude is a
  // SoftwareApplication (the honest machine-readable type for an AI), surfaced
  // as a `contributor` so search engines don't read it as a human author.
  const authors = post.metadata.authors ?? []
  const isAI = (name: string) => /claude|gpt|llm|\bai\b/i.test(name)
  const humanAuthors = authors.filter((a) => !isAI(a.label))
  const aiAuthors = authors.filter((a) => isAI(a.label))
  const byline = authors.map((a) => a.label).join(' & ')
  const ldAuthor = humanAuthors.length
    ? humanAuthors.map((a) => ({ '@type': 'Person', name: a.label }))
    : { '@type': 'Person', name: 'Randy' }

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
            author: ldAuthor,
            ...(aiAuthors.length && {
              contributor: aiAuthors.map((a) => ({
                '@type': 'SoftwareApplication',
                name: a.label,
                applicationCategory: 'AI writing assistant',
              })),
            }),
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
          {byline && (
            <p className="note-byline">
              <span className="note-byline__by">By</span> {byline}
            </p>
          )}
        </div>
      </header>
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
      {authors.length > 0 && (
        <footer className="col-start-1 col-end-13 md:col-end-8 note-colophon">
          <h2 className="note-colophon__label">Credits</h2>
          <div className="note-colophon__authors">
            <div className="colo-side">
              {humanAuthors.map((a) => (
                <div key={a.label} className="colo-author">
                  <span className="colo-avatar colo-avatar--human" aria-hidden>
                    {a.label.charAt(0)}
                  </span>
                  <span className="colo-author__text">
                    <span className="colo-author__name">{a.label}</span>
                    <span className="colo-author__role">{a.value}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="colo-side colo-side--end">
              {aiAuthors.map((a) => (
                <div key={a.label} className="colo-author colo-author--ai">
                  <span className="colo-author__text">
                    <span className="colo-author__name">{a.label}</span>
                    <span className="colo-author__role">{a.value}</span>
                  </span>
                  <span className="colo-avatar colo-avatar--ai" aria-hidden>
                    {a.label.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="note-bar"
            style={{ ['--human-share' as string]: `${humanSharePct(post.metadata.aiDegree)}%` }}
            role="img"
            aria-label={`Contribution split — ${byline}${
              post.metadata.aiDegree ? `: ${post.metadata.aiDegree}` : ''
            }`}
          >
            <span className="note-bar__seg note-bar__seg--human" />
            <span className="note-bar__seg note-bar__seg--ai" />
          </div>
        </footer>
      )}
    </section>
  )
}
