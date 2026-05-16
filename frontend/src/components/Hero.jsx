import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '../lib/motion.js'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-hero-glow"
    >
      {/* Decorative ornament — Malayalam letter as a watermark behind the
          headline. Heritage signal without shouting. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-10 select-none font-display
                   text-[18rem] leading-none text-maroon-600/[0.06] md:text-[26rem]"
      >
        പ
      </span>

      <div className="container-x relative pb-24 pt-16 md:pb-36 md:pt-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.span
            variants={fadeUp}
            className="eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" /> Heritage meets AI
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-display-xl font-medium text-ink-900"
          >
            Find your saree by <em className="not-italic text-maroon-600">what you mean</em>,
            not what you can spell.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700"
          >
            Pazhamozhi Pattu is a small saree house rooted in Kerala. We&rsquo;ve
            built an AI search that understands &ldquo;wedding silk with gold zari&rdquo;
            and &mdash; if you have a picture &mdash; finds the closest piece in our
            catalog.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a href="#search" className="btn-primary">
              Try the AI search
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#story" className="btn-ghost">
              Our story
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-500"
          >
            <Stat label="Sarees indexed" value="28" />
            <span aria-hidden className="hidden h-3 w-px bg-cream-200 sm:block" />
            <Stat label="Models" value="CLIP · FAISS" />
            <span aria-hidden className="hidden h-3 w-px bg-cream-200 sm:block" />
            <Stat label="Search modes" value="Text · Image" />
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
