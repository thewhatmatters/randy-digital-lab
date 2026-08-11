// Resolve hook: mirrors tsconfig's `baseUrl: "."` for bare, extensionless
// specifiers under plain Node. The app imports `lib/mdx` (resolved by
// tsc/Next via baseUrl), which Node's ESM loader cannot resolve on its own —
// T-002's verify worked around this by inlining the specifier; this hook is
// the reusable version. Only fires when default resolution has already
// failed, and only maps `<specifier>` -> `<projectRoot>/<specifier>.ts` when
// that file exists. No behavior change for anything Node already resolves.
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    const isBare =
      !specifier.startsWith('.') &&
      !specifier.startsWith('/') &&
      !specifier.startsWith('file:') &&
      !specifier.startsWith('node:')
    if (isBare && !path.extname(specifier)) {
      const candidate = path.join(projectRoot, `${specifier}.ts`)
      if (existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context)
      }
    }
    throw error
  }
}
