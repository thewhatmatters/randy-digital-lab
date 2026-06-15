---
source: "https://www.youtube.com/watch?v=xaQG-eD9d58"
type: youtube
title: "The 60% Rule: stopping context rot (Dylan Davis)"
ingested: 2026-06-14
tier: captions (keyless)
---

The "60% rule" is a heuristic for fighting **context rot** — the gradual,
silent decline in an LLM's quality as its context window fills. It is **not a
hard wall or crash**; the model keeps responding, it just gets quietly worse.

## The core mental model — the whiteboard (00:24–02:17)
- Think of the model's context window as a whiteboard. Everything counts toward
  filling it: your prompts, the model's replies, attached files, and the
  model's own thinking/reasoning (01:44).
- Performance vs. context-usage curve (00:56–01:14): up to ~25% the model is
  fully effective; **around 60% it still works but is starting to degrade**;
  **past ~60% toward ~95% effectiveness drops off rapidly**.
- Window sizes vary by model (01:17–02:17): ~60k tokens (ChatGPT UI in
  practice), 200k (Claude), up to 1M (Gemini). 60k ≈ half a novel; 1M ≈ 7–8
  novels.
- Goal (02:44): "utilize as much intelligence as possible before it starts to
  degrade" — act at ~60%, before the steep part of the curve.

## The 4 warning signs you're degrading (03:38–07:08)
1. **Instructions get ignored** — e.g. a "keep replies under 200 words" rule
   silently stops being followed ~message 16–20 (03:54).
2. **The model contradicts itself** — reverses earlier advice within the same
   thread (04:33).
3. **Facts disappear / hallucinate** — an early figure ($9,000) silently
   changes later ($6,500) with nothing in between to justify it (05:20).
4. **Automatic compaction** — Claude auto-summarizes the thread around ~90–95%
   and continues with that summary; you lose control over *what* gets kept
   (06:01–07:07).

## Measuring usage (07:08–08:54)
UI chat tools don't show context usage (coding tools do). Workaround: paste the
conversation / drop the file into Google AI Studio to read its token count and
estimate how full the window is.

## The 4 tactics to extend useful intelligence (08:54–16:11)
1. **Handoff** (08:58) — at ~60% (or at the first warning sign), ask the model
   to summarize the thread answering four questions — what we've covered, key
   decisions, where we left off (to-dos), and a specific ask for the next
   model — then paste that into a **fresh conversation**. Starts clean with the
   essentials preserved.
2. **Strategic file choice** (10:38) — know which files are "cheap" (text/docs)
   vs "expensive" (images, video, big/complex PDFs, multi-tab spreadsheets);
   feed only the slice that matters, not the whole file.
3. **Experimentation** (13:13) — build intuition for task complexity; if a task
   fails, break it into subtasks across separate chats.
4. **Strategic (proactive) summaries** (16:11) — for people who insist on
   staying in one thread (mainly ChatGPT/Gemini): every ~5–15 exchanges, ask
   for a brief summary to refresh memory. Does what Claude's compaction does,
   but proactively and under your control.

## Why this matters for the note
The trigger to act at ~60% is **preserving quality before the steep
degradation**, not avoiding a crash. "Hitting a wall" overstates it — the real
failure mode is the model quietly forgetting instructions, contradicting
itself, and dropping facts. Acting at 60% (hand off or compact) keeps the agent
in its reliable range.
