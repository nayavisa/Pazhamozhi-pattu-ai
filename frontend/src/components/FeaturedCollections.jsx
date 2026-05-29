import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { imageSrc } from '../lib/api.js'

// v2 redesign — each tile gets its OWN solid colour background instead
// of relying on the photo + dark gradient overlay. This was the strongest
// idea from the reference design: tiles read as a row of colour swatches,
// with the saree photo sitting INSIDE the swatch as a smaller card.
//
// `text` controls heading + blurb foreground for legibility on the bg.
// `border` adds a subtle outline for the near-white kasavu tile.
const COLLECTIONS = [
  {
    title: 'Wedding silks',
    blurb: 'Heavy zari, deep colour, mandap-ready.',
    query: 'wedding silk saree with gold zari border',
    image: '/image/PP001.jpeg',
    bg: 'bg-maroon-700',
    text: 'text-white',
    sub:  'text-white/80',
    border: false,
  },
  {
    title: 'Festive silks',
    blurb: 'Bright, ceremonial, every-function ready.',
    query: 'festive silk saree with zari work',
    image: '/image/PP004.jpeg',
    bg: 'bg-saffron-500',
    text: 'text-ink-900',
    sub:  'text-ink-900/75',
    border: false,
  },
  {
    title: 'Brunch & soirée',
    blurb: 'Lightweight linen prints. Easy drape.',
    query: 'flamingo print linen saree for a brunch',
    image: '/image/PP006.jpeg',
    bg: 'bg-blush-400',
    text: 'text-ink-900',
    sub:  'text-ink-900/75',
    border: false,
  },
  {
    title: 'Everyday cottons',
    blurb: 'Block prints & batik. Light and easy.',
    query: 'block print cotton saree',
    image: '/image/PP014.jpeg',
    bg: 'bg-sage-400',
    text: 'text-ink-900',
    sub:  'text-ink-900/80',
    border: false,
  },
  {
    title: 'Heritage kasavu',
    blurb: 'Kerala traditional. The original festive white.',
    query: 'traditional Kerala kasavu saree with gold border',
    image: '/image/PP028.jpeg',
    bg: 'bg-cream-50',
    text: 'text-ink-900',
    sub:  'text-ink-700',
    border: true,
  },
]

export default function FeaturedCollections() {
  const onPick = (q) => {
    window.dispatchEvent(new CustomEvent('pp:search', { detail: { query: q } }))
    document
      .getElementById('search')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="collections" className="section bg-cream-50">
      <div className="container-x">
        {/* Section header with saffron-highlighted "doorways" */}
        <motion.div {...inViewProps} variants={stagger} className="max-w-3xl">
          <motion.span
            variants={fadeUp}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] text-maroon-600"
          >
            Curated Edits
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 md:text-5xl"
          >
            Five{' '}
            <span className="relative inline-block">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-8px] bottom-1 top-2 -z-0 rounded-sm bg-saffron-500"
              />
              <span className="relative z-10">doorways</span>
            </span>{' '}
            into the catalog.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-ink-700 md:text-lg"
          >
            Click any collection to drop its query into the AI search above and
            watch the model surface its picks.
          </motion.p>
        </motion.div>

        {/* Tile row */}
        <motion.div
          {...inViewProps}
          variants={stagger}
          className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {COLLECTIONS.map((c) => (
            <motion.button
              key={c.title}
              variants={fadeUp}
              type="button"
              onClick={() => onPick(c.query)}
              className={[
                'group relative flex h-[420px] flex-col justify-between overflow-hidden rounded-2xl p-5 text-left',
                'shadow-soft transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-lift',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-600 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50',
                c.bg,
                c.border ? 'border border-cream-200' : '',
              ].join(' ')}
            >
              {/* Inner photo card */}
              <div className="relative h-[240px] w-full overflow-hidden rounded-xl bg-white/40">
                <img
                  src={imageSrc(c.image)}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>

              {/* Copy block */}
              <div className="mt-4 flex flex-col gap-2">
                <h3
                  className={`font-display text-xl font-bold leading-tight ${c.text}`}
                >
                  {c.title}
                </h3>
                <p className={`text-[13px] leading-snug ${c.sub}`}>
                  {c.blurb}
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${c.text}`}
                >
                  Search This
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
