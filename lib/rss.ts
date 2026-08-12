import { baseUrl, siteName } from 'lib/site'
import { newestFirst } from 'lib/dates'

// The RSS feed, composed as a pure function so its hygiene is unit-testable
// without a running server (T-008). The route (app/rss/route.ts) is a thin
// shell over renderFeed. Item set per the T-008 gate decision: NOTES ONLY.

type FeedPost = {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary?: string
  }
}

/**
 * Escape a value for use as XML text content (also safe for attribute
 * values — both quote styles are covered). Every interpolated field in the
 * feed goes through this: a title containing `&` or `<` is feed data, not
 * feed markup.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Render the full RSS 2.0 document for the given notes: newest first, every
 * interpolated field XML-escaped, one <guid> per item (the permalink), and a
 * <lastBuildDate> stamped at render time (= build time — the route is
 * static).
 */
export function renderFeed(posts: FeedPost[]): string {
  const itemsXml = newestFirst(posts)
    .map((post) => {
      const link = escapeXml(`${baseUrl}/notes/${post.slug}`)
      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${link}</link>
          <guid>${link}</guid>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>${escapeXml(siteName)}</title>
        <link>${escapeXml(baseUrl)}</link>
        <description>Notes from ${escapeXml(siteName)}</description>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${itemsXml}
    </channel>
  </rss>`
}
