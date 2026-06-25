import { registerCors } from './cors.js'
import { registerHelmet } from './helmet.js'
import { registerRateLimit } from './rateLimit.js'
import { registerStatic } from './static.js'

export async function registerPlugins (app) {
  await registerCors(app)
  await registerHelmet(app)
  await registerRateLimit(app)
  await registerStatic(app)
}
