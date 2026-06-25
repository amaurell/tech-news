import { searchSchema, articleSchema } from './news.schema.js'
import { searchNewsHandler, articleHandler } from './news.controller.js'

export async function newsRoutes (app) {
  app.get('/search', { schema: searchSchema }, searchNewsHandler)
  app.get('/article', { schema: articleSchema }, articleHandler)
}
