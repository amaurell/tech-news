const API_BASE = '/api/news'

const ApiService = {
  async searchNews ({ topic, quantity = 5, language = 'pt', country = 'br' }) {
    const params = new URLSearchParams({ topic, quantity, language, country })
    const res = await fetch(`${API_BASE}/search?${params}`)
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    const json = await res.json()
    return json.data
  },

  async getArticle (uuid) {
    const params = new URLSearchParams()
    params.set('uuid', uuid)
    const res = await fetch(`${API_BASE}/article?${params}`)
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    const json = await res.json()
    return json.data
  }
}
