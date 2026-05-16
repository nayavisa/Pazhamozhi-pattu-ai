import { motion } from 'framer-motion'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { imageSrc } from '../lib/api.js'

// Each card shows a real saree photo from the catalog as the background.
// Text legibility is handled by (1) a strong dark gradient floor and
// (2) a frosted backdrop panel behind the title/blurb/CTA — so the copy
// stays crisp regardless of how busy the photo behind it is.
const COLLECTIONS = [
  {
    title: 'Wedding silks',
    blurb: 'Heavy zari, deep colours, mandap-ready.',
    query: 'wedding silk saree with gold zari border',
    image: '/image/PP001.jpeg',
  },
  {
    title: 'Festive silks',
    blurb: 'Bright, ceremonial, ready for any function.',
    query: 'festive silk saree with zari work',
    image: '/image/PP004.jpeg',
  },
  {
    title: 'Brunch & soirée',
    blurb: 'Lightweight linen prints, easy to drape.',
    query: 'flamingo print linen saree for a brunch',
    image: '/image/PP006.jpeg',
  },
  {
    title: 'Everyday cottons',
    blurb: 'Block prints & batik, light and easy to drape.',
    query: 'block print cotton saree',
    image: '/image/PP014.jpeg',
  },
  {
    title: 'Heritage kasavu',
    blurb: 'Kerala traditional. The original festive white.',
    query: 'traditional Kerala kasavu saree with gold border',
    image: '/image/PP028.jpeg',
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
    <section id="collections" className="section">
      <div className="container-x">
        <motion.div {...inViewProps} variants={stagger} className="max-w-2xl">
          <motion.span variants={fadeUp} className="eyebrow">
            Curated edits
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-5 text-display-md">
            Five doorways into the catalog.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-ink-700">
            Click any collection to drop the query into the search above and
            see what the AI pulls up.
          </motion.p>
        </motion.div>

        <motion.div
          {...inViewProps}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {COLLECTIONS.map((c) => (
            <motion.button
              key={c.title}
              variants={fadeUp}
              type="button"
              onClick={() => onPick(c.query)}
              className="group relative h-80 overflow-hidden rounded-2xl border border-cream-200
                         text-left shadow-soft transition-all duration-300
                         hover:-translate-y-1 hover:shadow-lift focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-maroon-600 focus-visible:ring-offset-2
                         focus-visible:ring-offset-cream-50"
            >
              {/* Saree photo background. */}
              <img
                src={imageSrc(c.image)}
                alt={c.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover
                           transition-transform duration-700 ease-out
                           group-hover:scale-[1.06]"
              />

              {/* Strong dark gradient — much heavier than before so the
                  text panel below sits on a guaranteed-dark floor. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t
                           from-ink-900/95 via-ink-900/55 to-ink-900/15"
              />

              {/* Frosted text panel — the belt-and-braces guarantee that
                  copy is always readable, no matter how busy the photo. */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-xl bg-ink-900/65 px-5 py-4 text-white backdrop-blur-md">
                  <h3 className="font-display text-2xl font-semibold leading-tight drop-shadow">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/90">{c.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Search this
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
