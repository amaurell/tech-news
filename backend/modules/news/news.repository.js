import { XMLParser } from 'fast-xml-parser'
import { ExternalApiError } from '../../shared/errors/ExternalApiError.js'

const GOOGLE_NEWS_BASE = 'https://news.google.com/rss'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
})

const articleCache = new Map()
let idCounter = 0

function generateId () {
  return `gn-${Date.now()}-${++idCounter}`
}

function decodeEntities (text) {
  if (!text) return ''
  const map = {
    '&atilde;': 'ã', '&Atilde;': 'Ã',
    '&ccedil;': 'ç', '&Ccedil;': 'Ç',
    '&aacute;': 'á', '&Aacute;': 'Á',
    '&eacute;': 'é', '&Eacute;': 'É',
    '&iacute;': 'í', '&Iacute;': 'Í',
    '&oacute;': 'ó', '&Oacute;': 'Ó',
    '&uacute;': 'ú', '&Uacute;': 'Ú',
    '&acirc;': 'â', '&Acirc;': 'Â',
    '&ecirc;': 'ê', '&Ecirc;': 'Ê',
    '&ocirc;': 'ô', '&Ocirc;': 'Ô',
    '&otilde;': 'õ', '&Otilde;': 'Õ',
    '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
  }
  let result = text
  for (const [entity, char] of Object.entries(map)) {
    result = result.replaceAll(entity, char)
  }
  result = result.replace(/\u00a0/g, ' ')
  result = result.replace(/\s+/g, ' ').trim()
  return result
}

function shuffleArray (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function stripHtml (html) {
  if (!html) return ''
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export class NewsRepository {
  async fetchNewsByTopic ({ topic, q, language, country }) {
    const query = q || topic || ''
    const searchParams = new URLSearchParams({ q: query })
    if (language && country) {
      const gl = country.toUpperCase()
      const hl = `${language}-${gl}`
      const ceid = `${gl}:${language}`
      searchParams.set('hl', hl)
      searchParams.set('gl', gl)
      searchParams.set('ceid', ceid)
    }
    const url = `${GOOGLE_NEWS_BASE}/search?${searchParams}`

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' },
      })

      if (!res.ok) {
        throw new ExternalApiError(`Erro Google News RSS: ${res.status}`)
      }

      const xml = await res.text()
      const data = xmlParser.parse(xml)
      const items = data?.rss?.channel?.item ?? []

      const articles = shuffleArray(items.map(item => this.#toArticle(item)))
      for (const a of articles) {
        if (a.id) articleCache.set(a.id, a)
      }

      return { articles }
    } catch (err) {
      if (err instanceof ExternalApiError) throw err
      throw new ExternalApiError('Falha ao consultar Google News RSS')
    }
  }

  async fetchArticleById (id) {
    const cached = articleCache.get(id)
    if (!cached) return null
    const { _sourceUrl, ...rest } = cached
    return rest
  }

  #toArticle (item) {
    const sourceName = item.source?.['#text'] || item.source || 'Desconhecido'
    const desc = decodeEntities(stripHtml(item.description || ''))
    const guid = item.guid?.['#text'] || item.guid || ''
    const id = guid || generateId()

    return {
      id,
      title: decodeEntities(item.title || 'Sem título'),
      publisher: decodeEntities(sourceName),
      publishedAt: item.pubDate || new Date().toISOString(),
      url: item.link || '',
      description: desc,
      _sourceUrl: item.source?.['@_url'] || '',
    }
  }
}
