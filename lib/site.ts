import type { Metadata } from 'next'

// The site's identity, owned in ONE place (T-008). baseUrl used to live in
// app/sitemap.ts — a route file exporting the canonical origin, which every
// other route then imported from the sitemap. It lives here so the origin is
// a plain library fact, not a side effect of one route's module.
//
// Directive-free on purpose: importable by Server Components, route
// handlers, and metadata code alike.

export const baseUrl = 'https://randy.digital'

export const siteName = 'randy.digital'

/**
 * Shared per-page metadata for the two [slug] routes (notes + work). The two
 * generateMetadata implementations had diverged copies of this object — the
 * notes copy is where the relative-URL JSON-LD bug family came from. One
 * builder, absolute URLs everywhere.
 *
 * `image` (optional) is a site-relative path from frontmatter; without one
 * the dynamic /og card is used. Either way the emitted URL is absolute.
 */
export function pageMetadata({
  title,
  description,
  publishedTime,
  path,
  image,
}: {
  title: string
  description: string
  publishedTime: string
  /** Site-relative page path, e.g. `/notes/${slug}`. */
  path: string
  /** Optional site-relative image path; falls back to the /og card. */
  image?: string
}): Metadata {
  const ogImage = ogImageUrl(title, image)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}${path}`,
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

/**
 * Absolute URL of a page's social/JSON-LD image: the frontmatter image if
 * one is set, else the dynamic /og card for the title.
 */
export function ogImageUrl(title: string, image?: string): string {
  return image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`
}
