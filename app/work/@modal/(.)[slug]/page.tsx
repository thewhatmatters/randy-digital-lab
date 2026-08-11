import { notFound } from 'next/navigation'
import { getWorkProjects } from 'app/work/utils'
import { WorkModal } from 'app/components/work-modal'
import { WorkCarousel } from 'app/components/work-carousel'
import { parseIndexParam } from 'app/components/work-carousel-position'
import { WorkDetailContent } from 'app/components/work-detail'

// Intercepted /work/[slug] — the morph-modal presentation (AC 4/10). Reached
// only by soft navigation (tile clicks); hard loads render the sibling full
// page instead. Server Component: the carousel and the modal shell are the
// detail's only client islands, and the MDX body arrives server-rendered as
// the shell's children.
//
// T-004: the tile's current slide arrives as ?i=N. This route is dynamic
// (rendered per soft navigation), so reading searchParams here costs nothing
// — the carousel's very first paint is already at slide N and the morph grows
// straight into the image the tile was showing. `syncSlug` wires the reverse:
// as the user pages in the modal, the source tile follows (close write-back).
export default async function WorkProjectModal({ params, searchParams }) {
  let { slug } = await params
  let { i } = await searchParams
  let project = getWorkProjects().find((project) => project.slug === slug)

  if (!project) {
    notFound()
  }

  let { title, images } = project.metadata

  return (
    <WorkModal slug={project.slug} titleId="work-modal-title">
      <WorkCarousel
        images={images}
        title={title}
        initialIndex={parseIndexParam(i)}
        syncSlug={project.slug}
      />
      <WorkDetailContent
        project={project}
        titleId="work-modal-title"
        variant="modal"
      />
    </WorkModal>
  )
}
