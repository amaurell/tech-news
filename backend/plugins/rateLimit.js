import rateLimit from '@fastify/rate-limit'
import { env } from '../config/env.js'

export async function registerRateLimit (app) {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Limite de requisições atingido. Aguarde um momento.'
    })
  })
}
