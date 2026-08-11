// Test-runner module hooks (zero-dependency). Registered via
// `node --import ./tests/register.mjs` in the package.json "test" script.
// See tests/resolve-ts.mjs for what (and why) this resolves.
import { register } from 'node:module'

register('./resolve-ts.mjs', import.meta.url)
