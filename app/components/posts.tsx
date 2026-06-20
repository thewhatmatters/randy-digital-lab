import type { CSSProperties } from 'react'
import { Link } from 'next-view-transitions'
import { formatDate, getBlogPosts } from 'app/notes/utils'
import styles from './posts.module.scss'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <ul className={styles.list}>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post, i) => (
          <li key={post.slug}>
            <Link
              className={styles.row}
              href={`/notes/${post.slug}`}
              style={{ '--i': i } as CSSProperties}
            >
              <span className={styles.date}>
                {formatDate(post.metadata.publishedAt, false)}
              </span>
              <span className={styles.title}>{post.metadata.title}</span>
            </Link>
          </li>
        ))}
    </ul>
  )
}
