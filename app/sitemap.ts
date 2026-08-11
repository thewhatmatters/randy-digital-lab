import { getBlogPosts } from 'app/notes/utils'
import { getWorkProjects } from 'app/work/utils'

export const baseUrl = 'https://randy.digital'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/notes/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let work = getWorkProjects().map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: project.metadata.publishedAt,
  }))

  let routes = ['', '/work', '/notes', '/lab'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...work, ...blogs]
}
