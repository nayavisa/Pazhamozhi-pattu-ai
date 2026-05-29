import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '../lib/motion.js'
import { imageSrc } from '../lib/api.js'

// Hero v2 — adapted from the Figma redesign.
// Two-column layout: white copy card on the left with the saffron
// highlight-box treatment on "find you.", maroon image card on the
// right with a saffron AI-MATCHED sticker. Stats sit beneath the copy
// card so the hero still doubles as a credibility row.
export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-cream-50"
    >
      {/* Faint Malayalam letter — retained as the heritage watermark. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 top-8 select-none font-display
                   text-[18rem] leading-none text-maroon-600/[0.05] md:text-[24rem]"
      >
        പ
      </span>

      <div className="container-x relative pb-20 pt-10 md:pb-28 md:pt-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-8 lg:grid-cols-2"
        >
          {/* ---------- LEFT: copy card ---------- */}
          <motion.div
            variants={fadeUp}
            className="relative rounded-3xl bg-white p-8 shadow-soft md:p-12 lg:p-14"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-maroon-600">
              Kerala · Handwoven · AI-Curated
            </span>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl">
              Sarees that{' '}
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-6px] bottom-1 top-3 -z-0 rounded-sm bg-saffron-500"
                />
                <span className="relative z-10">find you.</span>
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-700">
              Upload a saree photo, type a vibe, or describe an occasion. Our AI
              matches you to handwoven Kerala kasavu, festive silks, and breezy
              cottons from our catalog.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="#search"
                className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-4
                           text-[12px] font-bold uppercase tracking-[0.18em] text-white
                           shadow-soft transition-all hover:bg-ink-700 hover:shadow-lift
                           active:scale-[0.98]"
              >
                Try the AI Search
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#collections"
                className="text-sm font-semibold text-maroon-600 underline-offset-4 hover:underline"
              >
                Browse collections →
              </a>
            </div>

            {/* Stat row — kept from v1, the credibility line still earns its keep. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-cream-200 pt-7 text-sm text-ink-500">
              <Stat label="Sarees indexed" value="28" />
              <span aria-hidden className="hidden h-3 w-px bg-cream-200 sm:block" />
              <Stat label="Models" value="CLIP · FAISS" />
              <span aria-hidden className="hidden h-3 w-px bg-cream-200 sm:block" />
              <Stat label="Search modes" value="Text · Image" />
            </div>
          </motion.div>

          {/* ---------- RIGHT: image card + sticker ---------- */}
          <motion.div
            variants={fadeUp}
            className="relative h-[480px] overflow-hidden rounded-3xl bg-maroon-700 shadow-soft md:h-[600px] lg:h-[640px]"
          >
            <img
              src={imageSrc('/image/PP028.jpeg')}
              alt="Heritage Kerala kasavu saree — white with gold border"
              width="640"
              height="640"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />

            {/* Saffron AI-MATCHED sticker — pinned top-right */}
            <div
              className="absolute right-5 top-5 flex h-32 w-32 flex-col items-center justify-center
                         rounded-full bg-saffron-500 text-center font-display text-ink-900 shadow-soft
                         md:right-7 md:top-7 md:h-36 md:w-36"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] leading-tight">
                AI-Matched
              </span>
              <span className="mt-1 font-display text-2xl font-bold leading-none">
                &lt; 2s
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em]">
                Every Time
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-semibold text-ink-900">
        {value}
      </span>
      <span className="text-xs uppercase tracking-[0.18em] text-ink-500">
        {label}
      </span>
    </div>
  )
}
