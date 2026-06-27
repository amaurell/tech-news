import cors from '@fastify/cors'
import { env } from '../config/env.js'

export async function registerCors (app) {
  const origin = env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN
  await app.register(cors, {
    origin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
}
