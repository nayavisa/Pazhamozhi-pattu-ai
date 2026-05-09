import { useState, useEffect, useRef, useCallback } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://pazhamozhi-api.onrender.com'

const EXAMPLE_QUERIES = [
  'wedding silk saree with gold zari border',
  'flamingo print for a brunch',
  'lightweight cotton-feel saree under ₹3000',
]

const TOP_K = 8

function formatPrice(p) {
  return `₹${Number(p).toLocaleString('en-IN')}`
}

function ResultCard({ result }) {
  return (
    <article className="card">
      <img
        className="card__image"
        src={`${API_URL}${result.image_url}`}
        alt={result.name}
        loading="lazy"
      />
      <div className="card__body">
        <h3 className="card__name">{result.name}</h3>
        <p className="card__meta">
          {result.fabric} · {result.occasion}
        </p>
        <div className="card__row">
          <span className="card__price">{formatPrice(result.price)}</span>
          <span
            className="card__score"
            title={`Cosine similarity: ${result.score.toFixed(3)}`}
          >
            {(result.score * 100).toFixed(0)}% match
          </span>
        </div>
      </div>
    </article>
  )
}

function ResultsGrid({ results }) {
  if (results.length === 0) return null
  return (
    <section className="grid" aria-label="Search results">
      {results.map((r) => (
        <ResultCard key={r.id} result={r} />
      ))}
    </section>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [warming, setWarming] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Pre-warm the Render free-tier dyno so the first user search isn't
  // a 30-second wait. /health is cheap and triggers the cold-start.
  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/health`)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWarming(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runTextSearch = useCallback(async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/search/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, top_k: TOP_K }),
      })
      if (!res.ok) throw new Error(`Search failed (${res.status})`)
      setResults(await res.json())
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const runImageSearch = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please drop or select an image file (jpg/png).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('top_k', String(TOP_K))
      const res = await fetch(`${API_URL}/search/image`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Image search failed (${res.status})`)
      setResults(await res.json())
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    runTextSearch(query)
  }

  const onChip = (q) => {
    setQuery(q)
    runTextSearch(q)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) runImageSearch(f)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) runImageSearch(f)
    // Reset so re-uploading the same file fires onChange again.
    e.target.value = ''
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Pazhamozhi Pattu — AI Search</h1>
        <p className="subtitle">
          Search the saree catalog by what you mean, or by a picture.
        </p>
      </header>

      {warming && (
        <div className="banner" role="status">
          Waking up the API… first request can take up to 30 seconds.
        </div>
      )}

      <form className="search" onSubmit={onSubmit}>
        <input
          className="search__input"
          type="text"
          placeholder="e.g. wedding silk with gold border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search query"
        />
        <button
          className="search__button"
          type="submit"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="chips" aria-label="Example queries">
        <span className="chips__label">Try:</span>
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            className="chip"
            type="button"
            onClick={() => onChip(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      <div
        className={`dropzone ${dragActive ? 'dropzone--active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload a saree image to search by photo"
      >
        <p className="dropzone__title">
          {dragActive ? 'Drop the image to search' : 'Drag a saree photo here'}
        </p>
        <p className="dropzone__hint">or click to choose a file</p>
        <input
          ref={fileInputRef}
          className="dropzone__input"
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {loading && results.length === 0 && (
        <div className="loading">Searching the catalog…</div>
      )}

      <ResultsGrid results={results} />

      <footer className="footer">
        Powered by CLIP + FAISS ·{' '}
        <a
          href="https://github.com/nayavisa/Pazhamozhi-pattu-ai"
          target="_blank"
          rel="noreferrer"
        >
          source
        </a>
      </footer>
    </div>
  )
}
