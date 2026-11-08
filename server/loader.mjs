// Lets the server import the shared game data/engine that use the "@/" alias and extensionless paths.
const SRC = new URL('../src/', import.meta.url).href
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('@/')) spec = SRC + spec.slice(2)
  if ((spec.startsWith('file:') || spec.startsWith('./') || spec.startsWith('../')) && !/\.(js|mjs|json)$/.test(spec)) spec += '.js'
  return next(spec, ctx)
}
