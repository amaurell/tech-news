const { useState, useCallback, useRef, useEffect, createElement: h } = React

const API_BASE = '/api/news'

async function apiFetch (url, timeout = 25000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error?.message || `Erro ${res.status}`)
    return json.data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Servidor não respondeu. Tente novamente.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

const ApiService = {
  searchNews ({ topic, q, quantity = 5 }) {
    const params = new URLSearchParams()
    if (topic) params.set('topic', topic)
    if (q) params.set('q', q)
    params.set('quantity', String(quantity))
    return apiFetch(`${API_BASE}/search?${params}`)
  }
}

const STOP_WORDS = new Set([
  'noticias', 'notícias', 'sobre', 'de', 'da', 'do', 'em', 'para',
  'eu', 'quero', 'com', 'uma', 'umas', 'uns', 'os', 'as', 'no', 'na',
  'dos', 'das', 'pelo', 'pela', 'aos', 'as', 'um', 'e', 'ou', 'que',
  'me', 'por', 'mais', 'mais', 'muito', 'bem', 'se', 'como',
])

const Formatters = {
  date (isoString) {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }
}

function useNews () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      return await ApiService.searchNews(params)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchNews, loading, error }
}

function useChat () {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      type: 'text',
      content: 'Digite um assunto para buscar notícias — ex: "tecnologia", "inteligência artificial", "bolsa de valores"'
    }
  ])
  const [pendingSearch, setPendingSearch] = useState(null)
  const [fading, setFading] = useState(false)
  const { fetchNews, loading } = useNews()
  const idRef = useRef(0)

  const nextId = () => String(++idRef.current)

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: nextId(), ...msg }])
  }, [])

  const parseUserMessage = (text) => {
    const qtMatch = text.match(/\b([1-9]|1[0-9]|20)\b/)
    const quantity = qtMatch ? Number(qtMatch[1]) : null

    const topicMap = [
      ['tecnologia', 'tech', 'technology'],
      ['política', 'politica', 'político', 'politico', 'political', 'politics'],
      ['esporte', 'esportes', 'esportivo', 'sports'],
      ['ciência', 'ciencia', 'científico', 'cientifico', 'science'],
      ['saúde', 'saude', 'médico', 'medico', 'health'],
      ['negócios', 'negocios', 'business'],
      ['entretenimento', 'entretenimiento', 'entertainment'],
      ['mundo', 'internacional', 'world'],
      ['economia', 'econômico', 'economico', 'economy'],
      ['finanças', 'financas', 'financeiro', 'finance'],
      ['bolsa de valores', 'bolsa', 'mercado financeiro', 'ações', 'acoes', 'investimento', 'investimentos', 'economy'],
      ['educação', 'educacao', 'education'],
      ['jogos', 'games', 'gaming', 'videogame'],
      ['música', 'musica', 'music'],
      ['viagem', 'turismo', 'travel'],
      ['espaço', 'espaco', 'astronomia', 'space'],
      ['crime', 'segurança', 'seguranca', 'crimes'],
      ['filme', 'filmes', 'cinema', 'movies'],
      ['comida', 'culinária', 'culinaria', 'gastronomia', 'food'],
      ['moda', 'fashion'],
      ['carro', 'carros', 'veículos', 'veiculos', 'vehicles'],
      ['futebol', 'soccer'],
      ['meio ambiente', 'ambiente', 'natureza', 'clima', 'environment'],
      ['energia', 'energy'],
      ['robótica', 'robotica', 'robotics'],
      ['educação online', 'ead', 'online education'],
    ]

    const specificTerms = [
      { keywords: ['sp500', 's&p500', 'sp 500'], topic: 'general', q: 'sp500' },
      { keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'criptomoeda', 'cripto'], topic: 'general', q: null },
      { keywords: ['nvidia', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla'], topic: 'technology', q: null },
      { keywords: ['petróleo', 'petroleo', 'ouro', 'dolar', 'dólar'], topic: 'business', q: null },
    ]

    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let topic = null
    let q = null

    for (const entry of specificTerms) {
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) {
          topic = entry.topic
          if (entry.q) { q = entry.q; break }
          break
        }
      }
      if (q) break
    }

    if (!q) {
      for (const group of topicMap) {
        for (const word of group) {
          if (lower.includes(word)) { topic = group[group.length - 1]; break }
        }
        if (topic) break
      }
    }

    let cleaned = text
      .replace(/\b([1-9]|1[0-9]|20)\b/g, '')
      .replace(/[^\w\sÀ-ÿ]/g, ' ')
    cleaned = cleaned.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w.toLowerCase())).join(' ')
    const userQ = cleaned || text.replace(/\b([1-9]|1[0-9]|20)\b/g, '').trim()

    if (!q) q = userQ

    return { topic, q, quantity }
  }

  const executeSearch = useCallback(async (topic, quantity, q) => {
    const label = q || topic || ''
    addMessage({ role: 'bot', type: 'loading', content: `Buscando ${quantity} notícias sobre "${label}"...` })

    const news = await fetchNews({ topic, q, quantity })

    setMessages(prev => prev.filter(m => m.type !== 'loading'))

    if (!news || news.length === 0) {
      addMessage({ role: 'bot', type: 'text', content: `Nenhuma notícia encontrada para "${label}". Tente outro termo.` })
      return
    }

    addMessage({
      role: 'bot', type: 'news-list',
      content: `Encontrei ${news.length} notícias sobre **${label}**:`,
      news
    })
  }, [addMessage, fetchNews])

  const confirmQuantity = useCallback(async (quantity) => {
    const search = pendingSearch
    setPendingSearch(null)
    if (search) await executeSearch(search.topic, quantity, search.q)
  }, [pendingSearch, executeSearch])

  const cancelQuantity = useCallback(() => {
    setPendingSearch(null)
  }, [])

  const lastQueryRef = useRef(null)
  const autoIntervalRef = useRef(null)
  const msgCountRef = useRef(0)
  const [autoOn, setAutoOn] = useState(false)

  const clearMessages = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current)
      autoIntervalRef.current = null
    }
    setAutoOn(false)
    setMessages([{ id: 'welcome', role: 'bot', type: 'text', content: 'Digite um assunto para buscar notícias — ex: "tecnologia", "inteligência artificial", "bolsa de valores"' }])
  }, [])

  const resetMessages = useCallback(() => {
    setMessages([{ id: 'welcome', role: 'bot', type: 'text', content: 'Digite um assunto para buscar notícias — ex: "tecnologia", "inteligência artificial", "bolsa de valores"' }])
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return
    addMessage({ role: 'user', type: 'text', content: text })
    const { topic, q, quantity } = parseUserMessage(text)
    if (!topic && !q) {
      addMessage({ role: 'bot', type: 'text', content: 'Digite um assunto, como "tecnologia", "inteligência artificial", "bolsa de valores", etc.' })
      return
    }
    lastQueryRef.current = { topic, q }
    if (quantity) {
      await executeSearch(topic, quantity, q)
    } else {
      setPendingSearch({ topic, q })
    }
  }, [loading, addMessage, executeSearch])

  useEffect(() => {
    msgCountRef.current = messages.length
  }, [messages])

  const toggleAuto = useCallback(() => {
    if (autoOn) {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current)
        autoIntervalRef.current = null
      }
      setAutoOn(false)
    } else {
      const last = lastQueryRef.current
      if (!last || (!last.topic && !last.q)) return
      setAutoOn(true)

      const run = async () => {
        const count = msgCountRef.current
        const staggerMs = 1000
        const fadeDurationMs = 1000
        setFading(true)
        await new Promise(r => setTimeout(r, count * staggerMs + 100))
        resetMessages()
        await executeSearch(last.topic, 5, last.q)
        setFading(false)
      }
      run()
      autoIntervalRef.current = setInterval(run, 60000)
    }
  }, [autoOn, clearMessages, executeSearch])

  return { messages, sendMessage, confirmQuantity, cancelQuantity, clearMessages, autoOn, toggleAuto, fading, loading, pendingSearch }
}

