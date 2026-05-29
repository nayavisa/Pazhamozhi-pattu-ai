import { motion } from 'framer-motion'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { imageSrc } from '../lib/api.js'

// v2 redesign — split layout (text + image with a saffron decorative
// shape sitting behind it). The body copy leans into "Pazhamozhi Pattu
// = proverbial silk" rather than a pillar grid, which felt more
// brand-led and matched the reference's editorial vibe better.
export default function BrandStory() {
  return (
    <section id="story" className="section bg-cream-100/70">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ---------- LEFT: copy ---------- */}
          <motion.div
            {...inViewProps}
            variants={stagger}
            className="max-w-xl"
          >
            <motion.span
              variants={fadeUp}
              className="text-[11px] font-semibold uppercase tracking-[0.32em] text-maroon-600"
            >
              Our Story
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 md:text-5xl lg:text-6xl"
            >
              Old proverb,
              <br />
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-10px] bottom-1 top-3 -z-0 rounded-sm bg-saffron-500"
                />
                <span className="relative z-10">new wardrobe.</span>
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-7 text-lg leading-relaxed text-ink-700"
            >
              Pazhamozhi Pattu (പഴമൊഴി പട്ടു) means &lsquo;proverbial silk&rsquo;
              &mdash; the wisdom of grandmothers, woven into a saree. Every piece in our
              catalog is handpicked from Kerala and across South India: kasavu from
              Balaramapuram, silks from Kanchipuram, breezy cottons from local
              block-print artisans. The AI is just the door &mdash; what&rsquo;s
              behind it has been hand-woven for centuries.
            </motion.p>

            <motion.a
              variants={fadeUp}
              href="https://www.linkedin.com/in/vishnu-n-v-6916661a5/"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center text-sm font-semibold text-maroon-600 underline-offset-4 hover:underline"
            >
              Follow the build-in-public journey →
            </motion.a>
          </motion.div>

          {/* ---------- RIGHT: image + saffron decorative shape ---------- */}
          <motion.div
            {...inViewProps}
            variants={fadeUp}
            className="relative h-[440px] md:h-[500px]"
          >
            {/* Back layer — saffron square offset down-left */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[88%] w-[80%] rounded-2xl bg-saffron-500"
            />
            {/* Front layer — image card offset up-right */}
            <div className="absolute right-0 top-0 h-[88%] w-[80%] overflow-hidden rounded-2xl bg-maroon-700 shadow-lift">
              <img
                src={imageSrc('/image/PP002.jpeg')}
                alt="Heritage saree photography"
                width="560"
                height="500"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
