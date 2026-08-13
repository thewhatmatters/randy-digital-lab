'use client'

import { useState, type ReactNode } from 'react'
import { Glow } from 'app/components/glow'
import styles from './page.module.scss'

// The experiment frame's wake island (T-011) — the ONLY client state the lab
// index needs: hover/focus wakes the shared glow ground behind the live
// experiment, exactly the work-tile mechanism (React state for the shader
// mount/speed, the module's :hover/:focus-within for the opacity fade — one
// mechanism, two surfaces, so they cannot drift). The experiment renders as
// children through the boundary: this island wraps it, never touches it.

export function LabFrame({
  id,
  className,
  children,
}: {
  /** Anchor target — the meta caption's #slug link points here. */
  id: string
  /** Grid placement utilities from the page (the route owns layout). */
  className?: string
  children: ReactNode
}) {
  // Mirrors work-tile.tsx: React's onFocus/onBlur bubble (focusin/focusout
  // semantics), so tabbing into any control inside the experiment wakes the
  // frame just like hovering it.
  const [awake, setAwake] = useState(false)
  const wake = () => setAwake(true)
  const sleep = () => setAwake(false)

  return (
    <div
      id={id}
      className={className ? `${styles.frame} ${className}` : styles.frame}
      onPointerEnter={wake}
      onPointerLeave={sleep}
      onFocus={wake}
      onBlur={sleep}
    >
      {/* Glow ground — the same mesh flow as the /work tiles, seated as the
          frame's background (negative z-index inside the frame's isolated
          stacking context; the frame's overflow clips it to the border). The
          experiment draws above it, untouched. */}
      <Glow active={awake} className={styles.glow} />
      {children}
    </div>
  )
}
