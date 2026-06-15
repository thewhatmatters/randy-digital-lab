import { getBlogPosts } from 'app/notes/utils'

export const baseUrl = 'https://randy.digital'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/notes/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/notes', '/lab'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
