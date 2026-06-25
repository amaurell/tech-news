function MessageItem ({ message, onReadMore }) {
  const isUser = message.role === 'user'
  const cls = `message message--${isUser ? 'user' : 'bot'}`

  if (message.type === 'loading') {
    return (
      <div className={cls} aria-live="polite" aria-busy="true">
        <span className="message__bubble message__bubble--loading">
          <span className="dot-pulse" aria-hidden="true"></span>
          {message.content}
        </span>
      </div>
    )
  }

  if (message.type === 'news-list') {
    return (
      <div className={cls}>
        <p className="message__bubble">{message.content}</p>
        <div className="news-list" role="list">
          {message.news.map(item => (
            <NewsCard key={item.uuid} item={item} onReadMore={onReadMore} />
          ))}
        </div>
      </div>
    )
  }

  if (message.type === 'article') {
    const { article } = message
    return (
      <div className={`${cls} message--article`}>
        <div className="article-view">
          <h2 className="article-view__title">{article.title}</h2>
          <div className="article-view__meta">
            <span>{article.publisher}</span>
            <time dateTime={article.publishedAt}>{Formatters.date(article.publishedAt)}</time>
          </div>
          <p className="article-view__body">{article.body}</p>
          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="article-view__link"
              aria-label="Abrir artigo original em nova aba"
            >
              Ver fonte original ↗
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cls}>
      <p className="message__bubble">{message.content}</p>
    </div>
  )
}
