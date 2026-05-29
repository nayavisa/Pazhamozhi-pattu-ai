import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ImagePlus,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react'
import clsx from 'clsx'

import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { searchByText, searchByImage } from '../lib/api.js'
import ResultsGrid from './ResultsGrid.jsx'

const TOP_K = 8

const EXAMPLE_QUERIES = [
  'wedding silk saree with gold zari border',
  'flamingo print for a brunch',
  'lightweight cotton-feel saree under ₹3000',
]

export default function AISearchSection({ warming }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  // Which kind of request is in flight — drives the loading copy.
  const [loadingMode, setLoadingMode] = useState(null) // 'text' | 'image' | null
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  const runTextSearch = useCallback(async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setLoadingMode('text')
    setError(null)
    try {
      setResults(await searchByText(q, TOP_K))
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
      setLoadingMode(null)
    }
  }, [])

  const runImageSearch = useCallback(async (file) => {
    if (!file || !file.type?.startsWith('image/')) {
      setError('Please drop or select an image file (jpg/png).')
      return
    }
    // Show a local preview while the request runs.
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setLoading(true)
    setLoadingMode('image')
    setError(null)
    try {
      setResults(await searchByImage(file, TOP_K))
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
      setLoadingMode(null)
    }
  }, [])

  // Allow other components (FeaturedCollections) to drop a query in.
  useEffect(() => {
    const onPick = (e) => {
      const q = e.detail?.query
      if (!q) return
      setQuery(q)
      runTextSearch(q)
      // Visual focus pulse so the user notices the input updated.
      inputRef.current?.focus({ preventScroll: true })
    }
    window.addEventListener('pp:search', onPick)
    return () => window.removeEventListener('pp:search', onPick)
  }, [runTextSearch])

  // Clean up the preview blob URL when it changes / unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

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

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  return (
    <section id="search" className="section relative">
      <div className="container-x">
        {/* Section header — v2: centred, with saffron highlight box on "AI knows". */}
        <motion.div
          {...inViewProps}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-maroon-600"
          >
            <Sparkles className="h-3.5 w-3.5" /> The AI Search
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 md:text-5xl lg:text-6xl"
          >
            Describe a saree. Drop a photo.
            <br />
            The{' '}
            <span className="relative inline-block">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-8px] bottom-1 top-3 -z-0 rounded-sm bg-saffron-500"
              />
              <span className="relative z-10">AI knows.</span>
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-700"
          >
            CLIP embeddings + FAISS over our handwoven catalog. Type a vibe, an
            occasion, or a colour story &mdash; or upload a saree you love and
            we&rsquo;ll find its sisters.
          </motion.p>
        </motion.div>

        {/* The searcher card — text + image, side-by-side on desktop. */}
        <motion.div
          {...inViewProps}
          variants={fadeUp}
          className="mt-10 overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-soft"
        >
          {warming && (
            <div
              role="status"
              className="flex items-center gap-3 border-b border-cream-200 bg-maroon-50 px-6 py-3 text-sm text-maroon-700"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Waking up the API… first request after a quiet period takes ~30 seconds.
            </div>
          )}

          <div className="grid divide-cream-200 md:grid-cols-[1.4fr_1fr] md:divide-x">
            {/* TEXT SEARCH */}
            <form onSubmit={onSubmit} className="p-6 md:p-8">
              <label
                htmlFor="pp-query"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500"
              >
                Search by words
              </label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
                <input
                  id="pp-query"
                  ref={inputRef}
                  type="text"
                  value={query}
                  placeholder="e.g. temple cotton in olive green for a morning function"
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl border border-cream-200 bg-cream-50 py-4 pl-11 pr-32
                             text-base text-ink-900 placeholder:text-ink-300
                             focus:border-maroon-600 focus:outline-none focus:ring-2 focus:ring-maroon-600/30"
                  aria-label="Search query"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={clsx(
                    'absolute right-2 top-1/2 -translate-y-1/2 btn-primary !px-5 !py-2.5 text-sm',
                    (loading || !query.trim()) && 'opacity-60'
                  )}
                >
                  {loading && loadingMode === 'text' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>Search</>
                  )}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.14em] text-ink-500">
                  Try
                </span>
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onChip(q)}
                    disabled={loading}
                    className="rounded-full border border-cream-200 bg-white px-3 py-1.5
                               text-xs font-medium text-ink-700 transition-colors
                               hover:border-maroon-600 hover:bg-maroon-50 hover:text-maroon-700
                               disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>

            {/* IMAGE SEARCH */}
            <div className="p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                Search by photo
              </span>

              <div
                role="button"
                tabIndex={loading ? -1 : 0}
                aria-busy={loadingMode === 'image'}
                aria-disabled={loading}
                onClick={() => {
                  if (!loading) fileInputRef.current?.click()
                }}
                onKeyDown={(e) => {
                  if (loading) return
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={clsx(
                  'relative mt-3 flex h-48 cursor-pointer flex-col items-center justify-center',
                  'rounded-2xl border-2 border-dashed text-center transition-all',
                  dragActive
                    ? 'border-maroon-600 bg-maroon-50 text-ink-900'
                    : 'border-cream-200 bg-cream-50 text-ink-500 hover:border-maroon-600 hover:bg-maroon-50/50',
                  loadingMode === 'image' && 'border-solid border-maroon-600 bg-maroon-50 cursor-wait',
                  loading && loadingMode !== 'image' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loadingMode === 'image' ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-maroon-600" />
                    <p className="mt-3 text-sm font-semibold text-ink-900">
                      Analyzing your image…
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      CLIP is embedding it and ranking the catalog
                    </p>
                  </>
                ) : imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Your upload"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                      aria-label="Clear uploaded image"
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center
                                 rounded-full bg-white/90 text-ink-700 shadow-soft backdrop-blur
                                 transition-colors hover:bg-white hover:text-maroon-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-maroon-600" />
                    <p className="mt-3 text-sm font-semibold text-ink-900">
                      {dragActive ? 'Drop it here' : 'Drag a saree photo'}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      or click to choose a file (jpg / png)
                    </p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status row — always-visible loading banner + error */}
        {(loading || error) && (
          <div className="mt-6 space-y-3">
            {loading && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-3 rounded-xl border border-cream-200
                           bg-maroon-50 px-4 py-3 text-sm font-medium text-ink-900"
              >
                <Loader2 className="h-4 w-4 animate-spin text-maroon-600" />
                {loadingMode === 'image'
                  ? 'Analyzing your image and finding similar sarees…'
                  : 'Searching the catalog…'}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state — shows when no search has been run yet. */}
        {!loading && !error && results.length === 0 && (
          <p className="mt-10 text-center text-sm text-ink-500">
            Run a search above &mdash; results appear here.
          </p>
        )}

        {/* Results */}
        <ResultsGrid results={results} dim={loading && results.length > 0} />
      </div>
    </section>
  )
}
