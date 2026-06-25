export function toNewsListDTO (apiData) {
  return (apiData.articles ?? []).map(item => ({
    uuid:        item.id,
    title:       item.title,
    publisher:   item.publisher ?? 'Desconhecido',
    publishedAt: item.publishedAt,
    url:         item.url,
    description: item.description ?? '',
  }))
}

export function toArticleDTO (item) {
  if (!item) return null
  return {
    uuid:        item.id,
    title:       item.title,
    publisher:   item.publisher ?? 'Desconhecido',
    publishedAt: item.publishedAt,
    url:         item.url,
    description: item.description ?? '',
    originalUrl: item.url,
  }
}
