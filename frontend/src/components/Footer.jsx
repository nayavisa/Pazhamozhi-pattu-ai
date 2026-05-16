import { Github, Instagram, Linkedin } from 'lucide-react'

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/vishnu-n-v-6916661a5/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://github.com/nayavisa/Pazhamozhi-pattu-ai', label: 'GitHub', Icon: Github },
  { href: '#', label: 'Instagram', Icon: Instagram },
]

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50/60">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-600 text-white shadow-soft">
                <span className="font-display text-lg font-semibold">P</span>
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
                Pazhamozhi Pattu
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Heritage sarees, AI-native search. Built in public from Kerala.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-ink-700 hover:text-maroon-600" href="#search">AI Search</a></li>
              <li><a className="text-ink-700 hover:text-maroon-600" href="#collections">Collections</a></li>
              <li><a className="text-ink-700 hover:text-maroon-600" href="#story">Our Story</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              Build log
            </h4>
            <p className="mt-4 text-sm text-ink-700">
              Follow the build-in-public journey:
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full
                             border border-cream-200 bg-white text-ink-700 shadow-soft
                             transition-colors hover:border-maroon-600 hover:text-maroon-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream-200 pt-6 text-xs text-ink-500 md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} Pazhamozhi Pattu. All rights reserved.</p>
          <p>
            Powered by CLIP &middot; FAISS &middot; FastAPI &middot;{' '}
            <a
              className="text-maroon-600 hover:underline"
              href="https://pazhamozhi-api.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
            >
              API docs
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
