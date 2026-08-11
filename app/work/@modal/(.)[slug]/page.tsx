import { notFound } from 'next/navigation'
import { getWorkProjects } from 'app/work/utils'
import { WorkModal } from 'app/components/work-modal'
import { WorkCarousel } from 'app/components/work-carousel'
import { WorkDetailContent } from 'app/components/work-detail'

// Intercepted /work/[slug] — the morph-modal presentation (AC 4/10). Reached
// only by soft navigation (tile clicks); hard loads render the sibling full
// page instead. Server Component: the carousel and the modal shell are the
// detail's only client islands, and the MDX body arrives server-rendered as
// the shell's children.
export default async function WorkProjectModal({ params }) {
  let { slug } = await params
  let project = getWorkProjects().find((project) => project.slug === slug)

  if (!project) {
    notFound()
  }

  let { title, images } = project.metadata

  return (
    <WorkModal slug={project.slug} titleId="work-modal-title">
      <WorkCarousel images={images} title={title} />
      <WorkDetailContent
        project={project}
        titleId="work-modal-title"
        variant="modal"
      />
    </WorkModal>
  )
}