function NewsCard ({ item, onRead }) {
  const { title, publisher, publishedAt, description } = item
  const snippet = description
    ? (description.length > 120 ? description.slice(0, 120) + '...' : description)
    : ''

  return h('article', { className: 'news-card', 'aria-label': title },
    h('h3', { className: 'news-card__title' }, title),
    snippet && h('p', { className: 'news-card__snippet' }, snippet),
    h('footer', { className: 'news-card__meta' },
      h('span', null, publisher),
      h('time', { dateTime: publishedAt }, Formatters.date(publishedAt))
    ),
    h('button', {
      className: 'news-card__btn',
      onClick: () => onRead(item),
      'aria-label': `Ler artigo: ${title}`
    }, 'Abrir no site original →')
  )
}

function MessageItem ({ message, onReadArticle, fading, style }) {
  const isUser = message.role === 'user'
  const cls = `message message--${isUser ? 'user' : 'bot'}${fading ? ' message--fade-out' : ''}`

  if (message.type === 'loading') {
    return h('div', { className: cls, style, 'aria-live': 'polite', 'aria-busy': 'true' },
      h('span', { className: 'message__bubble message__bubble--loading' },
        h('span', { className: 'dot-pulse', 'aria-hidden': 'true' }),
        message.content
      )
    )
  }

  if (message.type === 'news-list') {
    return h('div', { className: cls, style },
      h('p', { className: 'message__bubble' }, message.content),
      h('div', { className: 'news-list', role: 'list' },
        message.news.map((item, i) =>
          h(NewsCard, { key: item.url || i, item, onRead: onReadArticle })
        )
      )
    )
  }

  return h('div', { className: cls, style },
    h('p', { className: 'message__bubble' }, message.content)
  )
}

