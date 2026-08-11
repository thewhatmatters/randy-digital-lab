import { baseUrl } from 'app/sitemap'
import { getBlogPosts } from 'app/notes/utils'
import { newestFirst } from 'lib/dates'

export async function GET() {
  let allBlogs = await getBlogPosts()

  const itemsXml = newestFirst(allBlogs)
    .map(
      (post) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/notes/${post.slug}</link>
          <description>${post.metadata.summary || ''}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>randy.digital</title>
        <link>${baseUrl}</link>
        <description>Notes from randy.digital</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
