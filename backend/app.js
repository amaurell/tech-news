import Fastify from 'fastify'
import { registerPlugins } from './plugins/index.js'
import { newsRoutes } from './modules/news/news.routes.js'
import { errorHandler } from './shared/middleware/errorHandler.js'

export async function buildApp () {
  const app = Fastify({ logger: true, trustProxy: true })
  await registerPlugins(app)

  app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }))

  app.get('/favicon.ico', (req, reply) => reply.code(204).send())

  app.register(newsRoutes, { prefix: '/api/news' })
  app.setErrorHandler(errorHandler)
  return app
}
