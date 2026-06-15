'use client'

import { useState } from 'react'
import { Button } from './button'

/**
 * "Copy prompt" — copies an experiment's agent-ready spec to the clipboard so an
 * agent can recreate it (see docs/ideas.md #2). Mono button; flips to "Copied".
 */
export function CopyPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <Button
      variant="default"
      className="mt-6"
      onClick={copy}
      icon={copied ? <CheckIcon /> : <CopyIcon />}
      aria-label="Copy the agent prompt for this experiment"
    >
      {copied ? 'Copied' : 'Copy prompt'}
    </Button>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}
