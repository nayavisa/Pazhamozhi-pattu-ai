import { motion } from 'framer-motion'
import { Heart, ScanSearch, Languages } from 'lucide-react'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'

const PILLARS = [
  {
    icon: Heart,
    title: 'Heritage first',
    body: 'Every saree is sourced from weavers we know by name. The brand carries forward the stories — pazhamozhi means old saying — that the looms have been telling for generations.',
  },
  {
    icon: ScanSearch,
    title: 'AI that respects fabric',
    body: 'The search doesn\u2019t just match keywords. It understands fabric, occasion, and aesthetic, so &ldquo;temple cotton for a morning function&rdquo; lands you exactly there.',
  },
  {
    icon: Languages,
    title: 'Built for India\u2019s buyers',
    body: 'Soon: Malayalam and Tamil descriptions, WhatsApp-native shopping, and visual try-ons. The future of saree shopping shouldn\u2019t feel like a 2015 web form.',
  },
]

export default function BrandStory() {
  return (
    <section id="story" className="section bg-white/60">
      <div className="container-x">
        <motion.div {...inViewProps} variants={stagger} className="max-w-3xl">
          <motion.span variants={fadeUp} className="eyebrow">
            Pazhamozhi Pattu — പഴമൊഴി പട്ടു
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-5 text-display-lg">
            A saree house, run by an engineer.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-ink-700">
            We&rsquo;re a small heritage brand built on two convictions: that the
            sarees our weavers make deserve a story, and that the way India
            shops for them deserves a serious upgrade. Pazhamozhi Pattu pairs
            traditional craftsmanship with modern, AI-native retail &mdash; built in
            public, one feature at a time.
          </motion.p>
        </motion.div>

        <motion.div
          {...inViewProps}
          variants={stagger}
          className="mt-14 grid gap-8 md:grid-cols-3"
        >
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="rounded-2xl border border-cream-200 bg-cream-50/80 p-6 shadow-soft"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-maroon-600/10 text-maroon-600">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">
                {p.title}
              </h3>
              <p
                className="mt-3 text-[15px] leading-relaxed text-ink-700"
                // Allows the &ldquo;quoted&rdquo; chars in the second pillar.
                dangerouslySetInnerHTML={{ __html: p.body }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
