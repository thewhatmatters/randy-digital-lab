import { getBlogPosts } from 'app/notes/utils'
import { renderFeed } from 'lib/rss'

// Thin shell — the feed itself (ordering, escaping, guid/lastBuildDate,
// notes-only item set) is composed by lib/rss.ts, where it's unit-testable.

export async function GET() {
  return new Response(renderFeed(getBlogPosts()), {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
