import { motion } from 'framer-motion'
import { useState } from 'react'
import { formatPrice, imageSrc } from '../lib/api.js'
import { fadeUp } from '../lib/motion.js'

export default function SareeCard({ result }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="card group"
    >
      {/* Image with shimmer placeholder while loading. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream-100">
        {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
        <img
          src={imageSrc(result.image_url)}
          alt={result.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-500
                      group-hover:scale-[1.04] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Similarity badge — top-right. */}
        <span
          className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1
                     text-[11px] font-semibold uppercase tracking-wide text-maroon-700
                     shadow-soft backdrop-blur"
          title={`Cosine similarity: ${result.score.toFixed(3)}`}
        >
          {(result.score * 100).toFixed(0)}% match
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          {result.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-500">
          {result.fabric} &middot; {result.occasion}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-maroon-600">
            {formatPrice(result.price)}
          </span>
          <span className="text-xs text-ink-500">#{result.id}</span>
        </div>
      </div>
    </motion.article>
  )
}
