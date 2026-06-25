import { NewsRepository } from './news.repository.js'
import { toNewsListDTO, toArticleDTO } from './news.dto.js'

export class NewsService {
  #repository

  constructor (repository = new NewsRepository()) {
    this.#repository = repository
  }

  async getNewsByTopic (params) {
    const raw = await this.#repository.fetchNewsByTopic(params)
    const news = toNewsListDTO(raw)
    return news.slice(0, params.quantity)
  }

  async getArticle (uuid) {
    const raw = await this.#repository.fetchArticleById(uuid)
    return toArticleDTO(raw)
  }
}
