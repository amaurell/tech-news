const { useState, useCallback, useRef } = React

function useChat () {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      type: 'text',
      content: 'Olá! Diga-me sobre qual assunto você quer notícias e quantas deseja. Exemplo: "5 notícias de tecnologia em português"'
    }
  ])
  const [preferences, setPreferences] = useState({ language: 'pt', country: 'br' })
  const { fetchNews, fetchArticle, loading } = useNews()
  const idRef = useRef(0)

  const nextId = () => String(++idRef.current)

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: nextId(), ...msg }])
  }, [])

  const parseUserMessage = (text) => {
    const qtMatch = text.match(/\b([1-9]|1[0-9]|20)\b/)
    const quantity = qtMatch ? Number(qtMatch[1]) : 5

    const topicMap = {
      'tecnologia': 'technology', 'tech': 'technology',
      'política': 'politics', 'politica': 'politics',
      'esporte': 'sports', 'esportes': 'sports',
      'ciência': 'science', 'ciencia': 'science',
      'saúde': 'health', 'saude': 'health',
      'negócios': 'business', 'negocios': 'business',
      'entretenimento': 'entertainment',
      'mundo': 'world', 'internacional': 'world',
      'economia': 'economy', 'finanças': 'finance', 'financas': 'finance',
      'educação': 'education', 'educacao': 'education',
      'jogos': 'gaming', 'games': 'gaming',
      'música': 'music', 'musica': 'music',
      'viagem': 'travel', 'turismo': 'travel',
      'espaço': 'space', 'espaco': 'space',
      'crime': 'crime', 'segurança': 'crime', 'seguranca': 'crime',
    }

    const lower = text.toLowerCase()
    let topic = null
    for (const [pt, en] of Object.entries(topicMap)) {
      if (lower.includes(pt) || lower.includes(en)) { topic = en; break }
    }

    return { topic, quantity }
  }

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return

    addMessage({ role: 'user', type: 'text', content: text })

    const { topic, quantity } = parseUserMessage(text)

    if (!topic) {
      addMessage({
        role: 'bot', type: 'text',
        content: 'Não identifiquei o tema. Tente: "5 notícias de tecnologia", "3 de esportes", etc.'
      })
      return
    }

    addMessage({ role: 'bot', type: 'loading', content: `Buscando ${quantity} notícias de "${topic}"...` })

    const news = await fetchNews({ topic, quantity, ...preferences })

    setMessages(prev => prev.filter(m => m.type !== 'loading'))

    if (!news || news.length === 0) {
      addMessage({ role: 'bot', type: 'text', content: 'Nenhuma notícia encontrada. Tente outro tema.' })
      return
    }

    addMessage({
      role: 'bot', type: 'news-list',
      content: `Encontrei ${news.length} notícias sobre **${topic}**:`,
      news
    })
  }, [loading, preferences, addMessage, fetchNews])

  const requestArticle = useCallback(async (uuid, title) => {
    addMessage({ role: 'user', type: 'text', content: `Leia mais: "${title}"` })
    addMessage({ role: 'bot', type: 'loading', content: 'Carregando artigo completo...' })

    const article = await fetchArticle(uuid)
    setMessages(prev => prev.filter(m => m.type !== 'loading'))

    if (!article) {
      addMessage({ role: 'bot', type: 'text', content: 'Não foi possível carregar o artigo.' })
      return
    }

    addMessage({ role: 'bot', type: 'article', content: '', article })
  }, [addMessage, fetchArticle])

  return { messages, sendMessage, requestArticle, loading, preferences, setPreferences }
}
