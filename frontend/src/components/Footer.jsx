import { Github, Instagram, Linkedin } from 'lucide-react'

// v2 redesign — dark ink footer, multi-column layout, saffron column
// headers so they pop on the dark ground. Built to mirror the
// reference's footer architecture: brand block left, link columns
// across, copyright + socials in the bottom row.
const SOCIAL = [
  {
    href: 'https://www.linkedin.com/in/vishnu-n-v-6916661a5/',
    label: 'LinkedIn',
    Icon: Linkedin,
  },
  {
    href: 'https://github.com/nayavisa/Pazhamozhi-pattu-ai',
    label: 'GitHub',
    Icon: Github,
  },
  { href: '#', label: 'Instagram', Icon: Instagram },
]

const COLUMNS = [
  {
    head: 'Shop',
    items: [
      { label: 'Wedding silks',     href: '#collections' },
      { label: 'Festive silks',     href: '#collections' },
      { label: 'Everyday cottons',  href: '#collections' },
      { label: 'Heritage kasavu',   href: '#collections' },
    ],
  },
  {
    head: 'Discover',
    items: [
      { label: 'AI Search',         href: '#search' },
      { label: 'Collections',       href: '#collections' },
      { label: 'Brand journal',     href: '#story' },
      { label: 'Heritage notes',    href: '#story' },
    ],
  },
  {
    head: 'Support',
    items: [
      { label: 'Sizing & drape',    href: '#story' },
      { label: 'Care guide',        href: '#story' },
      { label: 'Shipping & returns', href: '#story' },
      { label: 'Contact',           href: '#story' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-100">
      <div className="container-x py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-16">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full
                           bg-saffron-500 text-ink-900"
              >
                <span className="font-display text-lg font-bold">P</span>
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Pazhamozhi Pattu
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-200/80">
              Proverbial silks for the modern wardrobe. Handwoven from Kerala.
              AI-curated for you. Built in public, one feature at a time.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.head}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.28em] text-saffron-500">
                {col.head}
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      className="text-cream-200/80 transition-colors hover:text-saffron-500"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-14 h-px w-full bg-cream-100/10" />

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-cream-200/60 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} Pazhamozhi Pattu · Made in Kerala ·
            AI by CLIP + FAISS
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full
                           border border-cream-100/15 text-cream-200/80
                           transition-colors hover:border-saffron-500 hover:text-saffron-500"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
