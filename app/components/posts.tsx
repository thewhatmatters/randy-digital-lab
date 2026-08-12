import type { CSSProperties } from 'react'
import { Link } from 'next-view-transitions'
import { getBlogPosts } from 'app/notes/utils'
import { formatDate, newestFirst } from 'lib/dates'
import styles from './posts.module.scss'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <ul className={styles.list}>
      {newestFirst(allBlogs).map((post, i) => (
        <li key={post.slug}>
          <Link
            className={styles.row}
            href={`/notes/${post.slug}`}
            style={{ '--i': i } as CSSProperties}
          >
            <span className={styles.date}>
              {formatDate(post.metadata.publishedAt)}
            </span>
            <span className={styles.title}>{post.metadata.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
