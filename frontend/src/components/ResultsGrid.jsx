import { motion, AnimatePresence } from 'framer-motion'
import SareeCard from './SareeCard.jsx'
import { stagger } from '../lib/motion.js'

export default function ResultsGrid({ results, dim = false }) {
  if (!results || results.length === 0) return null

  return (
    <motion.section
      key={results.map((r) => r.id).join('-')}
      variants={stagger}
      initial="hidden"
      animate="visible"
      aria-label="Search results"
      className={`mt-10 transition-all duration-300 ${
        dim ? 'pointer-events-none opacity-50 blur-[1px]' : ''
      }`}
    >
      <AnimatePresence mode="popLayout">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((r) => (
            <SareeCard key={r.id} result={r} />
          ))}
        </div>
      </AnimatePresence>
    </motion.section>
  )
}
