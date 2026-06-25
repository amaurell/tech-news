import staticPlugin from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function registerStatic (app) {
  await app.register(staticPlugin, {
    root: join(__dirname, '../../frontend'),
    prefix: '/',
    decorateReply: false,
  })
}
