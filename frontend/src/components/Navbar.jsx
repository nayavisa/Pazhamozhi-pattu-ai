import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const LINKS = [
  { href: '#search', label: 'AI Search' },
  { href: '#collections', label: 'Collections' },
  { href: '#story', label: 'Our Story' },
]

export default function Navbar() {
  // Solid background once the user scrolls past the hero edge so links
  // stay readable over saree imagery further down.
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
          ? 'border-b border-cream-200 bg-cream-50/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <a
          href="#top"
          className="flex items-center gap-3 text-ink-900 transition-opacity hover:opacity-80"
          aria-label="Pazhamozhi Pattu home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-600 text-white shadow-soft">
            <span className="font-display text-lg font-semibold">P</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">
              Pazhamozhi Pattu
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-500">
              Heritage Sarees
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-maroon-600"
            >
              {l.label}
            </a>
          ))}
          <a href="#search" className="btn-primary">
            <Sparkles className="h-4 w-4" />
            Try AI Search
          </a>
        </nav>

        {/* Mobile: just the CTA, links collapse to anchors that the
            footer/hero already cover. Keeps the bar uncluttered. */}
        <a href="#search" className="btn-primary md:hidden">
          <Sparkles className="h-4 w-4" />
          Try
        </a>
      </div>
    </header>
  )
}
