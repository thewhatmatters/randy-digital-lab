import { notFound } from 'next/navigation'
import { getWorkProjects } from 'app/work/utils'
import { WorkCarousel } from 'app/components/work-carousel'
import { WorkDetailContent } from 'app/components/work-detail'
import { baseUrl } from 'app/sitemap'
import styles from './page.module.scss'

// Full-page /work/[slug] — what a direct visit, refresh, or share renders
// (AC 4). Same content and anatomy as the modal (carousel header, then the
// content section, built by the same components), laid out as a centered
// sheet at the modal's width so the two presentations read as one design.
// Soft navigations from the index never reach this file — the @modal slot
// intercepts them.

export async function generateStaticParams() {
  let projects = getWorkProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({ params }) {
  let { slug } = await params
  let project = getWorkProjects().find((project) => project.slug === slug)
  if (!project) {
    return
  }

  let { title, publishedAt: publishedTime, summary: description } =
    project.metadata
  // OG goes through the /og route (raster) — the project images are SVG,
  // which link unfurlers largely ignore.
  let ogImage = `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/work/${project.slug}`,
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

export default async function WorkProject({ params }) {
  let { slug } = await params
  let project = getWorkProjects().find((project) => project.slug === slug)

  if (!project) {
    notFound()
  }

  let { title, publishedAt, summary, images } = project.metadata

  return (
    <section className="grid-page">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: title,
            datePublished: publishedAt,
            description: summary,
            image: images.map((src) => `${baseUrl}${src}`),
            url: `${baseUrl}/work/${project.slug}`,
            author: { '@type': 'Person', name: 'Randy Daniel' },
          }),
        }}
      />
      <div className={`col-start-1 col-end-13 ${styles.sheet}`}>
        <WorkCarousel images={images} title={title} priority framed />
        <WorkDetailContent project={project} variant="page" />
      </div>
    </section>
  )
}
