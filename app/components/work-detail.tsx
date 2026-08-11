import { CustomMDX } from 'app/components/mdx'
import { Button } from 'app/components/button'
import { formatDate } from 'app/notes/utils'
import type { WorkMetadata } from 'app/work/utils'
import styles from './work-detail.module.scss'

// The content section of a work detail — one construction shared by the
// project modal and the full-page route (AC 4: direct visit renders the same
// content full-page). Anatomy, in order, directly under the carousel header
// with no gap: title + date with the "Visit site ↗" CTA beside them (absent
// liveUrl → nothing, never a dead button), the prose writeup, then the meta
// rows. Server Component — the modal shell and carousel are the only client
// islands in the detail (AC 10).

type WorkProject = {
  metadata: WorkMetadata
  slug: string
  content: string
}

export function WorkDetailContent({
  project,
  titleId,
  variant,
}: {
  project: WorkProject
  /** Wires the modal's aria-labelledby to this h1. */
  titleId?: string
  /** `modal` pads like a card interior; `page` sits on the page grid. */
  variant: 'modal' | 'page'
}) {
  const { title, publishedAt, liveUrl, meta } = project.metadata

  return (
    <div
      className={`${styles.content} ${
        variant === 'modal' ? styles.inModal : styles.inPage
      }`}
      // The modal's open morph fades this block in after the image leads.
      data-work-detail-content=""
    >
      <header className={styles.head}>
        <div>
          <h1 id={titleId} className="title font-semibold text-2xl tracking-tighter">
            {title}
          </h1>
          <time className={styles.date} dateTime={publishedAt}>
            {formatDate(publishedAt)}
          </time>
        </div>
        {liveUrl && (
          <Button
            href={liveUrl}
            variant="accent"
            trailingIcon="↗"
            aria-label={`Visit site — ${title} (opens in a new tab)`}
          >
            Visit site
          </Button>
        )}
      </header>

      <article className={`prose ${styles.article}`}>
        <CustomMDX source={project.content} />
      </article>

      {meta?.length ? (
        <dl className={styles.metaList} aria-label="Project at a glance">
          {meta.map((row) => (
            <div key={row.label} className={styles.metaRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}
