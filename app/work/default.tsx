// Children-slot fallback: if a soft navigation lands on /work/[slug] from
// OUTSIDE the work section (so the index was never mounted), the modal slot
// intercepts but the children slot has no previous state to keep — render
// the index under the modal so the overlay always dims something sensible.
export { default } from './page'
