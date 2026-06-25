import { NewsService } from './news.service.js'

const service = new NewsService()

export async function searchNewsHandler (request, reply) {
  const { topic, q, quantity, language, country } = request.query
  const news = await service.getNewsByTopic({ topic, q, quantity, language, country })
  return reply.code(200).send({ ok: true, data: news })
}

export async function articleHandler (request, reply) {
  const { uuid } = request.query
  if (!uuid) return reply.code(400).send({ ok: false, error: { message: 'UUID é obrigatório' } })
  const article = await service.getArticle(uuid)
  if (!article) return reply.code(404).send({ ok: false, error: { message: 'Artigo não encontrado' } })
  return reply.code(200).send({ ok: true, data: article })
}
