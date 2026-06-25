import cors from '@fastify/cors'
import { env } from '../config/env.js'

export async function registerCors (app) {
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
}
