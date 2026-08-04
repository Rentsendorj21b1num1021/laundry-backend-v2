import path from 'node:path'
import { pathToFileURL } from 'node:url'

const rootURL = pathToFileURL(`${path.resolve(import.meta.dirname, '..')}/`).href

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return nextResolve(rootURL + specifier.slice(2), context)
  }

  return nextResolve(specifier, context)
}
