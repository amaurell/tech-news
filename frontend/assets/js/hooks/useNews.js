const { useState, useCallback } = React

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

  const fetchArticle = useCallback(async (uuid) => {
    setLoading(true)
    setError(null)
    try {
      return await ApiService.getArticle(uuid)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchNews, fetchArticle, loading, error }
}
