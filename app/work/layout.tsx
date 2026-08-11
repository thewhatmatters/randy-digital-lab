// Work section layout — declares the @modal parallel slot next to the page
// tree. On a soft navigation from the index, app/work/@modal/(.)[slug]
// intercepts /work/[slug] and renders the project modal here, OVER the still-
// mounted index (children keep their previous state). On a hard load of the
// same URL the slot falls back to its default (null) and children render the
// full page — one URL, two presentations (AC 4).
export default function WorkLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
