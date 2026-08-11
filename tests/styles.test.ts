// Style-donor snapshot tests — T-003 AC 2.
//
// The two donor modules are the reference implementations of the shared card
// and chip skins (`_card.scss` / `_chip.scss`, extracted in T-002 round 2.6).
// Compiling them pins the partials transitively: any edit to a donor OR to a
// shared partial changes the compiled CSS and fails the diff. Work-index is
// deliberately NOT snapshotted — it is a consumer, expected to evolve.
//
// Updating a baseline is an explicit, reviewable act:
//   UPDATE_SNAPSHOTS=1 pnpm test
// then review the git diff of tests/__snapshots__/ before committing.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDir, '..')
const snapshotDir = path.join(testDir, '__snapshots__')

const donors = [
  {
    source: 'app/components/services.module.scss',
    baseline: 'services.module.css',
    sentinel: '.tile', // guards against an accidentally-hollow snapshot
  },
  {
    source: 'app/components/command-bar.module.scss',
    baseline: 'command-bar.module.css',
    sentinel: '.chip',
  },
]

/** First differing line between two strings, for a failure message that teaches. */
function firstDiffLine(expected: string, actual: string) {
  const a = expected.split('\n')
  const b = actual.split('\n')
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      return {
        line: i + 1,
        expected: a[i] ?? '<end of baseline>',
        actual: b[i] ?? '<end of compiled output>',
      }
    }
  }
  return null
}

describe('style-donor snapshots (shared _card.scss / _chip.scss skins)', () => {
  for (const donor of donors) {
    it(`${donor.source} compiles byte-identical to its committed baseline`, () => {
      const compiled = sass.compile(path.join(projectRoot, donor.source), {
        style: 'expanded',
      }).css
      assert.ok(
        compiled.includes(donor.sentinel),
        `Compiled CSS for ${donor.source} is missing its sentinel selector "${donor.sentinel}" — compile produced something unexpected; refusing to compare.`
      )

      const baselinePath = path.join(snapshotDir, donor.baseline)

      if (process.env.UPDATE_SNAPSHOTS) {
        fs.mkdirSync(snapshotDir, { recursive: true })
        fs.writeFileSync(baselinePath, compiled)
        return
      }

      assert.ok(
        fs.existsSync(baselinePath),
        `Missing baseline ${path.relative(projectRoot, baselinePath)}. ` +
          `If this is a fresh checkout something deleted the committed snapshot; ` +
          `to (re)generate intentionally: UPDATE_SNAPSHOTS=1 pnpm test, then review the git diff.`
      )
      const baseline = fs.readFileSync(baselinePath, 'utf-8')

      if (compiled !== baseline) {
        const diff = firstDiffLine(baseline, compiled)
        assert.fail(
          `Compiled CSS of ${donor.source} drifted from its baseline ` +
            `(first difference at line ${diff?.line}):\n` +
            `  baseline: ${diff?.expected}\n` +
            `  compiled: ${diff?.actual}\n` +
            `The donor or a shared partial (_card.scss / _chip.scss) changed. ` +
            `If the change is intentional: UPDATE_SNAPSHOTS=1 pnpm test, ` +
            `then review the tests/__snapshots__/ git diff as part of the change.`
        )
      }
    })
  }
})