function MessageList ({ messages, onReadArticle, fading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return h('div', { className: `chat-window__messages${fading ? ' chat-window__messages--fading' : ''}`, role: 'log', 'aria-live': 'polite', 'aria-label': 'Mensagens' },
    messages.map((msg, i) =>
      h(MessageItem, {
        key: msg.id,
        message: msg,
        onReadArticle,
        fading,
        style: { animationDelay: `${i * 1000}ms` }
      })
    ),
    h('div', { ref: bottomRef })
  )
}

function InputBar ({ onSend, disabled }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = () => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return h('div', { className: 'input-bar', role: 'form', 'aria-label': 'Enviar mensagem' },
    h('input', {
      ref: inputRef,
      className: 'input-bar__field',
      type: 'text',
      value: text,
      onChange: e => setText(e.target.value),
      onKeyDown: handleKey,
      placeholder: 'Ex: 3 notícias de inteligência artificial...',
      disabled,
      'aria-label': 'Campo de mensagem',
      maxLength: 200,
      autoComplete: 'off'
    }),
    h('button', {
      className: 'input-bar__btn',
      onClick: handleSubmit,
      disabled: disabled || !text.trim(),
      'aria-label': 'Enviar'
    }, 'Enviar')
  )
}

const QUANTITY_OPTIONS = [1, 3, 5, 10, 15, 20]

function QuantityModal ({ topic, q, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(5)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return h('div', { className: 'modal-overlay', onClick: onCancel, role: 'dialog', 'aria-modal': 'true' },
    h('div', { className: 'qty-modal', onClick: e => e.stopPropagation() },
      h('p', { className: 'qty-modal__label' }, `Quantas notícias${q ? ` sobre "${q}"` : ` de "${topic}"`} você quer?`),
      h('div', { className: 'qty-modal__options' },
        QUANTITY_OPTIONS.map(n =>
          h('button', {
            key: n,
            className: `qty-modal__btn ${selected === n ? 'qty-modal__btn--active' : ''}`,
            onClick: () => setSelected(n)
          }, String(n))
        )
      ),
      h('button', { className: 'qty-modal__go', onClick: () => onConfirm(selected) },
        `Buscar ${selected} notícias`
      )
    )
  )
}

function ChatWindow ({ messages, onSendMessage, loading, pendingSearch, onConfirmQuantity, onCancelQuantity, onReadArticle, onClearMessages, autoOn, onToggleAuto, fading }) {
  return h('div', { className: 'chat-window' },
    h('header', { className: 'chat-window__header' },
      h('div', { className: 'chat-window__header-row' },
        h('h1', null, 'NewsChat'),
        h('div', { className: 'chat-window__actions' },
          h('button', {
            className: `chat-window__auto ${autoOn ? 'chat-window__auto--on' : 'chat-window__auto--off'}`,
            onClick: onToggleAuto,
            title: autoOn ? 'Desligar atualização automática (1 min)' : 'Atualizar notícias automaticamente a cada 1 minuto',
            'aria-label': 'Atualização automática'
          }, autoOn ? '● Auto ON' : '○ Auto OFF'),
          h('button', {
            className: 'chat-window__clear',
            onClick: onClearMessages,
            title: 'Limpar conversa',
            'aria-label': 'Limpar conversa'
          }, 'Limpar news')
        )
      ),
      h('p', null, 'Digite um assunto para buscar notícias')
    ),
    h(MessageList, { messages, onReadArticle, fading }),
    h(InputBar, { onSend: onSendMessage, disabled: loading }),
    pendingSearch && h(QuantityModal, { topic: pendingSearch.topic, q: pendingSearch.q, onConfirm: onConfirmQuantity, onCancel: onCancelQuantity })
  )
}

function App () {
  const { messages, sendMessage, confirmQuantity, cancelQuantity, clearMessages, autoOn, toggleAuto, fading, loading, pendingSearch } = useChat()

  const onReadArticle = useCallback((item) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener')
    }
  }, [])

  return h(ChatWindow, { messages, onSendMessage: sendMessage, loading, pendingSearch, onConfirmQuantity: confirmQuantity, onCancelQuantity: cancelQuantity, onReadArticle, onClearMessages: clearMessages, autoOn, onToggleAuto: toggleAuto, fading })
}

const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement)
root.render(h(App))
