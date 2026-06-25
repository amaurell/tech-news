function NewsCard ({ item, onReadMore }) {
  const { title, publisher, publishedAt, uuid } = item
  return (
    <article className="news-card" aria-label={title}>
      <h3 className="news-card__title">{title}</h3>
      <footer className="news-card__meta">
        <span>{publisher}</span>
        <time dateTime={publishedAt}>{Formatters.date(publishedAt)}</time>
      </footer>
      <button
        className="news-card__btn"
        onClick={() => onReadMore(uuid, title)}
        aria-label={`Ler mais sobre: ${title}`}
      >
        Ler artigo completo →
      </button>
    </article>
  )
}
