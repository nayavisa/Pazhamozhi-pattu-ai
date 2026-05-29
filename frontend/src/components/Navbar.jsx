import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

// v2 redesign: streamlined navbar inspired by the highlight-box /
// pill-CTA layout from the Figma mockup. Links sit in the middle,
// the ink-black "Try the AI Search" pill anchors the right edge.
const LINKS = [
  { href: '#collections', label: 'Collections' },
  { href: '#search',      label: 'AI Search'   },
  { href: '#story',       label: 'Heritage'    },
]

export default function Navbar() {
  // Solid background once scrolled past hero edge so links stay readable
  // over saree imagery further down.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-cream-200 bg-cream-50/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        {/* Brand mark */}
        <a
          href="#top"
          className="flex items-center gap-3 text-ink-900 transition-opacity hover:opacity-80"
          aria-label="Pazhamozhi Pattu home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full
                       bg-maroon-600 text-white shadow-soft"
          >
            <span className="font-display text-base font-semibold">P</span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Pazhamozhi Pattu
          </span>
        </a>

        {/* Center links */}
        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium uppercase tracking-[0.18em] text-ink-900
                         transition-colors hover:text-maroon-600"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: ink pill CTA */}
        <a
          href="#search"
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5
                     text-[12px] font-semibold uppercase tracking-[0.16em] text-white
                     shadow-soft transition-all hover:bg-ink-700 hover:shadow-lift
                     active:scale-[0.98]"
        >
          Try the AI Search
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  )
}
